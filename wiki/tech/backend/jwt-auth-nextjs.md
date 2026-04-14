# JWT 인증 — Next.js 구현 가이드

> HttpOnly 쿠키 기반 JWT 인증 플로우: Access Token + Refresh Token으로 XSS-safe하게 인증 상태를 관리한다.

## 핵심 내용

### 아키텍처

```
클라이언트 (브라우저) ◀───▶ Next.js (프론트) ◀───▶ 백엔드 API 서버
                                   │                       │
                          쿠키에 JWT 저장            JWT 발급 및 검증
```

- **HttpOnly 쿠키** 사용: JavaScript에서 접근 불가 → XSS 공격으로부터 안전
- `JWT_SECRET`은 Next.js와 백엔드 API 서버가 **동일한 키 공유**

---

### Access Token만 사용하는 경우 (간단한 구현)

```typescript
// app/actions/auth.ts
'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function login(formData: FormData) {
  const { accessToken } = await fetch('https://api.myapp.com/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: formData.get('email'),
      password: formData.get('password'),
    }),
  }).then(r => r.json());

  const cookieStore = await cookies();
  cookieStore.set('access_token', accessToken, {
    httpOnly: true,    // JavaScript 접근 불가 (XSS 방어)
    secure: true,      // HTTPS에서만 전송
    sameSite: 'lax',   // CSRF 보호
    maxAge: 60 * 15,   // 15분
    path: '/',
  });

  redirect('/dashboard');
}
```

---

### Access Token + Refresh Token (권장)

**Token 만료 플로우**:
1. API 요청 → 401 Unauthorized
2. Axios Interceptor가 자동으로 `/auth/refresh` 호출
3. 새 Access Token 발급 → 원래 요청 재시도

**쿠키 저장 전략**:
| 토큰 | 저장 위치 | 만료 시간 |
|------|-----------|---------|
| Access Token | 메모리 or httpOnly 쿠키 | 15분 |
| Refresh Token | httpOnly 쿠키 (권장) | 7일 |

---

### JWKS 기반 인증 (분산 시스템)

**JWKS**(JSON Web Key Set): JWT를 검증하는 공개 키 모음. `/.well-known/jwks.json` 엔드포인트로 공개.

**플로우**:
1. 인증 서버: 비밀 키로 JWT 서명 + `kid`(Key ID) 포함
2. 백엔드: JWKS 엔드포인트에서 `kid`에 맞는 공개 키 조회 (캐시 활용)
3. 공개 키로 JWT 서명 검증 → 비밀 키 없이 독립 검증 가능

**장점**: 여러 백엔드 서버가 인증 서버 없이 독립적으로 JWT 검증 가능

---

### 보안 고려사항

- Refresh Token은 Redis 블랙리스트로 즉시 무효화 가능
- Access Token은 만료까지 유효 (블랙리스트 선택)
- `sameSite: 'lax'`로 CSRF 기본 방어

## 관련 페이지

- [보안 헤더](./security-headers.md) — HTTPS, CSP, HSTS 등 추가 보안 레이어
- [Open Redirect 취약점](./open-redirect.md) — 로그인 후 redirect 처리 시 주의사항
- [Next.js Middleware와 Context](../frontend/nextjs-middleware-context.md) — 인증 적용 위치 결정

## 출처

- JWKS — 2026-04-14
- Next.js JWT 인증 구현 가이드 — 2026-04-14
