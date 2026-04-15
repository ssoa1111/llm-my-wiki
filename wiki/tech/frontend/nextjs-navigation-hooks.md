# Next.js Navigation Hooks

> App Router에서 URL 정보를 읽고 페이지를 이동하는 4가지 훅 — 모두 `next/navigation`에서 임포트하며 Client Component 전용.

## 핵심 내용

### usePathname — 현재 경로

쿼리스트링 제외한 pathname만 반환.

```ts
'use client'
import { usePathname } from 'next/navigation'

const pathname = usePathname()
// /dashboard/settings
```

| 현재 URL | 반환값 |
|---|---|
| `/about` | `/about` |
| `/shop?sort=price` | `/shop` |

### useSearchParams — 쿼리스트링

읽기 전용 `URLSearchParams` 인터페이스.

```ts
const searchParams = useSearchParams()

searchParams.get('sort')     // 'price'
searchParams.get('page')     // null (없으면 null)
searchParams.has('sort')     // true
searchParams.getAll('tag')   // ['a', 'b'] (같은 키 여러 개)
```

**수정은 useRouter와 조합:**

```ts
const router = useRouter()
const pathname = usePathname()

const setParam = (key: string, value: string | null) => {
  const params = new URLSearchParams(searchParams.toString())
  value ? params.set(key, value) : params.delete(key)
  router.replace(pathname + '?' + params.toString())
}
```

> **주의**: `useSearchParams`는 `Suspense`로 감싸야 빌드 에러 없음.
> ```tsx
> <Suspense fallback={null}><MyComponent /></Suspense>
> ```

### useRouter — 프로그래매틱 이동

```ts
const router = useRouter()

router.push('/dashboard')     // 이동 + 히스토리 추가
router.replace('/dashboard')  // 이동 + 히스토리 교체 (필터/검색 파라미터 변경에 적합)
router.back()                 // 뒤로가기
router.refresh()              // 현재 페이지 서버 데이터 재요청
router.prefetch('/dashboard') // 미리 로드
```

> **주의**: `next/router`의 `useRouter`는 App Router에서 **deprecated**. 반드시 `next/navigation`에서 임포트.

### useParams — 동적 라우트 파라미터

```ts
// /blog/[slug] → /blog/hello-world
const params = useParams()
params.slug     // 'hello-world'

// /shop/[category]/[id]
params.category // 'shoes'
params.id       // '42'
```

### 서버 컴포넌트에서 접근

훅은 클라이언트 전용. 서버 컴포넌트는 props로 받는다.

```ts
// app/shop/page.tsx
export default function Page({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: { sort?: string }
}) {
  const sort = searchParams.sort  // 'price'
  const id = params.id            // '42'
}
```

### 미들웨어에서 접근

```ts
import { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl
  pathname              // '/dashboard'
  searchParams.get('sort')  // 'price'
}
```

### 한눈에 비교

| 훅/prop | 반환 | 환경 |
|---|---|---|
| `usePathname` | 현재 경로 문자열 | 클라이언트 |
| `useSearchParams` | `URLSearchParams` (읽기 전용) | 클라이언트 |
| `useRouter` | router 객체 | 클라이언트 |
| `useParams` | 동적 경로 파라미터 객체 | 클라이언트 |
| `searchParams` prop | 쿼리스트링 객체 | 서버 |
| `params` prop | 동적 경로 파라미터 객체 | 서버 |

## 관련 페이지

- [Next.js Middleware vs Context](./nextjs-middleware-context.md) — Middleware에서 URL 처리 패턴
- [프론트엔드 실전 에러 패턴](./frontend-error-patterns.md) — searchParam 인코딩 이슈
- [Next.js 환경변수 관리](./nextjs-env-vars.md) — Next.js 설정 관련

## 출처

- Next.js Navigation Hooks — 2026-04-15
