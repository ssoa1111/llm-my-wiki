# 성능 개선 체크리스트

> 프론트엔드 성능 개선을 위한 실전 체크리스트 — 로딩, 렌더링, 네트워크 관점.

## 핵심 내용

### 네트워크 & 로딩

#### 이미지
- [ ] `next/image` 컴포넌트 사용 (WebP 자동 변환, lazy loading)
- [ ] LCP 이미지에 `priority` prop 추가
- [ ] 이미지 크기 명시 (`width`, `height`) — CLS 방지
- [ ] SVG 인라인화 (아이콘 스프라이트 고려)
- [ ] AVIF/WebP 포맷 우선 사용

#### 폰트
- [ ] `next/font`로 폰트 자가 호스팅
- [ ] `font-display: optional` 또는 `swap` 설정
- [ ] 필요한 subset만 로드 (`latin`, `korean` 등)
- [ ] `preconnect` / `preload` 활용

#### 스크립트
- [ ] `next/script`로 외부 스크립트 로딩 전략 설정
  - `strategy="afterInteractive"`: GA, 채팅 위젯 등
  - `strategy="lazyOnload"`: 중요도 낮은 스크립트
  - `strategy="beforeInteractive"`: 폴리필 등 필수 스크립트

#### 번들 크기
- [ ] `@next/bundle-analyzer`로 번들 분석
- [ ] 코드 스플리팅: `dynamic()` 사용
- [ ] 무거운 라이브러리 대체재 탐색 (lodash → lodash-es, moment → date-fns)
- [ ] Tree shaking 가능한 ESM 패키지 사용
- [ ] 사용하지 않는 의존성 제거

### 렌더링 최적화

#### React
- [ ] 불필요한 리렌더링 확인 (React DevTools Profiler)
- [ ] 자주 리렌더되는 리스트에 `React.memo` 적용
- [ ] 비싼 연산에 `useMemo` 적용
- [ ] 콜백 props에 `useCallback` 적용
- [ ] 긴 목록은 가상화 (`react-virtual`, `react-window`)
- [ ] `useTransition` / `useDeferredValue`로 비긴급 업데이트 분리

#### Next.js 렌더링 전략
- [ ] 정적 콘텐츠는 SSG 또는 ISR 사용
- [ ] 동적 콘텐츠만 SSR 적용 (불필요한 SSR 지양)
- [ ] `'use client'` 최소화 — Server Component 최대 활용
- [ ] 클라이언트 컴포넌트는 트리의 leaf에 위치

### 데이터 패칭

- [ ] Parallel Data Fetching: 독립적인 요청은 병렬로 (`Promise.all`)
- [ ] 데이터 캐싱: `fetch` cache 옵션 또는 `unstable_cache` 활용
- [ ] 폭포수(waterfall) 요청 제거
- [ ] TanStack Query / SWR의 `staleTime` 적절히 설정
- [ ] API 응답 페이지네이션 또는 커서 기반 페이징

### 사용자 경험 (UX 성능)

- [ ] 스켈레톤 UI / 로딩 플레이스홀더 구현
- [ ] Optimistic Updates 적용 (즉각적인 UI 피드백)
- [ ] 오프라인 지원 / Service Worker (PWA)
- [ ] Suspense 경계로 점진적 로딩
- [ ] `<link rel="prefetch">` / `router.prefetch()` 활용

### 서버 & 인프라

- [ ] CDN 사용 (Vercel Edge Network, CloudFront 등)
- [ ] HTTP/2 또는 HTTP/3 활성화
- [ ] Brotli / Gzip 압축 설정
- [ ] Cache-Control 헤더 올바르게 설정
- [ ] 데이터베이스 쿼리 최적화 (N+1 문제 해결, 인덱스 확인)

### 측정 & 모니터링

- [ ] Lighthouse 점수 정기 측정 (LCP ≤2.5s, CLS ≤0.1, INP ≤200ms)
- [ ] Real User Monitoring (RUM) 설정
- [ ] 성능 예산(Performance Budget) 설정 및 CI 통합
- [ ] `reportWebVitals` 로 실사용 데이터 수집

## 관련 페이지

- [성능 측정 및 개선](./performance-measurement.md) — Core Web Vitals 개념
- [React 렌더링 최적화](./react-rendering-optimization.md) — React 성능 최적화 상세
- [Next.js Image·Metadata·SEO](./nextjs-image-metadata-seo.md) — 이미지 최적화 상세
- [SSR/SSG/ISR/CSR](../../concepts/ssr-ssg-isr-csr.md) — 렌더링 전략 선택

## 출처

- 성능개선 체크리스트 — 2026-04-10
