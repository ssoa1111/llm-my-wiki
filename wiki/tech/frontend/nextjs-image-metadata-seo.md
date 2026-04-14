# Next.js Image · Metadata · SEO

> Next.js에서 이미지 최적화, 메타데이터 관리, SEO를 구현하는 내장 API와 패턴.

## 핵심 내용

### next/image — 이미지 최적화

```tsx
import Image from 'next/image'

// 기본 사용
<Image
  src="/photo.jpg"
  alt="설명"
  width={800}
  height={600}
  quality={85}          // 기본 75
  priority              // LCP 이미지에 추가 (preload)
  placeholder="blur"    // 로딩 중 블러 플레이스홀더
  blurDataURL="..."     // blur URL (자동 생성 또는 수동)
/>

// 가득 채우기 (부모 기준)
<div style={{ position: 'relative', height: '400px' }}>
  <Image
    src="/hero.jpg"
    alt="Hero"
    fill
    sizes="100vw"
    style={{ objectFit: 'cover' }}
  />
</div>
```

**자동 최적화 기능:**
- WebP/AVIF 포맷 자동 변환
- 디바이스별 크기 조정 (srcset 생성)
- Lazy loading 기본 적용
- CLS 방지 (크기 공간 예약)
- 외부 이미지는 `next.config.js`의 `images.domains` 또는 `remotePatterns` 설정 필요

```js
// next.config.js
module.exports = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.example.com' }
    ]
  }
}
```

### Metadata API (App Router)

#### 정적 메타데이터
```tsx
// layout.tsx 또는 page.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '페이지 제목',
  description: '페이지 설명',
  keywords: ['Next.js', 'React'],
  openGraph: {
    title: 'OG 제목',
    description: 'OG 설명',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Twitter 제목',
    description: 'Twitter 설명',
    images: ['/og-image.jpg'],
  },
}
```

#### 동적 메타데이터
```tsx
// 동적 라우트에서
export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  const post = await fetchPost(params.slug)
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      images: [post.coverImage]
    }
  }
}
```

#### 메타데이터 상속 및 병합
- 레이아웃 → 페이지 순으로 덮어씀
- `title.template`로 공통 접두사/접미사 설정

```tsx
// root layout.tsx
export const metadata: Metadata = {
  title: {
    template: '%s | My Site',
    default: 'My Site'
  }
}
// 페이지에서 title: 'About' → 'About | My Site'
```

### 구조화 데이터 (JSON-LD)

```tsx
export default function ArticlePage({ post }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    datePublished: post.publishedAt,
    author: { '@type': 'Person', name: post.author },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article>{/* 내용 */}</article>
    </>
  )
}
```

### sitemap.xml / robots.txt

```tsx
// app/sitemap.ts
import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://example.com', lastModified: new Date(), changeFrequency: 'yearly', priority: 1 },
    { url: 'https://example.com/blog', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
  ]
}

// app/robots.ts
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: '/private/' },
    sitemap: 'https://example.com/sitemap.xml',
  }
}
```

### SEO 핵심 체크리스트
- [ ] 각 페이지 고유한 `<title>` (50-60자)
- [ ] `<meta description>` (150-160자)
- [ ] `<link rel="canonical">` — 중복 콘텐츠 방지
- [ ] Open Graph / Twitter Card 설정
- [ ] 구조화 데이터 (JSON-LD)
- [ ] 이미지 `alt` 텍스트
- [ ] 시맨틱 HTML (`h1`~`h6`, `main`, `nav`, `article`)
- [ ] Core Web Vitals 충족
- [ ] SSR/SSG로 크롤러에 완전한 HTML 제공

## 관련 페이지

- [SSR/SSG/ISR/CSR](../../concepts/ssr-ssg-isr-csr.md) — SEO를 위한 서버 렌더링 전략
- [성능 측정 및 개선](./performance-measurement.md) — Core Web Vitals와 SEO 연관성
- [성능 개선 체크리스트](./performance-checklist.md) — 이미지 최적화 체크리스트

## 출처

- Image · Metadata · SEO — 2026-04-10
