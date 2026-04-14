# Node Runtime & Edge Runtime

> Next.js가 지원하는 두 가지 서버 런타임 환경으로, 각각 Node.js API 완전 지원과 초경량 빠른 시작을 제공한다.

## 핵심 내용

### Node.js Runtime (기본값)
- 표준 Node.js 환경에서 실행
- 모든 Node.js API 및 npm 패키지 사용 가능
- 파일 시스템 접근 (`fs`), `crypto`, `Buffer` 등 사용 가능
- Cold Start는 상대적으로 느림 (수백ms~수초)
- Vercel, AWS Lambda 등 서버리스 환경에서도 사용 가능

```tsx
// Route Handler에서 Node Runtime 명시
export const runtime = 'nodejs' // 기본값, 생략 가능

export async function GET() {
  const file = await fs.readFile('./data.json', 'utf-8') // Node.js API 사용 가능
  return Response.json(JSON.parse(file))
}
```

### Edge Runtime
- V8 기반 경량 런타임 (Cloudflare Workers, Vercel Edge Functions 등)
- Node.js API **미지원**: `fs`, `path`, `crypto` 일부, `Buffer` 등 사용 불가
- Web Standard API만 지원: `fetch`, `Request`, `Response`, `URL`, `TextEncoder` 등
- **Cold Start 거의 없음** (~0ms) → 엣지 네트워크에서 사용자 근처 서버에서 실행
- 메모리 제한: 일반적으로 128MB 이하

```tsx
export const runtime = 'edge'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const name = searchParams.get('name') ?? 'World'
  return new Response(`Hello, ${name}!`, {
    headers: { 'Content-Type': 'text/plain' }
  })
}
```

### 비교 표
| 항목 | Node.js Runtime | Edge Runtime |
|------|----------------|--------------|
| Cold Start | 느림 | 거의 없음 |
| Node.js API | 완전 지원 | 미지원 |
| npm 패키지 | 대부분 사용 가능 | Web API 호환 패키지만 |
| 실행 위치 | 단일 리전 서버 | 글로벌 엣지 네트워크 |
| 메모리 | 제한 없음 (실질적) | ~128MB |
| 파일 시스템 | 접근 가능 | 불가 |
| 데이터베이스 | 모든 클라이언트 | Edge 호환 필요 (PlanetScale, Neon, Upstash 등) |

### 선택 기준

**Edge Runtime 적합:**
- 지연(latency) 최소화가 핵심인 경우
- 간단한 인증, 리다이렉트, A/B 테스트 미들웨어
- 세계 각지 사용자 대상 서비스

**Node.js Runtime 적합:**
- 파일 시스템 접근 필요
- Node.js 전용 패키지 사용
- 무거운 서버 사이드 로직
- 기존 Node.js 코드베이스 통합

### Next.js Middleware와 Edge Runtime
Next.js의 `middleware.ts`는 기본적으로 **Edge Runtime**에서 실행된다. 모든 요청 전에 실행되므로 성능이 중요하다.

```ts
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*']
}
```

### Edge 호환 데이터베이스
- **Vercel KV** (Redis), **Upstash Redis**: HTTP 기반
- **PlanetScale**, **Neon** (PostgreSQL): HTTP 드라이버 제공
- **Cloudflare D1**: SQLite Edge
- 기존 TCP 기반 DB 클라이언트(pg, mysql2)는 Edge에서 사용 불가

## 관련 페이지

- [SSR/SSG/ISR/CSR](../../concepts/ssr-ssg-isr-csr.md) — 렌더링 전략과 런타임 선택의 관계
- [이벤트 루프와 비동기](../../concepts/event-loop.md) — Node.js 비동기 처리 메커니즘
- [성능 측정 및 개선](./performance-measurement.md) — Cold Start와 TTFB 최적화

## 출처

- Node Runtime & Edge Runtime — 2026-04-10
