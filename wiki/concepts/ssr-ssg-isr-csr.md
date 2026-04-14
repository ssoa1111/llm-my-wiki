# SSR / SSG / ISR / CSR

> Next.js가 지원하는 4가지 렌더링 전략으로, 콘텐츠 특성과 성능 요구에 따라 선택한다.

## 핵심 내용

### CSR (Client-Side Rendering)
- 브라우저에서 JavaScript가 실행된 후 DOM을 생성
- 초기 HTML은 빈 셸(shell), 데이터는 클라이언트에서 fetch
- 장점: 서버 부하 없음, 이후 페이지 전환 빠름
- 단점: 초기 로딩 느림, SEO 불리, FCP/LCP 점수 낮음
- 적합: 대시보드, 관리자 페이지 등 인증 필요 화면

### SSR (Server-Side Rendering)
- 매 요청마다 서버에서 HTML을 완성해 전달
- `getServerSideProps` (Pages Router) 또는 기본 async Server Component (App Router)
- 장점: 항상 최신 데이터, SEO 유리
- 단점: 요청마다 서버 처리 → TTFB 증가, 캐싱 어려움
- 적합: 사용자별 맞춤 데이터, 실시간성이 중요한 페이지

### SSG (Static Site Generation)
- 빌드 타임에 HTML을 미리 생성, CDN에서 서빙
- `getStaticProps` + `getStaticPaths` (Pages Router) / `generateStaticParams` (App Router)
- 장점: TTFB 최소, CDN 캐싱 극대화, 서버 비용 없음
- 단점: 빌드 후 데이터 변경 반영 불가, 페이지 수 많으면 빌드 시간 증가
- 적합: 블로그, 문서, 마케팅 랜딩 페이지

### ISR (Incremental Static Regeneration)
- SSG의 확장: `revalidate` 시간(초) 설정으로 백그라운드에서 페이지 재생성
- 첫 요청 후 stale-while-revalidate 패턴으로 캐시 갱신
- App Router에서는 `fetch(url, { next: { revalidate: 60 } })` 또는 Route Segment Config `export const revalidate = 60`
- On-demand ISR: `revalidatePath()` / `revalidateTag()` 호출로 즉시 무효화 가능
- 장점: SSG 성능 + SSR 데이터 신선도
- 적합: 상품 목록, 뉴스 피드, 가격 정보 등 주기적 업데이트 필요 페이지

### 선택 가이드
| 조건 | 전략 |
|------|------|
| 데이터가 없거나 완전히 정적 | SSG |
| 주기적으로 변하는 데이터 | ISR |
| 요청마다 달라지는 데이터 | SSR |
| 인증 필요 / SEO 불필요 | CSR |

### Next.js App Router 기본 동작
- Server Component는 기본적으로 SSG처럼 동작 (빌드 타임 렌더링)
- `cookies()`, `headers()`, `searchParams` 사용 시 자동으로 동적 렌더링(SSR)으로 전환
- `'use client'` 지시자: 해당 컴포넌트와 하위 트리를 CSR로 전환

## 관련 페이지

- [성능 측정 및 개선](../tech/frontend/performance-measurement.md) — Core Web Vitals 렌더링 전략별 영향
- [React 렌더링 최적화](../tech/frontend/react-rendering-optimization.md) — 클라이언트 렌더링 최적화 기법
- [Next.js Image·Metadata·SEO](../tech/frontend/nextjs-image-metadata-seo.md) — SSR/SSG와 SEO 연계

## 출처

- SSR, SSG, ISR, CSR — 2026-04-10
