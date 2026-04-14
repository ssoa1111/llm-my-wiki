# Next.js 국제화 (next-intl)

> next-intl 라이브러리로 Next.js App Router에 다국어를 적용하는 방법 — [locale] 동적 라우팅, 번역 JSON, Middleware 언어 감지.

## 핵심 내용

### 폴더 구조

```
src/
├── app/
│   └── [locale]/           ← 다국어 라우팅
│       ├── layout.tsx
│       ├── page.tsx
│       └── products/page.tsx
├── i18n.ts                 ← 지원 언어 정의 + 번역 파일 로드
└── messages/               ← 번역 파일
    ├── ko.json
    ├── en.json
    └── ja.json
middleware.ts               ← 언어 감지 + 리다이렉트
next.config.ts              ← next-intl 플러그인 등록
```

---

### 1. next.config.ts — 플러그인 등록

```typescript
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/i18n.ts')
export default withNextIntl(nextConfig)
```

---

### 2. src/i18n.ts — 지원 언어 정의

```typescript
import { notFound } from 'next/navigation'
import { getRequestConfig } from 'next-intl/server'

export const locales = ['en', 'ko', 'ja'] as const
export const defaultLocale = 'ko' as const

export default getRequestConfig(async ({ locale }) => {
  if (!locales.includes(locale as any)) notFound()
  return {
    messages: (await import(`./messages/${locale}.json`)).default
  }
})
```

---

### 3. 번역 JSON 파일

```json
// messages/ko.json
{
  "common": { "home": "홈", "login": "로그인" },
  "home": { "title": "환영합니다", "description": "최고의 쇼핑몰" },
  "products": { "title": "상품 목록", "price": "가격: {price}원" }
}
```

변수 삽입은 `{varName}` 문법 사용.

---

### 4. 레이아웃 — 번역 파일 전달

```typescript
// src/app/[locale]/layout.tsx
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'

export default async function LocaleLayout({ children, params: { locale } }) {
  const messages = await getMessages()
  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'ko' }, { locale: 'ja' }]
}
```

---

### 5. 페이지에서 번역 사용

```typescript
// src/app/[locale]/page.tsx
import { useTranslations } from 'next-intl'

export default function HomePage() {
  const t = useTranslations('home')
  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('description')}</p>
    </div>
  )
}
```

변수 포함: `t('price', { price: 10000 })` → "가격: 10000원"

---

### 6. Middleware — 언어 감지 + 리다이렉트

```typescript
// middleware.ts
import createMiddleware from 'next-intl/middleware'
import { locales, defaultLocale } from './src/i18n'

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always'  // URL에 항상 언어 코드 표시
})

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
}
```

동작: `/` 접속 → Accept-Language 헤더 확인 → `/ko`로 자동 리다이렉트. 이후 선택 언어는 쿠키에 저장.

---

### 전체 흐름

```
사용자 접속 → middleware.ts (브라우저 언어 감지)
→ /ko 리다이렉트
→ [locale]/layout.tsx (ko.json 로드)
→ [locale]/page.tsx (useTranslations('home') → "환영합니다")
```

---

### URL 구조

```
/ko          → 한국어 홈
/en          → 영어 홈
/ko/products → 한국어 상품
/en/products → 영어 상품
```

## 관련 페이지

- [Next.js 캐싱 전략](./nextjs-caching.md) — generateStaticParams와 Static/Dynamic 렌더링
- [Next.js 환경변수 관리](./nextjs-env-vars.md) — 국제화 관련 환경변수 관리
- [HTTP 상태 코드](../backend/http-status-codes.md) — 지원하지 않는 locale 404 처리

## 출처

- 국제화 — 2026-04-14
