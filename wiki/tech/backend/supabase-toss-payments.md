# Supabase + Toss Payments 연동

> 모든 금액 계산과 검증은 서버에서 — Supabase Edge Function + PostgreSQL 트랜잭션으로 결제 위변조·중복·Race Condition을 방어하는 완전한 구현 패턴.

## 핵심 내용

### 전체 흐름

```
클라이언트              서버 (Edge Function)        Toss API
    │                          │                       │
    │ productId + couponCode   │                       │
    │─────────────────────────▶│                       │
    │                          │ 원가 조회              │
    │                          │ 쿠폰 검증              │
    │                          │ final_amount 계산      │
    │                          │ DB 저장 (pending)      │
    │ orderId + finalAmount    │                       │
    │◀─────────────────────────│                       │
    │                          │                       │
    │ Toss 위젯으로 결제        │                       │
    │──────────────────────────────────────────────────▶│
    │ paymentKey + orderId + amount                    │
    │─────────────────────────▶│                       │
    │                          │ DB 금액 검증           │
    │                          │ Toss 승인 API 호출     │
    │                          │──────────────────────▶│
    │                          │ DB paid 업데이트        │
    │ 최종 결과                 │                       │
    │◀─────────────────────────│                       │
```

---

### DB 설계

```sql
-- 주문 테이블
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users,

  original_amount INTEGER NOT NULL,   -- 원래 상품 가격
  discount_amount INTEGER DEFAULT 0,  -- 할인 금액
  final_amount    INTEGER NOT NULL,   -- 실제 결제 금액 (검증 기준!)

  coupon_id   UUID REFERENCES coupons,
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending','paid','failed','expired','cancelled')),

  payment_key TEXT,
  paid_at     TIMESTAMPTZ,
  expires_at  TIMESTAMPTZ DEFAULT now() + INTERVAL '30 minutes',
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- 쿠폰 테이블
CREATE TABLE coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  discount_rate    INTEGER,   -- 비율 할인 (30 = 30%)
  discount_amount  INTEGER,   -- 고정 할인액
  min_order_amount INTEGER,   -- 최소 주문 금액
  max_discount_amount INTEGER, -- 최대 할인 한도
  expires_at TIMESTAMPTZ,
  is_used BOOLEAN DEFAULT false,
  used_by UUID REFERENCES auth.users
);
```

---

### 주문 생성 API — 서버에서 금액 계산

클라이언트는 `productId + couponCode`만 전달. 서버가 모든 금액을 계산.

```typescript
// supabase/functions/create-order/index.ts
const { productId, couponCode } = await req.json()

// 1. 원가 서버에서 직접 조회 (클라이언트 금액 신뢰 X)
const { data: product } = await supabase
  .from('products').select('price').eq('id', productId).single()

// 2. 쿠폰 검증 (서버에서만!)
if (couponCode) {
  const { data: coupon } = await supabase
    .from('coupons').select('*').eq('code', couponCode).single()

  if (!coupon)                                  throw new Error('존재하지 않는 쿠폰')
  if (coupon.is_used)                           throw new Error('이미 사용된 쿠폰')
  if (coupon.expires_at < new Date())           throw new Error('만료된 쿠폰')
  if (coupon.min_order_amount > originalAmount) throw new Error('최소 주문금액 미충족')

  // 비율/고정 할인, 최대 한도 적용
  discountAmount = coupon.discount_rate
    ? Math.min(
        Math.floor(originalAmount * coupon.discount_rate / 100),
        coupon.max_discount_amount ?? Infinity
      )
    : coupon.discount_amount
}

// 3. final_amount 서버가 직접 계산 → DB에 저장 (이 값이 검증 기준)
const finalAmount = originalAmount - discountAmount
await supabase.from('orders').insert({ order_id, original_amount, discount_amount, final_amount, ... })

return { orderId, finalAmount }
```

---

### 결제 검증 & 승인 — PostgreSQL 트랜잭션

**트랜잭션이 필요한 이유**:

| 문제 | 원인 | 해결 |
|---|---|---|
| 중복 결제 | 버튼 2번 클릭 동시 요청 | `FOR UPDATE` 락으로 동시 접근 차단 |
| 쿠폰 중복 사용 | 두 주문이 같은 쿠폰 사용 | 원자적 처리 |
| 부분 실패 | DB 업데이트 중 서버 다운 | 하나라도 실패 시 전체 롤백 |

