# Next.js 렌더링 전략과 SEO — 콘텐츠 특성에 따른 최적 선택

> 페이지 콘텐츠의 변경 주기와 사용자 맞춤 여부에 따라 SSG·ISR·SSR·CSR을 고르고, 각 전략에 맞는 캐싱 레이어와 `generateMetadata`로 SEO를 완성하며, Core Web Vitals(LCP/CLS/INP) 목표치를 달성하는 통합 의사결정 가이드.

## 핵심 내용

### 렌더링 전략과 SEO의 연결 고리

SEO 크롤러는 서버에서 완성된 HTML을 받아야 페이지를 올바르게 색인한다. CSR은 빈 HTML 셸을 반환하기 때문에 SEO에 불리하고, SSG·ISR·SSR은 완전한 HTML을 제공하므로 SEO에 유리하다. 따라서 **검색 노출이 필요한 모든 페이지는 SSG, ISR, SSR 중 하나를 선택**해야 한다.

---

### 페이지 유형별 렌더링 전략 선택 표

| 페이지 유형 | 데이터 특성 | 권장 전략 | 캐싱 레이어 | SEO 중요도 |
|-------------|-------------|-----------|-------------|------------|
| 블로그 / 문서 | 빌드 후 변경 거의 없음 | **SSG** | Full Route Cache (CDN) | 높음 |
| 상품 목록 / 뉴스 피드 | 수 분~수 시간 주기 갱신 | **ISR** (`revalidate`) | Full Route Cache + Data Cache | 높음 |
| 제품 상세 페이지 | 재고·가격 주기적 변동 | **ISR** (On-demand) | `revalidateTag('product')` | 높음 |
| 마케팅 랜딩 페이지 | 완전 정적 | **SSG** | Full Route Cache (CDN) | 매우 높음 |
| 개인화 피드 / 추천 | 사용자별 다른 데이터 | **SSR** | `cache: 'no-store'` | 중간 |
| 실시간 데이터 | 항상 최신 필요 | **SSR** | `cache: 'no-store'` | 낮음 |
| 대시보드 / 관리자 | 인증 필요, SEO 불필요 | **CSR** | Router Cache (클라이언트) | 없음 |
| 검색 결과 페이지 | URL 파라미터 기반 | **SSR** | `searchParams` → 자동 동적 | 중간 |

---

### 캐싱 레이어와 렌더링 전략 연동

Next.js App Router의 4가지 캐싱 레이어는 렌더링 전략과 1:1로 대응한다.

```
SSG  → Full Route Cache (빌드 시 생성, CDN 서빙)
ISR  → Full Route Cache + Data Cache (revalidate 또는 revalidateTag로 갱신)
SSR  → Request Memoization (동일 렌더링 내 중복 제거, 영구 캐시 없음)
CSR  → Router Cache (클라이언트, 30초~5분 유지)
```

**Data Cache fetch 설정 대응표:**

```typescript
// SSG처럼 — 빌드 후 변경 없음 (기본값)
fetch(url)

// ISR처럼 — 60초마다 재검증
fetch(url, { next: { revalidate: 60 } })

// ISR On-demand — 태그로 즉시 무효화
fetch(url, { next: { tags: ['product'] } })
// Server Action에서: revalidateTag('product')

// SSR처럼 — 항상 최신 (캐싱 없음)
fetch(url, { cache: 'no-store' })
```

**주의:** `cookies()`, `headers()`, `searchParams`를 사용하면 별도 설정 없이 자동으로 동적 렌더링(SSR)으로 전환된다.

---

### generateMetadata로 SEO 완성

렌더링 전략이 결정되면 각 전략에 맞게 메타데이터를 적용한다.

**SSG / 정적 페이지 — 정적 메타데이터:**
```tsx
export const metadata: Metadata = {
  title: '블로그 제목 | My Site',
  description: '페이지 설명 (150-160자)',
  openGraph: {
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
  },
}
```

**ISR / SSR + 동적 라우트 — generateMetadata:**
```tsx
export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  const post = await fetchPost(params.slug) // Data Cache 활용
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: { images: [post.coverImage] },
  }
}
```

`generateMetadata`의 `fetchPost` 호출은 페이지 본문의 동일한 fetch 결과를 **Request Memoization**으로 공유하므로 추가 네트워크 비용이 없다.

**title 템플릿으로 일관성 유지:**
```tsx
// root layout.tsx
export const metadata: Metadata = {
  title: { template: '%s | My Site', default: 'My Site' }
}
// 각 페이지: title: 'About' → 'About | My Site'
```

---

### SEO 심화 — JSON-LD 구조화 데이터

SSG·ISR·SSR 모두 서버에서 완성된 HTML을 반환하므로 JSON-LD 삽입이 유효하다. CSR에서는 크롤러가 JavaScript 실행 전 HTML을 수집하면 누락될 수 있다.

