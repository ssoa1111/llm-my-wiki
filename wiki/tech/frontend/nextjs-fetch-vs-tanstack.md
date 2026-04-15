# Next.js fetch vs TanStack Query

> Server Component의 fetch(서버 캐시)와 TanStack Query의 useQuery(클라이언트 캐시) — 실행 위치와 캐싱 방식이 근본적으로 다르다.

## 핵심 내용

### 핵심 차이 — 실행 위치

| | Next.js fetch | TanStack Query |
|---|---|---|
| 실행 위치 | Server Component | Client Component (`'use client'`) |
| 사용 방식 | `async/await` 직접 | `useQuery` 훅 |
| JS 번들 | 브라우저에 없음 | 브라우저에 포함 |
| 캐시 위치 | 서버 메모리 (유저 간 공유) | 브라우저 메모리 (유저별 독립) |

### Next.js fetch 캐싱 옵션

```ts
// 빌드 타임 고정
fetch(url, { cache: 'force-cache' })

// N초마다 갱신 (ISR)
fetch(url, { next: { revalidate: 60 } })

// 캐시 없음
fetch(url, { cache: 'no-store' })
```

캐시 무효화: `revalidatePath()` / `revalidateTag()`

에러 처리: `error.tsx` (페이지 단위), 로딩: `loading.tsx` (Suspense 자동)

### TanStack Query 캐싱

```ts
useQuery({
  queryKey: ['posts'],
  queryFn: fetchPosts,
  staleTime: 60_000,  // 이 시간 동안 fresh → 재요청 없음
  gcTime: 5 * 60_000, // 언마운트 후 이 시간 지나면 캐시 GC
})
```

- 에러: `isError` / `error` 상태로 인라인 처리
- 자동 재시도: `retry: 3` (기본값)
- 자동 재요청: `refetchOnWindowFocus` / `refetchOnReconnect`

### prefetch + HydrationBoundary — SSR과 클라이언트 캐시 동시에

SSR의 초기 HTML 포함 + TanStack Query의 클라이언트 캐시 관리를 동시에 얻는 패턴.

```tsx
// 서버 컴포넌트
export default async function Page() {
  const queryClient = new QueryClient()

  await queryClient.prefetchQuery({
    queryKey: ['posts'],
    queryFn: () => fetch('https://api.example.com/posts').then(r => r.json()),
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PostList />
    </HydrationBoundary>
  )
}
```

```tsx
// 클라이언트 컴포넌트
'use client'
export default function PostList() {
  const { data } = useQuery({
    queryKey: ['posts'],  // 서버와 같은 key → 캐시 히트
    queryFn: fetchPosts,
    staleTime: 60_000,
  })
  // isLoading: false, data 즉시 있음 → 스피너 없음
}
```

**주의**: `queryKey`가 서버/클라이언트에서 동일해야 캐시 히트. `staleTime: 0` (기본값)이면 hydrate 직후 백그라운드 refetch 발생.

### React.cache() — 같은 렌더 내 중복 제거

```tsx
import { cache } from 'react'

const getUser = cache(async (id: string) => {
  return fetch(`/api/users/${id}`).then(r => r.json())
})

// 같은 렌더 사이클 내 동일 인자 호출 → fetch 재실행 없음
await getUser('123') // fetch 실행
await getUser('123') // 메모이즈된 결과 반환
```

| | `React.cache()` | Next.js fetch 캐시 |
|---|---|---|
| 캐시 지속 | 요청 1개 안에서만 | 서버 메모리 (요청 간 공유) |
| 목적 | 같은 렌더 트리 내 중복 제거 | ISR / 빌드 타임 캐시 |

### 언제 무엇을 쓸까

| 상황 | 선택 |
|---|---|
| SEO 필요한 공개 페이지, 블로그, 제품 목록 | Next.js fetch (Server Component) |
| 대시보드, 실시간 데이터, 유저별 피드 | TanStack Query (Client Component) |
| SSR + 클라이언트 캐시 관리 모두 필요 | prefetch + HydrationBoundary 조합 |
| 순수 React(Vite) 환경 | TanStack Query / SWR |
| 같은 렌더 내 중복 fetch 제거 (서버) | React.cache() |

## 관련 페이지

- [TanStack Query 설정 & 고급 패턴](./tanstack-query-config.md) — staleTime/gcTime, Optimistic Update, Mutation 패턴
- [React Query 로딩 전략](./loading-strategy.md) — useQuery vs Suspense vs 서버 프리패칭 비교
- [Next.js 캐싱 전략](./nextjs-caching.md) — 4가지 캐싱 레이어 상세 설명
- [SSR/SSG/ISR/CSR](../../concepts/ssr-ssg-isr-csr.md) — 서버/클라이언트 렌더링 전략

## 출처

- Next.js fetch vs TanStack Query — 2026-04-15