```sql
CREATE OR REPLACE FUNCTION confirm_payment(
  p_order_id TEXT, p_payment_key TEXT, p_amount INTEGER
) RETURNS JSON AS $$
DECLARE v_order orders%ROWTYPE;
BEGIN
  -- FOR UPDATE로 행 락 → Race Condition 방지
  SELECT * INTO v_order FROM orders
  WHERE order_id = p_order_id FOR UPDATE;

  IF NOT FOUND                         THEN RAISE EXCEPTION '주문 없음'; END IF;
  IF v_order.final_amount != p_amount  THEN RAISE EXCEPTION '금액 불일치'; END IF;
  IF v_order.status != 'pending'       THEN RAISE EXCEPTION '이미 처리된 주문: %', v_order.status; END IF;

  UPDATE orders SET status = 'paid', payment_key = p_payment_key, paid_at = now()
  WHERE order_id = p_order_id;

  -- 쿠폰 사용 처리 (같은 트랜잭션!)
  IF v_order.coupon_id IS NOT NULL THEN
    UPDATE coupons SET is_used = true WHERE id = v_order.coupon_id;
  END IF;

  RETURN json_build_object('success', true);
EXCEPTION WHEN OTHERS THEN RAISE; -- 하나라도 실패 시 전체 롤백
END;
$$ LANGUAGE plpgsql;
```

```typescript
// Edge Function
const { error } = await supabase.rpc('confirm_payment', {
  p_order_id: orderId, p_payment_key: paymentKey, p_amount: amount,
})
if (error) return errorResponse(error.message)

// Toss 승인 API (트랜잭션 밖 — 외부 API는 포함 불가)
const tossResponse = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
  method: 'POST',
  headers: { Authorization: `Basic ${btoa(secretKey + ':')}` },
  body: JSON.stringify({ paymentKey, orderId, amount }),
})

// Toss 실패 시 보상 트랜잭션으로 DB 롤백
if (!tossResponse.ok) {
  await supabase.from('orders').update({ status: 'pending' }).eq('order_id', orderId)
  return errorResponse('결제 승인 실패')
}
```

> **보상 트랜잭션(Compensating Transaction)**: 외부 API는 DB 트랜잭션 안에 포함할 수 없으므로, 실패 시 DB를 수동으로 되돌리는 별도 처리가 필요하다. 분산 시스템에서 트랜잭션이 어려운 이유.

---

### Pending 만료 처리

pending 방치 시 문제: 쿠폰이 묶임, 재고가 묶임, 데이터 오염.

```sql
-- 만료 처리 함수
CREATE OR REPLACE FUNCTION cleanup_expired_orders() RETURNS void AS $$
BEGIN
  UPDATE orders SET status = 'expired'
  WHERE status = 'pending' AND expires_at < now();

  -- 쿠폰 연결 해제 (재사용 가능하게)
  UPDATE coupons SET is_used = false
  WHERE id IN (
    SELECT coupon_id FROM orders
    WHERE status = 'expired' AND coupon_id IS NOT NULL
  );
END;
$$ LANGUAGE plpgsql;

-- 10분마다 자동 실행 (pg_cron)
SELECT cron.schedule('cleanup-expired-orders', '*/10 * * * *',
  'SELECT cleanup_expired_orders()');
```

**Status 흐름**:
```
pending ──── 결제 성공 ──────▶ paid
   │
   ├──── 30분 초과 ──────────▶ expired (cron 자동처리, 쿠폰/재고 복구)
   └──── 유저 취소 ──────────▶ cancelled
```

---

### 결제 실패 시나리오별 처리

| 실패 상황 | 처리 주체 | 서버에 알려야 하나? |
|---|---|---|
| Toss 위젯 실패 (카드 오류 등) | Toss → failUrl 리다이렉트 | ❌ pending 유지, 재시도 가능 |
| Toss 승인 API 실패 | 서버가 직접 인지 후 롤백 | ❌ 서버가 알아서 처리 |
| 정상 결제 완료 | 서버 처리 후 응답 | ✅ 응답 받아 UI 업데이트 |

---

### 보안 체크리스트

| 항목 | 방법 |
|---|---|
| 금액 위변조 방지 | 클라이언트 amount vs DB `final_amount` 비교 |
| 할인 조작 방지 | 할인 계산을 서버에서만 수행 |
| 중복 결제 방지 | `FOR UPDATE` 락 + status 확인 |
| Race Condition 방지 | PostgreSQL 트랜잭션 |
| 쿠폰 중복 사용 방지 | 같은 트랜잭션 안에서 원자적 처리 |
| Secret Key 보호 | Edge Function에서만 사용, 클라이언트 노출 금지 |
| RLS 적용 | 본인 주문만 접근 가능 |

## 관련 페이지

- [결제 시스템](./payment-system.md) — PG사 결제 기본 흐름, 금액 검증 원칙
- [Supabase — Next.js 연동](./supabase-nextjs.md) — Supabase CRUD, RLS, Edge Function 기초
- [SQL 테이블 설계](./sql-table-design.md) — CREATE TABLE, 제약조건, 외래키

## 출처

- Supabase + Toss Payments 연동 완전 정리 — 2026-04-16
