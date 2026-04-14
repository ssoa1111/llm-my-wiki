# Next.js Middleware vs Context

> Middleware로 "들어오지 못하게" 막고, Context로 "들어온 후 경험"을 관리하는 것이 일반적 패턴.

## 핵심 내용

### Middleware 사용 경우

- 완전히 보호되어야 하는 페이지 (`/admin`, `/dashboard` 전체)
- URL 자체에 접근을 막아야 하는 경우
- **서버에서 처리** → 인증되지 않은 사용자에게 페이지 내용을 전혀 보여주지 않음

```typescript
// middleware.ts — 페이지 레벨 보호
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('access_token')
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*']
}
```

### Context 사용 경우

- 로그인 상태에 따라 **UI만** 다르게 보여주면 되는 경우
- 페이지 내에서 역할별로 다른 컴포넌트 렌더링
- 사용자 정보를 여러 컴포넌트에서 공유

```tsx
// AuthContext — UI 레벨 제어
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}
```

### 실무: 두 가지 함께 사용

```
Middleware (서버) → 인증: 누구인지 확인 + 인가: 이 경로에 접근 권한이 있는가?
Context (클라이언트) → 로그인 상태에 따른 UI 분기
```

| | Middleware | Context |
|--|------------|---------|
| 실행 위치 | 서버 (Edge Runtime) | 클라이언트 |
| 목적 | URL 레벨 접근 제어 | UI 레벨 상태 공유 |
| 사용 시점 | 요청 전 | 컴포넌트 렌더링 중 |
| 역할 | 인증/인가 체크 | 사용자 정보 공유 |

### NextResponse.redirect와 쿠키 보존

Supabase 등의 인증 라이브러리 사용 시, `NextResponse.redirect()`를 단독으로 쓰면 기존 세션 쿠키가 사라질 수 있다.

```typescript
// ❌ 잘못된 사용: Supabase 쿠키 손실
return NextResponse.redirect(new URL('/dashboard', request.url))

// ✅ 올바른 사용: 기존 쿠키 보존하면서 리다이렉트
const redirectResponse = NextResponse.redirect(new URL(path, request.url))
baseResponse.cookies.getAll().forEach(({ name, value, ...rest }) => {
  redirectResponse.cookies.set(name, value, rest)
})
return redirectResponse
```

**언제 쿠키 보존이 필요한가**:
- 인증된 사용자를 다른 경로로 리다이렉트할 때
- Supabase `getMiddlewareUser` 호출 이후의 모든 리다이렉트
- 비로그인 사용자 리다이렉트: 쿠키가 없으므로 일반 redirect 사용 가능

## 관련 페이지

- [JWT 인증 — Next.js 구현](../backend/jwt-auth-nextjs.md) — 미들웨어에서 JWT 검증
- [Node Runtime & Edge Runtime](./node-edge-runtime.md) — Middleware는 Edge Runtime에서 실행
- [프론트엔드 상태 관리](./state-management.md) — Context API 상태 관리 패턴

## 출처

- middleware와 context — 2026-04-14
- NextResponse.redirect와 쿠키보존 — 2026-04-14
