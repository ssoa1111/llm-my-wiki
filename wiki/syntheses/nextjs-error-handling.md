# Next.js 에러 처리 완전 가이드

> API fetch → TanStack Query → ErrorBoundary → error.tsx → window 이벤트까지 5계층 방어선을 하나의 아키텍처로 통합

## 핵심 내용

### 전체 구조 — 5계층 + 404

```
에러 발생 위치                    처리 담당
─────────────────────────────────────────────────
API 호출 (HTTP 에러)        → Level 1: fetch wrapper / axios 인터셉터
TanStack Query 데이터 에러  → Level 2: QueryCache / MutationCache onError
컴포넌트 렌더링 에러         → Level 3: ErrorBoundary (클래스 컴포넌트)
라우트 세그먼트 에러         → Level 4: error.tsx / global-error.tsx
이벤트 핸들러·Promise 에러  → Level 5: window.onerror + unhandledrejection
경로 없음                   → 별도: not-found.tsx / [...not_found]
```

모든 레벨의 에러가 최종적으로 `globalErrorHandler.handle(error)` 하나로 모인다.

---

### Level 1: API Fetch Wrapper

**잡는 것**: HTTP 응답 에러 (4xx, 5xx)  
**파일 위치**: `lib/api.ts` 또는 `lib/fetch.ts`

```typescript
// lib/api.ts
class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new ApiError(body.message ?? '요청 실패', res.status, body.code)
  }

  return res.json()
}
```

**에러 분기 기준**:

| 상태코드 | 처리 |
|---|---|
| 401 | 로그인 페이지 리다이렉트 |
| 403 | 접근 거부 페이지 |
| 400 | 폼 필드 인라인 에러 |
| 429 | "잠시 후 다시 시도" Toast |
| 5xx | "서버 오류" Toast |
| 502/503 | "서비스 점검 중" Modal |

---

### Level 2: TanStack Query 전역 핸들러

**잡는 것**: `queryFn` / `mutationFn` 내부에서 throw된 모든 에러  
**파일 위치**: `lib/query-client.ts`

```typescript
// lib/query-client.ts
import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      retry: (failureCount, error) => {
        // 4xx는 재시도 안 함 (인증 에러·유효성 에러는 반복해도 의미 없음)
        if (error instanceof ApiError && error.status < 500) return false
        return failureCount < 1
      },
      throwOnError: false,  // error 상태로 저장 (true면 ErrorBoundary로 전파)
    },
    mutations: {
      retry: 0,
    },
  },
  queryCache: new QueryCache({
    onError: (error) => globalErrorHandler.handle(error),
  }),
  mutationCache: new MutationCache({
    onError: (error) => globalErrorHandler.handle(error),
  }),
})
```

**`throwOnError` 선택 기준**:

```
throwOnError: false  → 에러를 QueryCache.onError로 처리 (Toast 등 부드러운 피드백)
throwOnError: true   → ErrorBoundary/error.tsx로 전파 (페이지 단위 에러 UI)
```

---

### Level 3: ErrorBoundary

**잡는 것**: 렌더링 중 동기 JS 예외 (`undefined.map()`, `null.property` 등)  
**못 잡는 것**: 비동기 에러, 이벤트 핸들러 에러 (→ Level 5에서 처리)  
**파일 위치**: `components/error-boundary.tsx`

```tsx
// components/error-boundary.tsx
'use client'
import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

class ErrorBoundary extends Component<Props, { hasError: boolean }> {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error) {
    globalErrorHandler.handle(error)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? <div>문제가 발생했어요.</div>
    }
    return this.props.children
  }
}
```

**ErrorBoundary vs error.tsx 차이**:

| | ErrorBoundary | error.tsx |
|---|---|---|
| 범위 | 감싼 컴포넌트 단위 | 라우트 세그먼트 단위 |
| 설정 방식 | 직접 JSX로 감싸기 | 파일 위치로 자동 적용 |
| `reset` 기능 | 직접 구현 | Next.js가 `reset()` 제공 |
| 사용 시점 | 특정 위젯만 격리할 때 | 페이지 전체 에러 UI |