```tsx
// 블로그 포스트 (SSG/ISR 권장)
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: post.title,
  datePublished: post.publishedAt,
  author: { '@type': 'Person', name: post.author },
}
```

---

### Core Web Vitals와 렌더링 전략

각 지표는 렌더링 전략 선택과 직결된다.

#### LCP (≤2.5s) — 주요 콘텐츠 로딩
- **SSG / ISR**: CDN에서 HTML을 즉시 반환 → TTFB 최소화 → LCP 유리
- **SSR**: 요청마다 서버 처리 → TTFB 증가 가능 → 캐싱 전략 필수
- **핵심 패턴**: LCP 이미지에 `priority` 추가 (`<Image priority />`)

```tsx
// Hero 이미지는 항상 priority
<Image src="/hero.jpg" alt="Hero" width={1200} height={600} priority />
```

#### CLS (≤0.1) — 레이아웃 안정성
- SSG·ISR은 빌드 시 HTML을 완성하므로 레이아웃 시프트 위험이 낮음
- `next/image`의 `width`/`height` 필수 지정으로 공간 예약
- `placeholder="blur"`로 이미지 로딩 중 CLS 방지

#### INP (≤200ms) — 입력 응답성
- 렌더링 전략보다 **클라이언트 JavaScript 최적화**에 달려 있음
- 대시보드(CSR)에서 Long Task 분리: `useTransition`, 웹 워커 활용
- 초기 번들 최소화: `next/dynamic`으로 코드 스플리팅

---

### 통합 의사결정 흐름

```
1. SEO 필요?
   └─ No  → CSR (대시보드, 인증 페이지)
   └─ Yes → 다음 단계

2. 데이터가 얼마나 자주 변하는가?
   ├─ 거의 안 변함     → SSG  + Full Route Cache
   ├─ 주기적 변경      → ISR  + revalidate / revalidateTag
   └─ 요청마다 다름    → SSR  + cache: 'no-store'

3. 메타데이터는?
   ├─ SSG  → 정적 metadata 객체
   ├─ ISR/SSR 동적 라우트 → generateMetadata (Request Memoization 활용)
   └─ 공통 title → root layout의 title.template

4. Core Web Vitals 목표 달성?
   ├─ LCP ≤2.5s  → SSG/ISR CDN 서빙 + Image priority
   ├─ CLS ≤0.1   → Image width/height + placeholder="blur"
   └─ INP ≤200ms → 번들 스플리팅 + Long Task 분리
```

---

### 실전 체크리스트

**렌더링 전략**
- [ ] 검색 노출 페이지에 SSG/ISR/SSR 중 하나 선택
- [ ] `cookies()` / `headers()` 사용 시 SSR로 자동 전환 여부 인지
- [ ] ISR On-demand: CMS webhook → `revalidateTag()` 연결

**캐싱**
- [ ] 정적 콘텐츠는 `revalidate: 3600` 이상 설정
- [ ] 사용자별 데이터는 `cache: 'no-store'` 명시
- [ ] 태그 기반 캐시 무효화로 재빌드 없이 갱신

**SEO**
- [ ] 각 페이지 고유 `<title>` (50-60자) + `description` (150-160자)
- [ ] `<link rel="canonical">` — 중복 콘텐츠 방지
- [ ] Open Graph / Twitter Card 이미지 (1200×630px)
- [ ] JSON-LD 구조화 데이터 (Article, Product, FAQ 등)
- [ ] `sitemap.ts` / `robots.ts` 설정

**Core Web Vitals**
- [ ] LCP 이미지에 `priority` prop
- [ ] 모든 `<Image>`에 `width`, `height` 또는 `fill` + `sizes`
- [ ] `next/dynamic`으로 초기 번들에서 불필요한 컴포넌트 제거
- [ ] Lighthouse / PageSpeed Insights로 배포 전 검증

## 관련 페이지

- [SSR/SSG/ISR/CSR](../concepts/ssr-ssg-isr-csr.md) — 4가지 렌더링 전략의 원리와 선택 기준
- [Next.js Image·Metadata·SEO](../tech/frontend/nextjs-image-metadata-seo.md) — generateMetadata, JSON-LD, sitemap 구현 패턴
- [Next.js 캐싱 전략](../tech/frontend/nextjs-caching.md) — 4가지 캐싱 레이어와 렌더링 전략 연동
- [성능 측정 및 개선](../tech/frontend/performance-measurement.md) — Core Web Vitals 측정 도구와 지표별 개선 전략

## 출처

- SSR, SSG, ISR, CSR — 2026-04-15
- Image · Metadata · SEO — 2026-04-15
- 캐싱 종류 — 2026-04-15
- 성능 측정 개선 — 2026-04-15
