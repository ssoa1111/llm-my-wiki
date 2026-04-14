# Open Redirect 취약점

> 로그인 후 redirect URL을 검증 없이 사용할 때 피싱 사이트로 유도되는 보안 취약점.

## 핵심 내용

### 문제

토큰 만료 시 로그인 페이지로 이동하면서 이전 페이지를 `?redirect=` 파라미터로 전달하는 패턴에서 발생.

```tsx
// ❌ 위험한 코드
const redirectUrl = searchParams.get('redirect')
router.push(redirectUrl || '/')  // 검증 없이 그대로 사용
```

**공격 시나리오**:
```
https://yoursite.com/login?redirect=https://evil.com/fake-login
```
1. 사용자가 링크 클릭
2. 정상 로그인 성공
3. `evil.com`으로 리다이렉트
4. 사용자는 yoursite에 있다고 착각 → 가짜 로그인 폼에 입력 → 정보 탈취

### 방어 방법

**1. 상대 경로만 허용 (기본)**
```tsx
const safeRedirect = redirectUrl?.startsWith('/')
  && !redirectUrl.startsWith('//')  // 프로토콜 상대 URL 차단
    ? redirectUrl : '/'
router.push(safeRedirect)
```

**2. 화이트리스트 방식 (더 안전)**
```tsx
const ALLOWED_REDIRECTS = ['/dashboard', '/profile', '/settings']
const safeRedirect = ALLOWED_REDIRECTS.includes(redirectUrl) ? redirectUrl : '/'
router.push(safeRedirect)
```

**3. URL 파싱 검증 (가장 강력)**
```tsx
const isInternalUrl = (url: string) => {
  try {
    const parsed = new URL(url, window.location.origin)
    return parsed.origin === window.location.origin  // 같은 도메인만 허용
  } catch {
    return url.startsWith('/') && !url.startsWith('//')
  }
}

const safeRedirect = isInternalUrl(redirectUrl) ? redirectUrl : '/'
router.push(safeRedirect)
```

### 선택 기준

| 상황 | 권장 방법 |
|------|----------|
| 간단한 프로젝트 | `startsWith('/')` 체크 |
| 민감한 정보 서비스 | 화이트리스트 |
| 엔터프라이즈 | URL 파싱 + 도메인 검증 |

### 차단해야 할 패턴

```
❌ /login?redirect=https://evil.com
❌ /login?redirect=//evil.com           (프로토콜 상대 URL)
❌ /login?redirect=javascript:alert()  (JavaScript URL)
✅ /login?redirect=/dashboard
✅ /login?redirect=/profile
```

## 관련 페이지

- [JWT 인증 — Next.js 구현](./jwt-auth-nextjs.md) — 로그인 플로우에서 redirect 처리
- [보안 헤더](./security-headers.md) — CSP 등 추가 방어 레이어
- [스크립트 태그 보안](./script-security.md) — XSS 공격 유형과 방어

## 출처

- Open Redirect 취약점 — 2026-04-14
