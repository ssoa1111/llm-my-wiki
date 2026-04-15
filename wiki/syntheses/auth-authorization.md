# 인증 & 권한 관리 통합 — JWT, Supabase RLS, 프록시 패턴

> HttpOnly 쿠키 기반 JWT+Refresh 토큰으로 세션을 관리하고, Supabase RLS로 DB 레벨 권한을 제어하며, n8n 같은 외부 서비스 접근 시 Next.js 프록시로 자격증명을 주입하는 크로스도메인 인증 패턴을 통합한다.

## 핵심 내용

### 전체 아키텍처 개요

```
브라우저
  │
  ├─── Next.js (프론트+API Routes)
  │        │
  │        ├─ HttpOnly 쿠키 ──── JWT (Access + Refresh Token)
  │        │
  │        ├─ Supabase Client ─── RLS 정책 적용 (anon key + 사용자 세션)
  │        │
  │        └─ /api/n8n-chat ──── 프록시: Basic Auth + supabaseAccessToken 주입
  │                                        │
  │                                        └─── n8n Webhook ──── Supabase (RLS 통과)
  │
  └─── 직접 노출 금지: N8N_BASIC_PASS, service_role key, JWT_SECRET
```

---

### 레이어 1 — JWT 세션 관리 (클라이언트 ↔ Next.js)

**목표**: 브라우저 상태를 XSS-safe하게 유지하면서 자동 토큰 갱신

- Access Token → HttpOnly 쿠키, 15분 만료
- Refresh Token → HttpOnly 쿠키, 7일 만료
- Axios Interceptor가 401 응답 시 `/auth/refresh` 자동 호출 후 원래 요청 재시도
- `sameSite: 'lax'`로 CSRF 기본 방어, `secure: true`로 HTTPS 전송 강제

```typescript
// Access Token + Refresh Token 쿠키 저장 전략
cookieStore.set('access_token', accessToken, {
  httpOnly: true, secure: true, sameSite: 'lax',
  maxAge: 60 * 15,   // 15분
});
cookieStore.set('refresh_token', refreshToken, {
  httpOnly: true, secure: true, sameSite: 'lax',
  maxAge: 60 * 60 * 24 * 7,  // 7일
});
```

**분산 시스템**: JWKS 방식으로 여러 백엔드가 인증 서버 없이 독립 검증 가능 (`/.well-known/jwks.json`).

---

### 레이어 2 — Supabase RLS (Next.js ↔ DB)

**목표**: DB 행(Row) 단위 접근 제어 — 쿼리 레벨이 아닌 DB 정책 레벨에서 데이터 격리

- `anon key` 사용 시 RLS 정책이 자동 적용됨
- `auth.uid()`가 쿠키 세션의 사용자 ID와 일치하는 행만 반환
- Server Component에서는 `createServerComponentClient({ cookies })`로 세션 자동 전달

```sql
-- 자신의 데이터만 조회 가능
CREATE POLICY "Users can view own data" ON profiles
  FOR SELECT USING (auth.uid() = user_id);
```

```typescript
// Server Component — 세션 기반 RLS 자동 적용
const supabase = createServerComponentClient({ cookies });
const { data } = await supabase.from('posts').select('*');
// → 현재 로그인 사용자의 posts만 반환
```

**중요**: `service_role` 키는 RLS를 우회하므로 클라이언트에 절대 노출 금지.

---

### 레이어 3 — 외부 서비스 프록시 (n8n 챗봇 패턴)

**목표**: 크로스도메인 서비스(n8n 등)의 자격증명을 서버 측에서만 처리

- 클라이언트는 `/api/n8n-chat`(내부 프록시)만 호출
- Next.js API Route에서 Basic Auth 헤더와 Supabase access_token을 주입해 n8n으로 전달
- `NEXT_PUBLIC_` 접두사 없이 서버 전용 환경변수로 자격증명 관리

```typescript
// app/api/n8n-chat/route.ts — 토큰 주입 프록시
const supabase = createRouteHandlerClient({ cookies });
const { data: { session } } = await supabase.auth.getSession();

const payload = {
  ...body,
  metadata: {
    userId: session?.user.id ?? null,
    supabaseAccessToken: session?.access_token ?? null,
  },
};

const auth = Buffer.from(`${process.env.N8N_BASIC_USER}:${process.env.N8N_BASIC_PASS}`)
  .toString('base64');

await fetch(process.env.N8N_CHAT_URL!, {
  headers: {
    'Authorization': `Basic ${auth}`,
    'Accept-Encoding': 'gzip, deflate',  // Brotli 압축 방지
  },
  body: JSON.stringify(payload),
});
```

n8n이 받은 `supabaseAccessToken`으로 Supabase를 직접 조회하면 RLS 정책이 그대로 적용됨 → 서비스 전반에 걸쳐 동일한 권한 모델 유지.

---

### 어떤 상황에서 어떤 인증 패턴을 쓰는가

| 상황 | 권장 패턴 | 핵심 이유 |
|------|-----------|-----------|
| 일반 웹 로그인 (짧은 세션) | Access Token만, HttpOnly 쿠키 15분 | 구현 단순, 세션 짧아 위험도 낮음 |
| 장기 로그인 (remember me) | Access Token + Refresh Token, 둘 다 HttpOnly 쿠키 | XSS 차단 + 자동 갱신으로 UX 유지 |
| 마이크로서비스 / 분산 시스템 | JWKS 기반 JWT 검증 | 인증 서버 의존성 없이 독립 검증 |
| DB 행 단위 권한 제어 | Supabase RLS + anon key | 쿼리 실수에도 DB 레벨에서 차단 |
| 외부 서비스에 사용자 토큰 전달 | Next.js API Route 프록시 + 토큰 주입 | 자격증명 서버에서만 처리, 클라이언트 노출 없음 |
| n8n 챗봇에서 개인 데이터 접근 | 프록시 + supabaseAccessToken 주입 + RLS | 최소권한 원칙, service_role 불필요 |
| 즉시 세션 무효화 필요 | Refresh Token Redis 블랙리스트 | Access Token 만료 전 강제 차단 |

---

### 보안 체크리스트

- HttpOnly + Secure + SameSite 3개 속성은 쿠키에 항상 동시 적용
- `NEXT_PUBLIC_` 환경변수에는 민감 자격증명 절대 불가
- Supabase `service_role` 키는 서버 전용, RLS 우회 주의
- n8n Basic Auth 비밀번호는 최소 32바이트 랜덤 생성
- Refresh Token은 Redis 블랙리스트로 즉시 무효화 구현 권장

## 관련 페이지

- [JWT 인증 — Next.js 구현](../tech/backend/jwt-auth-nextjs.md) — HttpOnly 쿠키 기반 Access/Refresh Token 구현 상세
- [Supabase — Next.js 연동](../tech/backend/supabase-nextjs.md) — RLS 정책 설정, Server Component 연동, TypeScript 타입 생성
- [n8n Chatbot 인가 — Next.js 프록시 패턴](../tech/n8n/n8n-chatbot-auth.md) — Basic Auth + Supabase 토큰 주입 프록시 구현

## 출처

- JWKS, Next.js JWT 인증 구현 가이드 (jwt-auth-nextjs.md) — 2026-04-15
- supabase setting, supabase query (supabase-nextjs.md) — 2026-04-15
- chatbot에 인가 부여하기, n8n chat stream (n8n-chatbot-auth.md) — 2026-04-15
