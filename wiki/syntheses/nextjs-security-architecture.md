# Next.js 보안 아키텍처 — Middleware부터 입력 검증까지

> Next.js 앱의 보안은 단일 기술이 아니라 진입점 제어 → 응답 헤더 → 토큰 관리 → 입력 검증 → 스크립트 보안으로 이어지는 계층형 방어(Defense in Depth) 전략으로 구성된다.

## 핵심 내용

### 보안 계층 전체 구조

```
[요청 진입]
    │
    ▼
① Middleware (Edge Runtime)
   - 인증 체크 (쿠키에서 토큰 확인)
   - 미인증 요청 → /login 리다이렉트
   - CSP Nonce 생성 및 헤더 삽입
    │
    ▼
② 응답 헤더 (next.config.js)
   - CSP: 허용 출처 제한
   - HSTS: HTTPS 강제
   - X-Frame-Options: 클릭재킹 방지
   - X-Content-Type-Options: MIME 스니핑 방지
    │
    ▼
③ 토큰 관리 (Server Action / API Route)
   - JWT 발급 + HttpOnly 쿠키 저장
   - JWKS로 분산 검증
   - Refresh Token 갱신 플로우
    │
    ▼
④ 입력 검증 (Zod)
   - 클라이언트: React Hook Form + zodResolver
   - 서버: loginSchema.parse(body)
   - 환경변수 검증
    │
    ▼
⑤ 스크립트 보안 (코드 레벨)
   - XSS 방어: textContent, DOMPurify
   - CSRF 방어: SameSite 쿠키, CSRF 토큰
   - 외부 스크립트: SRI 해시 검증
```

---

### ① 진입점 제어 — Middleware

Middleware는 Edge Runtime에서 실행되어 페이지 콘텐츠가 전달되기 전에 인증·인가를 수행한다.

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')

  // CSP Nonce 생성 및 헤더 설정
  const cspHeader = `script-src 'nonce-${nonce}' 'strict-dynamic'`
  const response = NextResponse.next()
  response.headers.set('Content-Security-Policy', cspHeader)
  response.headers.set('x-nonce', nonce)

  // 인증 체크
  const token = request.cookies.get('access_token')
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  return response
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*']
}
```

**핵심 주의사항**: Supabase 등 서드파티 인증 라이브러리 사용 시 `NextResponse.redirect()` 단독 사용 시 기존 쿠키가 소실된다. 기존 쿠키를 수동으로 복사해야 한다.

| 방어 수단 | 실행 위치 | 목적 |
|----------|----------|------|
| Middleware 인증 체크 | Edge Runtime (서버) | URL 레벨 접근 제어 |
| Context (AuthProvider) | 클라이언트 | UI 분기 / 사용자 정보 공유 |

---

### ② 응답 헤더 — next.config.js

```typescript
// next.config.js
const securityHeaders = [
  // XSS 방어: 허용된 출처에서만 리소스 로드
  { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self' 'unsafe-inline';" },
  // HTTPS 강제 (중간자 공격 방어)
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  // 클릭재킹 방지
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  // MIME 스니핑 방지
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // 민감한 URL 정보 유출 방지
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
]

module.exports = {
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }]
  }
}
```

| 헤더 | 방어 대상 | 핵심 설정값 |
|------|----------|------------|
| CSP | XSS | `default-src 'self'` + nonce |
| HSTS | MITM | `max-age=63072000; preload` |
| X-Frame-Options | 클릭재킹 | `SAMEORIGIN` |
| X-Content-Type-Options | MIME 스니핑 | `nosniff` |
| Referrer-Policy | URL 정보 유출 | `strict-origin-when-cross-origin` |

> `X-XSS-Protection`은 2020년부터 Chrome·Firefox에서 제거됨. CSP로 대체할 것.

---

### ③ 토큰 관리 — JWT + HttpOnly 쿠키

```typescript
// app/actions/auth.ts — Server Action
export async function login(formData: FormData) {
  const { accessToken } = await fetch('/auth/login', { /* ... */ }).then(r => r.json())

  cookieStore.set('access_token', accessToken, {
    httpOnly: true,     // JavaScript 접근 불가 → XSS 방어
    secure: true,       // HTTPS 전용
    sameSite: 'lax',    // CSRF 기본 방어
    maxAge: 60 * 15,    // 15분
  })
}
```

**토큰 저장 전략**:

| 토큰 | 저장 위치 | 만료 | 무효화 |
|------|----------|------|--------|
| Access Token | HttpOnly 쿠키 | 15분 | 만료까지 유효 (블랙리스트 선택) |
| Refresh Token | HttpOnly 쿠키 | 7일 | Redis 블랙리스트로 즉시 무효화 |

**분산 시스템**: JWKS(JSON Web Key Set)를 사용하면 각 서비스가 인증 서버 호출 없이 공개 키로 독립 검증 가능. `/.well-known/jwks.json` 엔드포인트를 캐싱하여 성능 최적화.

---

### ④ 입력 검증 — Zod

클라이언트 검증만으로는 충분하지 않다. 서버에서 반드시 재검증해야 한다.

```typescript
// lib/validations/auth.ts
export const loginSchema = z.object({
  email: z.string().email('올바른 이메일이 아닙니다'),
  password: z.string().min(8).max(100),
})

