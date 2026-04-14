# HTTP 보안 헤더

> 웹 브라우저에게 "이 사이트를 이렇게 안전하게 다뤄주세요"라고 알려주는 HTTP 응답 헤더 모음.

## 핵심 내용

### Content-Security-Policy (CSP)

```typescript
// next.config.js
const headers = [
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-inline';"
  }
]
```

- XSS 공격 방어: 허용된 출처에서만 리소스 로드
- `default-src 'self'`: 같은 도메인에서만 리소스 허용
- **Report-Only 모드**: `Content-Security-Policy-Report-Only`로 차단 없이 로그만 수집 → 운영 전 테스트에 유용

### Strict-Transport-Security (HSTS)

```typescript
{
  key: 'Strict-Transport-Security',
  value: 'max-age=63072000; includeSubDomains; preload'
}
```

- 중간자 공격(MITM) 방어: HTTP 접속을 HTTPS로 강제
- `max-age=63072000`: 2년간 설정 기억
- `includeSubDomains`: 서브도메인에도 적용
- `preload`: 브라우저 사전 등록 → 첫 방문부터 HTTPS 강제

### X-Frame-Options

```typescript
{ key: 'X-Frame-Options', value: 'SAMEORIGIN' }
```

- 클릭재킹(Clickjacking) 방어: 내 사이트가 외부 iframe에 삽입되는 것 차단
- `DENY`: 어디서도 iframe 불가
- `SAMEORIGIN`: 같은 도메인에서만 iframe 허용

### X-Content-Type-Options

```typescript
{ key: 'X-Content-Type-Options', value: 'nosniff' }
```

- MIME 스니핑 방어: 브라우저가 파일 타입을 임의로 추측하지 못하게 함
- 이미지로 위장한 JavaScript 실행 차단

### Referrer-Policy

```typescript
{ key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' }
```

- 민감한 URL 정보 유출 방지
- `strict-origin-when-cross-origin`:
  - 같은 사이트 내부: 전체 URL 전송
  - 외부 사이트: 도메인만 전송
  - HTTPS → HTTP: 아무것도 전송 안 함

### X-XSS-Protection (구식)

```typescript
{ key: 'X-XSS-Protection', value: '1; mode=block' }
```

> ⚠️ 2020년부터 Chrome, Firefox에서 제거됨. CSP로 대체할 것.

### Next.js에서 일괄 설정

```typescript
// next.config.js
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Content-Security-Policy', value: "default-src 'self';" },
]

module.exports = {
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }]
  }
}
```

## 관련 페이지

- [JWT 인증 — Next.js 구현](./jwt-auth-nextjs.md) — 인증 토큰 보안과의 연계
- [스크립트 태그 보안](./script-security.md) — XSS·CSP 심층 내용
- [Open Redirect 취약점](./open-redirect.md) — redirect URL 검증 취약점

## 출처

- 보안 헤더 종류 — 2026-04-14