> Next.js의 `error.tsx`는 내부적으로 해당 세그먼트를 ErrorBoundary로 자동 감싸준 것

**Suspense와 함께 사용**:

```tsx
// Suspense = 로딩 담당, ErrorBoundary = 에러 담당
<ErrorBoundary fallback={<ErrorFallback />}>
  <Suspense fallback={<Skeleton />}>
    <AsyncComponent />
  </Suspense>
</ErrorBoundary>
```

---

### Level 4: error.tsx / global-error.tsx

**잡는 것**: Server Component 렌더링 에러, 서버 액션 에러, 데이터 페칭 에러  
**핵심**: **파일을 어느 폴더에 두느냐 = 에러를 잡는 범위**

```
app/
├── global-error.tsx       ← 루트 layout.tsx까지 포함한 최상위 (최후 방어)
├── error.tsx              ← app 전체 (루트 layout 제외)
│
├── dashboard/
│   ├── error.tsx          ← dashboard/* 범위만 격리
│   └── page.tsx
│
└── shop/
    ├── error.tsx          ← shop/* 범위만 격리
    └── [id]/
        └── page.tsx
```

```tsx
// app/error.tsx
'use client'  // 반드시 클라이언트 컴포넌트

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void           // 해당 세그먼트만 리렌더 시도
}) {
  useEffect(() => {
    globalErrorHandler.handle(error)
  }, [error])

  return (
    <div>
      <h2>문제가 발생했어요</h2>
      <button onClick={reset}>다시 시도</button>
    </div>
  )
}
```

```tsx
// app/global-error.tsx — 루트 layout 에러 (html/body 직접 렌더 필요)
'use client'

export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html>
      <body>
        <h1>심각한 오류가 발생했어요</h1>
        <button onClick={reset}>새로고침</button>
      </body>
    </html>
  )
}
```

---

### Level 5: window 이벤트 (최후 방어선)

**잡는 것**: 이벤트 핸들러 내부 에러, 처리 안 된 Promise rejection, 서드파티 스크립트 에러  
**파일 위치**: `components/global-error-listener.tsx` — 앱 최상위에서 한 번만 등록

```tsx
// components/global-error-listener.tsx
'use client'
import { useEffect } from 'react'

export function GlobalErrorListener() {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      globalErrorHandler.handle(event.error)
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      globalErrorHandler.handle(event.reason)
      event.preventDefault()  // 콘솔 빨간 에러 억제
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])

  return null
}
```

```tsx
// app/layout.tsx — 여기서 한 번만 마운트
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <GlobalErrorListener />
        {children}
      </body>
    </html>
  )
}
```

---

### 404 처리 — not-found.tsx / [...not_found]

**에러가 아닌 "이 경로는 없음"** — 별도 카테고리

```
app/
├── not-found.tsx              ← 전역 404 (notFound() 호출 시 렌더)
│
└── shop/
    ├── not-found.tsx          ← shop/* 범위 404
    └── [id]/
        └── page.tsx
```

```tsx
// app/shop/[id]/page.tsx — Server Component
import { notFound } from 'next/navigation'

export default async function ShopPage({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id)
  if (!product) notFound()      // → 가장 가까운 not-found.tsx 렌더
  return <div>{product.name}</div>
}
```

**[...not_found] catch-all 방식**:

```
app/
└── [...not_found]/
    └── page.tsx    ← not-found.tsx 없는 세그먼트, 커스텀 레이아웃 필요할 때
```

| | `not-found.tsx` | `[...not_found]/page.tsx` |
|---|---|---|
| 트리거 | `notFound()` 호출 | 매칭되는 라우트 없을 때 |
| 레이아웃 | 상위 layout 포함 | 자체 layout 자유 설정 |
| 사용 시점 | 일반적인 경우 | 404 전용 레이아웃이 필요한 경우 |

---

### 중앙 에러 핸들러 구현

모든 레벨이 최종적으로 이 함수를 호출한다.

