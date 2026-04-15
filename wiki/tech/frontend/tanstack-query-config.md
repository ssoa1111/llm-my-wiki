# TanStack Query 설정 & 고급 패턴

> QueryClient 전역 설정부터 staleTime/gcTime, Optimistic Update, 에러 핸들링까지 — TanStack Query v5 실전 설정 가이드.

## 핵심 내용

### 1. QueryClient 기본 설정

```typescript
import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,        // 1분간 fresh (네트워크 요청 안 함)
      gcTime: 1000 * 60 * 5,       // 5분 후 미사용 캐시 삭제 (구 cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,  // UX에 따라 조정
      throwOnError: false,
    },
    mutations: {
      retry: 0,                     // mutation은 기본적으로 재시도 안 함
    },
  },
  // 전역 에러 핸들러
  queryCache: new QueryCache({
    onError: (error) => toast.error(`오류 발생: ${error.message}`),
  }),
  mutationCache: new MutationCache({
    onError: (error) => toast.error(error.message),
  }),
})
```

---

### 2. staleTime vs gcTime — 핵심 차이

```
[데이터 fetch 완료]
      ↓
  ✅ fresh 상태    ← staleTime 동안 유지 → 네트워크 요청 안 함
      ↓ staleTime 만료
  🟡 stale 상태    ← 캐시엔 있음, refetch 트리거 생기면 재요청
      ↓ 컴포넌트 언마운트 (아무도 안 씀)
  ⏳ inactive 상태  ← gcTime 카운트 시작
      ↓ gcTime 만료
  🗑️ 캐시에서 완전 삭제
```

| 옵션 | 역할 | 기본값 |
|------|------|--------|
| `staleTime` | "언제 다시 가져올까?" (네트워크) | 0 |
| `gcTime` | "언제 메모리에서 지울까?" | 5분 |

> **핵심**: `staleTime`이 지나도 캐시엔 남음 → 화면 깜빡임 없이 기존 데이터 보여주고 백그라운드 refetch

---

### 3. 주요 쿼리 옵션

**조건부 실행 (`enabled`)**:

```typescript
const { data: user } = useQuery({ queryKey: ['user'], queryFn: fetchUser })

const { data: posts } = useQuery({
  queryKey: ['posts', user?.id],
  queryFn: () => fetchPosts(user.id),
  enabled: !!user?.id,  // user가 있을 때만 실행
})
```

**데이터 변환 (`select`)**:

```typescript
// 캐시엔 원본 데이터, 컴포넌트엔 변환된 값
const { data: todoCount } = useQuery({
  queryKey: ['todos'],
  queryFn: fetchTodos,
  select: (data) => data.filter(todo => !todo.done).length,
})

// 같은 쿼리를 여러 컴포넌트가 다르게 구독 (네트워크 요청 1번)
function DoneTodos() {
  const { data } = useQuery({
    queryKey: ['todos'],
    queryFn: fetchTodos,
    select: d => d.filter(t => t.done),
  })
}
```

**폴링 (`refetchInterval`)**:

```typescript
// 진행 중일 때만 폴링
const { data } = useQuery({
  queryKey: ['job', jobId],
  queryFn: () => fetchJobStatus(jobId),
  refetchInterval: (query) => {
    if (query.state.data?.status === 'completed') return false  // 완료되면 중단
    return 2000  // 진행 중이면 2초마다
  },
})
```

**initialData vs placeholderData**:

```typescript
// initialData: 캐시에 저장됨, staleTime 적용됨
useQuery({
  queryKey: ['user', id],
  queryFn: fetchUser,
  initialData: () => queryClient.getQueryData(['users'])?.find(u => u.id === id),
  initialDataUpdatedAt: () => queryClient.getQueryState(['users'])?.dataUpdatedAt,
  // ↑ 없으면 initialData가 "방금 받은 것"으로 취급 → staleTime 동안 refetch 안 함!
})

// placeholderData: 캐시에 저장 안 됨, 임시 표시용
import { keepPreviousData } from '@tanstack/react-query'

const { data, isPlaceholderData } = useQuery({
  queryKey: ['todos', page],
  queryFn: () => fetchTodos(page),
  placeholderData: keepPreviousData,  // 페이지 전환 시 이전 데이터 유지
})
<button disabled={isPlaceholderData}>다음</button>
```

| | `initialData` | `placeholderData` |
|---|---|---|
| 캐시 저장 | ✅ | ❌ |
| staleTime 적용 | ✅ | ❌ |
| 용도 | 다른 캐시에서 데이터 재활용 | 로딩 UX 개선, 페이지네이션 |

---

### 4. Mutation & Optimistic Update

```typescript
const mutation = useMutation({
  mutationFn: updateUser,

  onMutate: async (variables) => {
    // 1. 진행 중인 refetch 취소 (낙관적 업데이트 덮어쓰기 방지)
    await queryClient.cancelQueries({ queryKey: ['user'] })

    // 2. 롤백용 스냅샷 저장
    const previous = queryClient.getQueryData(['user'])

    // 3. 낙관적 업데이트
    queryClient.setQueryData(['user'], old => ({ ...old, ...variables }))

    return { previous }  // onError에서 쓸 rollback 데이터
  },

  onError: (err, variables, context) => {
    queryClient.setQueryData(['user'], context.previous)  // 롤백
  },

  onSuccess: () => toast.success('저장됐어요!'),
  onSettled: () => queryClient.invalidateQueries({ queryKey: ['user'] }),
  // onSettled = 성공/실패 상관없이 항상 실행 → 서버 데이터로 동기화
})
```

> **cancelQueries가 필요한 이유**: 백그라운드 refetch가 진행 중이면 낙관적 업데이트를 옛날 데이터로 덮어씌울 수 있음

> **onSettled vs onSuccess**: `invalidateQueries`는 `onSuccess`보다 `onSettled`에 두는 게 안전 (실패해도 동기화)

---

### 5. 에러 핸들링

```
에러 발생
  ├─ throwOnError: false → error 상태로 저장 → QueryCache.onError로 전역 처리
  └─ throwOnError: true  → ErrorBoundary/error.tsx로 전파
```

```typescript
// 전략 조합
// API 인터셉터 → 인증 에러 (401 redirect)
// QueryCache.onError → toast 알림
// throwOnError → 복구 불가능한 에러 → error.tsx
```

---

### 6. DevTools

```tsx
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MyApp />
      <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
    </QueryClientProvider>
  )
}
```

---

### 전체 흐름 요약

```
[마운트] → 캐시 있음? → 즉시 반환 + stale이면 백그라운드 refetch
           캐시 없음? → fetch → 로딩 상태

[Mutation]
onMutate → 낙관적 업데이트 + 스냅샷
  ├── 성공 → onSuccess → onSettled
  └── 실패 → onError(롤백) → onSettled
```

## 관련 페이지

- [프론트엔드 상태 관리](./state-management.md) — Context/Zustand/TanStack Query 패턴 비교
- [React Query 로딩 전략](./loading-strategy.md) — useQuery vs Suspense vs 서버 프리패칭
- [useEffect](./use-effect.md) — fetch + AbortController, Promise.all vs allSettled
- [프론트엔드 실전 에러 패턴](./frontend-error-patterns.md) — React Hook Form, Zustand 초기화
- [Next.js fetch vs TanStack Query](./nextjs-fetch-vs-tanstack.md) — Server Component fetch와의 캐싱 비교

## 출처

- TanStack Query 설정 — 2026-04-14