// 환경변수 검증 (서버 시작 시 오류 조기 발견)
const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
})
export const env = envSchema.parse(process.env)
```

```typescript
// API Route — 서버 사이드 검증
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = loginSchema.parse(body)  // ZodError 발생 시 즉시 중단
    // 비즈니스 로직
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ errors: error.errors }, { status: 400 })
    }
  }
}
```

**검증 위치별 역할**:

| 위치 | 도구 | 목적 |
|------|------|------|
| 클라이언트 폼 | React Hook Form + zodResolver | UX 피드백 (빠른 오류 표시) |
| Server Action / API Route | `schema.parse(body)` | 실제 보안 방어선 |
| 환경변수 | `envSchema.parse(process.env)` | 서버 시작 시 오류 조기 발견 |

---

### ⑤ 스크립트 보안 — XSS·CSRF·SRI

**XSS 방어 코드 레벨**:
```tsx
// ❌ 위험
element.innerHTML = userInput
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ 안전
element.textContent = userInput
import DOMPurify from 'dompurify'
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userInput) }} />
```

**외부 스크립트 SRI 검증**:
```tsx
import Script from 'next/script'
<Script
  src="https://trusted.cdn.com/sdk.js"
  strategy="afterInteractive"
  integrity="sha384-..."
  crossOrigin="anonymous"
/>
```

---

### 통합 보안 체크리스트

- [ ] Middleware에서 보호 경로(`/admin`, `/dashboard`) 인증 체크
- [ ] `next.config.js`에 5개 보안 헤더 일괄 설정
- [ ] JWT는 `httpOnly: true`, `secure: true`, `sameSite: 'lax'` 쿠키에 저장
- [ ] Refresh Token Redis 블랙리스트 구현
- [ ] Zod로 서버 사이드 입력 검증 (클라이언트 검증 의존 금지)
- [ ] `dangerouslySetInnerHTML` 사용 시 반드시 DOMPurify 적용
- [ ] 외부 CDN 스크립트에 SRI 해시 추가
- [ ] 환경변수 Zod 스키마로 검증
- [ ] CSP Nonce를 Middleware에서 생성하여 인라인 스크립트 안전하게 허용
- [ ] `NEXT_PUBLIC_` 없는 환경변수는 절대 클라이언트에 노출되지 않도록 주의

## 관련 페이지

- [Next.js Middleware vs Context](../tech/frontend/nextjs-middleware-context.md) — 진입점 인증 제어 및 쿠키 보존 패턴
- [JWT 인증 — Next.js 구현](../tech/backend/jwt-auth-nextjs.md) — HttpOnly 쿠키, JWKS, Refresh Token 플로우
- [HTTP 보안 헤더](../tech/backend/security-headers.md) — CSP·HSTS·X-Frame-Options 설정 방법
- [스크립트 태그 보안](../tech/backend/script-security.md) — XSS·CSRF·SRI 방어 기법
- [Zod — 스키마 유효성 검증](../tech/backend/zod-validation.md) — 런타임 입력 검증 및 TypeScript 타입 추론

## 출처

- middleware와 context — 2026-04-15
- JWKS / Next.js JWT 인증 구현 가이드 — 2026-04-15
- 보안 헤더 종류 — 2026-04-15
- 스크립트 태그 보안 — 2026-04-15
- Zod 기본 셋팅하기 / Zod 배열 — 2026-04-15
