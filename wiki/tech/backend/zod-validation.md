# Zod — 스키마 유효성 검증

> TypeScript-first 스키마 선언 라이브러리. 런타임 유효성 검증 + TypeScript 타입 자동 추론을 동시에 제공한다.

## 핵심 내용

### 설치 및 폴더 구조

```bash
npm install zod @hookform/resolvers
```

```
src/
├── lib/
│   └── validations/
│       ├── auth.ts      # 인증 관련 스키마
│       ├── user.ts      # 사용자 관련
│       └── common.ts    # 공통 필드
└── types/
    └── index.ts
```

### 기본 스키마 작성

```typescript
import { z } from 'zod';

// 로그인 스키마
export const loginSchema = z.object({
  email: z.string().min(1, '이메일을 입력해주세요').email('올바른 이메일이 아닙니다'),
  password: z.string().min(8, '최소 8자 이상').max(100),
});

// 회원가입 — 기존 스키마 확장 + 교차 검증
export const signupSchema = loginSchema.extend({
  name: z.string().min(2).max(50),
  passwordConfirm: z.string(),
}).refine((data) => data.password === data.passwordConfirm, {
  message: '비밀번호가 일치하지 않습니다',
  path: ['passwordConfirm'],
});

// TypeScript 타입 자동 추출
export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
```

### React Hook Form + Zod Resolver

```typescript
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

export default function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: 'onSubmit',       // 첫 제출 시 검증
    reValidateMode: 'onChange', // 이후 실시간
  });

  const onSubmit = async (data: LoginInput) => { /* ... */ }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <p>{errors.email.message}</p>}
    </form>
  )
}
```

**폼 검증 모드 선택**:
| 상황 | `mode` |
|------|--------|
| 기본 로그인/회원가입 | `onSubmit` |
| 긴 여러 단계 폼 | `onTouched` |
| 검색/필터 (즉각 반응) | `onChange` |

### API Route / Server Action에서 사용

```typescript
// API Route에서 검증
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = loginSchema.parse(body);  // 실패 시 ZodError
    // ... 비즈니스 로직
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ errors: error.errors }, { status: 400 })
    }
  }
}
```

### 배열 스키마 + useFieldArray

**Zod 배열 스키마 + 교차 검증**

```typescript
const orderItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().min(1).max(999),
  price: z.number().positive(),
});

export const orderSchema = z.object({
  customerName: z.string().min(2),
  items: z
    .array(orderItemSchema)
    .min(1, '최소 1개 필요')
    .max(50, '최대 50개')
    .refine(
      (items) => {
        const ids = items.map((i) => i.productId);
        return ids.length === new Set(ids).size;  // 중복 체크
      },
      { message: '중복된 상품이 있습니다' }
    ),
});
```

> **주의**: `z.enum()` 사용 시 `superRefine()`과 함께 쓸 수 없음 — cross-field 검증이 필요하면 `refine()` 사용.

**React Hook Form `useFieldArray`**

```typescript
const { fields, append, remove } = useFieldArray({ control, name: 'items' });

// ⚠️ key={field.id} 사용 필수 (index 사용 시 렌더링 버그)
{fields.map((field, index) => (
  <div key={field.id}>
    <input {...register(`items.${index}.quantity`, { valueAsNumber: true })} />
    <button onClick={() => remove(index)}>삭제</button>
  </div>
))}

<button onClick={() => append({ productId: '', quantity: 1, price: 0 })}>추가</button>
```

**렌더링 최적화**:
```typescript
// 1. 아이템 컴포넌트를 memo로 분리
const OrderItem = memo(function OrderItem({ index, register, errors, onRemove }) { ... })

// 2. 특정 필드만 구독 (전체 리렌더링 방지)
function TotalAmount({ control }) {
  const items = useWatch({ control, name: 'items' });  // items만 구독
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return <div>총액: {total}원</div>;
}
```

### 고급 패턴

```typescript
// 배열 검증 (이전 방식)
const orderSchema = z.object({
  items: z.array(
    z.object({ productId: z.string().uuid(), quantity: z.number().min(1) })
  ).min(1).max(50),
});

// 조건부 검증 (refine)
const userUpdateSchema = z.object({
  notificationEnabled: z.boolean(),
  email: z.string().email().optional(),
}).refine(
  (data) => !data.notificationEnabled || !!data.email,
  { message: '알림을 받으려면 이메일이 필요합니다', path: ['email'] }
);

// 환경변수 검증
const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  NODE_ENV: z.enum(['development', 'production', 'test']),
});
export const env = envSchema.parse(process.env);
```

### 공통 필드 재사용

```typescript
// common.ts
export const emailField = z.string().min(1).email();
export const passwordField = z.string().min(8)
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, '영문 대소문자와 숫자 포함 필요');
export const phoneField = z.string().regex(/^010-?\d{4}-?\d{4}$/);
```

## 관련 페이지

- [JWT 인증 — Next.js 구현](./jwt-auth-nextjs.md) — 로그인 폼 검증에 Zod 활용
- [중앙 집중식 에러 처리](./centralized-error-handling.md) — ZodError 처리 패턴
- [TypeScript](../typescript.md) — z.infer<>로 타입 자동 추론
- [프론트엔드 실전 에러 패턴](../frontend/frontend-error-patterns.md) — React Hook Form 리렌더링 방지

## 출처

- Zod 기본 셋팅하기 — 2026-04-14
- Zod 배열 — 2026-04-14
- enum — 2026-04-14
