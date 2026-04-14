# 성능 측정 및 개선

> Core Web Vitals를 중심으로 웹 애플리케이션 성능을 측정하고 개선하는 방법론.

## 핵심 내용

### Core Web Vitals (CWV)
Google이 정의한 사용자 경험 핵심 지표. SEO 랭킹에 직접 영향.

| 지표 | 이름 | 기준 | 의미 |
|------|------|------|------|
| **LCP** | Largest Contentful Paint | ≤2.5s | 주요 콘텐츠 로딩 완료 |
| **FID** → **INP** | Interaction to Next Paint | ≤200ms | 입력에 대한 응답성 |
| **CLS** | Cumulative Layout Shift | ≤0.1 | 레이아웃 안정성 |

*FID는 2024년 3월 INP로 대체됨*

### 추가 성능 지표
- **TTFB** (Time to First Byte): 서버 응답 첫 바이트까지의 시간 (≤800ms 권장)
- **FCP** (First Contentful Paint): 첫 콘텐츠 렌더링 (≤1.8s 권장)
- **TTI** (Time to Interactive): 완전한 상호작용 가능 시점
- **TBT** (Total Blocking Time): 메인 스레드 차단 총 시간

### 측정 도구

#### Lighthouse
- Chrome DevTools, PageSpeed Insights, CLI에서 실행
- 성능, 접근성, SEO, Best Practices 종합 점수
- Lab 데이터 (인위적 환경)

#### Web Vitals 실사용 데이터 (RUM)
```tsx
// Next.js에서 Web Vitals 수집
export function reportWebVitals(metric: NextWebVitalsMetric) {
  console.log(metric)
  // Analytics 서비스로 전송
  sendToAnalytics(metric)
}
```

#### Chrome DevTools
- **Performance 탭**: 프레임 타임라인, Long Task 식별
- **Network 탭**: 요청 워터폴, 번들 크기
- **Coverage 탭**: 미사용 JS/CSS 확인
- **Lighthouse 탭**: 종합 성능 감사

### LCP 개선 전략
1. **서버 응답 최적화**: CDN 활용, 캐싱, 데이터베이스 쿼리 최적화
2. **리소스 로드 최적화**: `<link rel="preload">`, 이미지 최적화
3. **렌더링 차단 리소스 제거**: CSS/JS 지연 로딩
4. **Next.js Image 컴포넌트**: 자동 최적화, WebP 변환, lazy loading

```tsx
import Image from 'next/image'

// LCP 이미지에 priority 추가
<Image
  src="/hero.jpg"
  alt="Hero"
  width={1200}
  height={600}
  priority // LCP 이미지는 preload
/>
```

### CLS 개선 전략
1. **이미지/비디오에 크기 명시** (`width`, `height` 또는 `aspect-ratio`)
2. **동적 콘텐츠 삽입 주의** — 기존 콘텐츠를 밀어내지 않도록
3. **폰트 로딩 최적화** — `font-display: swap` + `size-adjust`
4. **스켈레톤 UI** — 콘텐츠 로딩 전 공간 예약

### INP 개선 전략
1. **Long Task 분리** — 50ms 이상 작업을 청크로 분할
2. **useTransition** — 비긴급 렌더링을 낮은 우선순위로
3. **웹 워커** — CPU 집약적 작업을 메인 스레드에서 분리
4. **이벤트 핸들러 최적화** — 디바운스, 스로틀 적용

### 번들 크기 최적화
```tsx
// 다이나믹 임포트
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Skeleton />,
  ssr: false // 클라이언트 전용
})
```
- `next/dynamic`으로 코드 스플리팅
- Tree shaking: 사용하지 않는 코드 자동 제거 (ESM 필수)
- 번들 분석: `@next/bundle-analyzer`

### Next.js 성능 내장 기능
- **Turbopack**: Rust 기반 번들러, 빌드 속도 대폭 향상
- **Image Optimization**: WebP/AVIF 변환, 크기 조정, lazy loading
- **Font Optimization**: `next/font`로 폰트 자가 호스팅, CLS 방지
- **Script Optimization**: `next/script`로 외부 스크립트 로딩 제어

## 관련 페이지

- [SSR/SSG/ISR/CSR](../../concepts/ssr-ssg-isr-csr.md) — 렌더링 전략과 TTFB/LCP 관계
- [React 렌더링 최적화](./react-rendering-optimization.md) — INP 개선을 위한 렌더링 최적화
- [Next.js Image·Metadata·SEO](./nextjs-image-metadata-seo.md) — Image 최적화와 SEO
- [성능 개선 체크리스트](./performance-checklist.md) — 실전 체크리스트

## 출처

- 성능 측정 개선 — 2026-04-10
