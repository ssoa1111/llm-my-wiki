# 스크립트 태그 보안

> HTML의 `<script>` 태그와 관련된 웹 보안 위협(XSS, CSRF 등)과 방어 기법.

## 핵심 내용

### XSS (Cross-Site Scripting)
공격자가 웹 페이지에 악성 스크립트를 삽입하여 다른 사용자의 브라우저에서 실행시키는 공격.

#### XSS 유형
| 유형 | 설명 | 예시 |
|------|------|------|
| **반사형(Reflected)** | URL 파라미터를 즉시 렌더링 | `?q=<script>alert(1)</script>` |
| **저장형(Stored)** | DB에 저장된 악성 스크립트 | 게시판 댓글에 스크립트 삽입 |
| **DOM 기반** | 클라이언트 JS가 DOM 조작 시 발생 | `innerHTML = location.hash` |

#### XSS 방어
```tsx
// ❌ 위험: HTML 직접 삽입
element.innerHTML = userInput
document.write(userInput)

// ✅ 안전: 텍스트로 삽입 (자동 이스케이프)
element.textContent = userInput

// React는 기본적으로 XSS 방어 (자동 이스케이프)
// ❌ 위험: dangerouslySetInnerHTML
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// 불가피하게 HTML 렌더링 필요 시 DOMPurify 사용
import DOMPurify from 'dompurify'
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userInput) }} />
```

### CSP (Content Security Policy)
XSS 방어를 위한 HTTP 헤더. 허용된 리소스 출처만 로드/실행.

```tsx
// next.config.js
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://trusted.cdn.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "connect-src 'self' https://api.example.com",
      "frame-ancestors 'none'",
    ].join('; ')
  }
]

module.exports = {
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }]
  }
}
```

**CSP Nonce** (인라인 스크립트 안전하게 허용):
```tsx
// Next.js middleware에서 nonce 생성
import { NextResponse } from 'next/server'
import crypto from 'crypto'

export function middleware(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
  const cspHeader = `script-src 'nonce-${nonce}' 'strict-dynamic'`
  const response = NextResponse.next()
  response.headers.set('Content-Security-Policy', cspHeader)
  response.headers.set('x-nonce', nonce)
  return response
}
```

### CSRF (Cross-Site Request Forgery)
사용자가 의도하지 않은 요청을 인증된 세션으로 전송하는 공격.

**방어 방법:**
1. **CSRF 토큰**: 서버에서 발급한 토큰을 폼에 포함
2. **SameSite 쿠키**: `SameSite=Strict` 또는 `SameSite=Lax`
3. **Origin/Referer 헤더 검증**
4. **Double Submit Cookie 패턴**

```ts
// Set-Cookie 보안 설정
Set-Cookie: session=abc123; HttpOnly; Secure; SameSite=Lax; Path=/
```

### 외부 스크립트 보안

#### SRI (Subresource Integrity)
CDN에서 로드하는 스크립트가 변조되지 않았는지 해시로 검증.

```html
<script
  src="https://cdn.example.com/library.js"
  integrity="sha384-abc123..."
  crossorigin="anonymous"
></script>
```

#### next/script 보안 활용
```tsx
import Script from 'next/script'

// 외부 스크립트 로딩 전략으로 보안 강화
<Script
  src="https://trusted.cdn.com/sdk.js"
  strategy="afterInteractive"  // 불필요한 조기 실행 방지
  integrity="sha384-..."       // SRI 해시
  crossOrigin="anonymous"
/>
```

### 기타 보안 헤더
```
X-Frame-Options: DENY                    # 클릭재킹 방지
X-Content-Type-Options: nosniff          # MIME 타입 스니핑 방지
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=()  # 기능 제한
Strict-Transport-Security: max-age=63072000   # HTTPS 강제
```

### Next.js 보안 체크리스트
- [ ] CSP 헤더 설정
- [ ] `dangerouslySetInnerHTML` 사용 시 DOMPurify 적용
- [ ] `eval()`, `new Function()` 사용 금지
- [ ] 쿠키에 `HttpOnly`, `Secure`, `SameSite` 설정
- [ ] 환경 변수 노출 주의 (`NEXT_PUBLIC_` 없는 변수는 서버 전용)
- [ ] 의존성 패키지 정기 보안 감사 (`npm audit`)
- [ ] 사용자 입력 서버 사이드 검증 (클라이언트 검증만으로 불충분)

## 관련 페이지

- [기초 CS](../cs-fundamentals.md) — 네트워크 보안 기초
- [TypeScript](../typescript.md) — 타입 안전성으로 보안 강화
- [Next.js Image·Metadata·SEO](../frontend/nextjs-image-metadata-seo.md) — 보안 헤더 설정

## 출처

- 스크립트 태그 보안 — 2026-04-10