```typescript
// lib/global-error-handler.ts
class GlobalErrorHandler {
  private recentErrors = new Map<string, number>()

  handle(error: unknown) {
    const appError = this.normalize(error)

    // 중복 방지: 3초 이내 같은 에러 재표시 안 함
    const hash = `${appError.status}-${appError.message}`
    const lastSeen = this.recentErrors.get(hash)
    if (lastSeen && Date.now() - lastSeen < 3000) return
    this.recentErrors.set(hash, Date.now())

    // 로깅
    if (process.env.NODE_ENV === 'production') {
      Sentry.captureException(error)
    } else {
      console.error('[Error]', appError)
    }

    // 라우팅
    this.route(appError)
  }

  private normalize(error: unknown) {
    if (error instanceof ApiError) return error
    if (error instanceof Error) return new ApiError(error.message, 0)
    return new ApiError('알 수 없는 오류', 0)
  }

  private route(error: ApiError) {
    switch (true) {
      case error.status === 401:
        return router.push('/login')
      case error.status === 403:
        return router.push('/forbidden')
      case error.status === 400:
        return toast.error(error.message)     // 폼 에러는 인라인 처리 권장
      case error.status === 429:
        return toast.error('잠시 후 다시 시도해주세요')
      case error.status >= 500:
        return toast.error('서버 오류가 발생했어요')
      default:
        return toast.error(error.message)
    }
  }
}

export const globalErrorHandler = new GlobalErrorHandler()
```

---

### 의사결정 트리

```
에러가 어디서 발생했나?
  ├─ API 응답 (HTTP 4xx/5xx)
  │   └─ fetch wrapper에서 ApiError throw → Level 1
  │
  ├─ useQuery / useMutation 실행 중
  │   ├─ 복구 가능 (Toast로 충분)    → throwOnError: false → QueryCache.onError
  │   └─ 복구 불가능 (페이지 에러 UI) → throwOnError: true  → error.tsx
  │
  ├─ 렌더링 중 JS 예외
  │   ├─ 특정 컴포넌트만 격리 원할 때  → ErrorBoundary로 감싸기
  │   └─ 라우트 전체 에러 UI 원할 때   → error.tsx
  │
  ├─ 이벤트 핸들러 / setTimeout / 처리 안 된 Promise
  │   └─ window 이벤트 → Level 5 (GlobalErrorListener)
  │
  ├─ 루트 layout 에러
  │   └─ global-error.tsx
  │
  └─ 존재하지 않는 경로
      └─ notFound() → not-found.tsx
```

---

### 전체 파일 구조

```
app/
├── global-error.tsx              ← 루트 layout 에러 (최상위)
├── error.tsx                     ← 앱 전체 에러 (루트 layout 제외)
├── not-found.tsx                 ← 전역 404
├── layout.tsx                    ← GlobalErrorListener 마운트
│
├── dashboard/
│   ├── error.tsx                 ← dashboard 범위 격리
│   └── page.tsx
│
└── shop/
    ├── error.tsx
    ├── not-found.tsx             ← shop 전용 404
    └── [id]/page.tsx

components/
├── error-boundary.tsx            ← 컴포넌트 단위 격리용
└── global-error-listener.tsx     ← window 이벤트 등록

lib/
├── api.ts                        ← ApiError + fetch wrapper
├── query-client.ts               ← QueryClient (QueryCache.onError)
└── global-error-handler.ts       ← 중앙 핸들러
```

## 관련 페이지

- [중앙 집중식 에러 처리](../tech/backend/centralized-error-handling.md) — 5계층 캡처 시스템 원칙
- [TanStack Query 설정 & 고급 패턴](../tech/frontend/tanstack-query-config.md) — QueryCache/throwOnError 상세
- [Next.js 데이터 페칭 & 캐싱 전략 통합 가이드](./nextjs-data-fetching-caching.md) — 서버/클라이언트 페칭 전략
- [Next.js 보안 아키텍처](./nextjs-security-architecture.md) — Middleware·JWT 계층형 방어

## 출처

- 대화 기반 합성 — 2026-04-16
