# Next.js 데이터 페칭 & 캐싱 전략 통합 가이드

> Next.js App Router의 4개 캐싱 레이어와 fetch/TanStack Query 이분법, 그리고 Suspense/useQuery/HydrationBoundary 패턴을 하나의 의사결정 로드맵으로 통합한다.

## 핵심 내용

### 1. 캐싱 4개 레이어 전체 지도

Next.js App Router는 캐싱 레이어를 4단계로 분리한다. 각 레이어는 독립적으로 작동하며, 하나가 miss되면 다음 레이어로 내려간다.

```
요청 진입
    ↓
[1] Router Cache        — 클라이언트, 방문 페이지 저장 (정적 5분 / 동적 30초)
    ↓ miss
[2] Full Route Cache    — CDN/서버, 빌드된 HTML+RSC (정적 라우트)
    ↓ miss
[3] Data Cache          — 서버 메모리, fetch 결과 (force-cache / revalidate / no-store)
    ↓ miss
[4] Request Memoization — 같은 렌더 사이클 내 동일 fetch 중복 제거 (자동)
    ↓ miss
네트워크 (실제 API 요청)
```

| 레이어 | 위치 | 범위 | 무효화 방법 |
|--------|------|------|------------|
| Router Cache | 브라우저 메모리 | 유저별 | `router.refresh()` |
| Full Route Cache | CDN/서버 | 전체 | `revalidatePath()`, 재빌드 |
| Data Cache | 서버 메모리 | 전체 | `revalidateTag()`, `revalidatePath()` |
| Request Memoization | 렌더 사이클 | 요청 1개 | 자동 (렌더 완료 시 소멸) |

---

### 2. 서버 캐시(fetch) vs 클라이언트 캐시(TanStack Query) — 근본적 이분법

두 캐시는 **실행 위치와 유저 공유 여부**가 다르다. 잘못 섞으면 보안 문제(유저 A의 데이터가 유저 B에게 노출)가 생긴다.

| | Next.js fetch (Server Component) | TanStack Query (Client Component) |
|---|---|---|
| 실행 위치 | 서버 | 브라우저 |
| 캐시 위치 | 서버 메모리 | 브라우저 메모리 |
| 유저 간 공유 | **공유됨** (주의!) | **독립** (유저별) |
| JS 번들 포함 | 없음 | 포함됨 |
| 사용 방식 | `async/await` | `useQuery` 훅 |
| 에러 처리 | `error.tsx` (페이지 단위) | `isError` 상태 (인라인) |
| 로딩 처리 | `loading.tsx` / Suspense 자동 | `isLoading` 상태 |

**핵심 규칙**: 인증된 유저별 데이터는 반드시 `cache: 'no-store'` 또는 TanStack Query 사용. `force-cache`는 공개 데이터 전용.

```typescript
// 서버 캐시 — 모든 유저가 동일한 결과 받음 (공개 데이터용)
const posts = await fetch('/api/posts', { next: { revalidate: 60 } })

// 클라이언트 캐시 — 유저별 독립 (개인화 데이터용)
const { data } = useQuery({ queryKey: ['my-profile'], queryFn: fetchMyProfile })
```

---

### 3. fetch Data Cache 설정 선택 가이드

```typescript
// 정적 (잘 안 바뀜) — Full Route Cache와 함께 CDN 서빙
await fetch(url)                                         // force-cache (기본값)

// 주기적 갱신 — ISR 패턴
await fetch(url, { next: { revalidate: 3600 } })         // 1시간마다 갱신

// On-demand 무효화 — 권장 패턴
await fetch(url, { next: { tags: ['posts'] } })
// → Server Action에서: revalidateTag('posts')

// 항상 최신 — SSR 패턴
await fetch(url, { cache: 'no-store' })                  // 캐싱 없음
```

| 데이터 특성 | fetch 설정 | 예시 |
|------------|-----------|------|
| 거의 안 바뀜 | 기본값 (force-cache) | 카테고리, 사이트 설정 |
| 주기적 업데이트 | `revalidate: N` | 블로그 목록, 상품 가격 |
| 이벤트 기반 갱신 | `tags` + `revalidateTag` | CMS 콘텐츠 |
| 실시간/유저별 | `no-store` | 프로필, 장바구니 |

---

### 4. TanStack Query 핵심 설정

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,      // 1분간 fresh → 네트워크 요청 없음
      gcTime: 1000 * 60 * 5,     // 5분 후 미사용 캐시 삭제
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
  queryCache: new QueryCache({
    onError: (error) => toast.error(error.message),  // 전역 에러 처리
  }),
})
```

**staleTime vs gcTime 상태 전이**:

```
fetch 완료 → [fresh] → staleTime 만료 → [stale] → 컴포넌트 언마운트
                                                          ↓
                                                    [inactive] → gcTime 만료 → 삭제
```

- `staleTime = 0` (기본): hydration 직후 즉시 백그라운드 refetch 발생 → prefetch+HydrationBoundary 패턴에서 반드시 조정 필요
- `staleTime > 0`: fresh 동안 캐시 히트, 화면 깜빡임 없음

---

### 5. 로딩 전략 3가지 비교 및 선택 기준

| 전략 | 코드 패턴 | 초기 HTML | 클라이언트 캐시 | 적합 케이스 |
|------|-----------|-----------|----------------|------------|
| `useQuery` | `isLoading` 직접 처리 | 없음 (CSR) | 있음 | 모달, 실시간, 소형 UI |
| `useSuspenseQuery` + Suspense | Suspense boundary 위임 | 없음 (CSR) | 있음 | 대시보드, 인증 페이지 |
| prefetch + HydrationBoundary + Suspense | 서버+클라이언트 혼합 | **있음** (SSR) | **있음** | 공개 페이지, SEO |

**코드 패턴 요약**:

```tsx
// 전략 1: useQuery (CSR, 간단)
const { data, isLoading, isError } = useQuery({ queryKey: ['posts'], queryFn: fetchPosts })
if (isLoading) return <Spinner />
if (isError) return <Error />
return <PostList data={data} />

// 전략 2: useSuspenseQuery + Suspense (로딩 로직 분리)
// 컴포넌트 내부
const { data } = useSuspenseQuery({ queryKey: ['posts'], queryFn: fetchPosts })
// data는 항상 존재, undefined 없음 (TypeScript 안전)

// 상위 레이아웃
<Suspense fallback={<Skeleton />}>
  <PostList />
</Suspense>

// 전략 3: prefetch + HydrationBoundary + Suspense (SSR + 클라이언트 캐시)
// 서버 컴포넌트 (page.tsx)
const queryClient = new QueryClient()
await queryClient.prefetchQuery({ queryKey: ['posts'], queryFn: fetchPosts })

return (
  <HydrationBoundary state={dehydrate(queryClient)}>
    <Suspense fallback={<Skeleton />}>
      <PostList />  {/* useSuspenseQuery — 캐시 히트, 즉시 렌더 */}
    </Suspense>
  </HydrationBoundary>
)
```

**HydrationBoundary vs Suspense 역할 구분**:
- `HydrationBoundary`: 서버 데이터를 클라이언트 캐시에 이식 → **중복 API 호출 방지**
- `Suspense`: 데이터 없을 때 fallback UI 표시 → **로딩 UX**

---

### 6. 의사결정 통합 로드맵

```
데이터가 유저별로 다른가?
  예 → TanStack Query (클라이언트 캐시)
        ├─ 실시간 / 소형 UI → useQuery
        ├─ 대시보드 / 복잡한 화면 → useSuspenseQuery + Suspense
        └─ 인증 페이지 + SEO → prefetch + HydrationBoundary + useSuspenseQuery
  아니오 → Next.js fetch (서버 캐시, 유저 간 공유)
        ├─ 거의 안 바뀜 → force-cache (기본값)
        ├─ 주기적 갱신 → revalidate: N
        ├─ 이벤트 기반 → tags + revalidateTag ⭐ 권장
        └─ 항상 최신 → no-store

SEO가 중요한가?
  예 → Server Component fetch 또는 prefetch + HydrationBoundary 조합
  아니오 → useQuery / useSuspenseQuery 단독 사용

같은 렌더 내 fetch 중복이 있는가?
  서버 → Request Memoization 자동 처리 (또는 React.cache() 명시적 사용)
  클라이언트 → TanStack Query queryKey 동일하면 자동 공유
```

---

### 7. 페이지 유형별 최종 선택표

| 페이지 유형 | 데이터 특성 | 권장 전략 |
|------------|------------|----------|
| 블로그, 제품 목록 | 공개, 공유 가능 | fetch + `revalidate` or `tags` |
| FAQ, 공지사항 | 공개, 정적 | fetch (force-cache) + Full Route Cache |
| 대시보드 | 유저별, 여러 위젯 | useSuspenseQuery + Suspense |
| 프로필 수정 | 유저별, 폼 | useQuery |
| 채팅, 실시간 | 유저별, 폴링 | useQuery + `refetchInterval` |
| 공개 페이지 + 클라이언트 상호작용 | 공개 + 개인화 | prefetch + HydrationBoundary + useSuspenseQuery |
| CMS 콘텐츠 | 공개, 이벤트 기반 갱신 | fetch + `tags` + Server Action `revalidateTag` |

---

### 8. 주의사항 & 흔한 실수

| 실수 | 원인 | 해결 |
|------|------|------|
| hydration 직후 즉시 refetch 발생 | `staleTime: 0` (기본값) | prefetch 패턴에서 `staleTime` 설정 |
| 서버 캐시에 유저 데이터 노출 | fetch에 `cache: 'no-store'` 누락 | 인증 데이터는 반드시 `no-store` 또는 TanStack Query |
| queryKey 불일치로 캐시 미스 | 서버/클라이언트 key가 다름 | `['posts']` 동일하게 유지 |
| Optimistic Update 후 덮어쓰기 | 백그라운드 refetch가 진행 중 | `cancelQueries` 선행 필수 |
| ISR이지만 사용자마다 stale 데이터 | cookies/headers 사용 시 자동 동적 렌더링 | 의도적 동적 라우트는 `dynamic = 'force-dynamic'` 명시 |

## 관련 페이지

- [Next.js 캐싱 전략](../tech/frontend/nextjs-caching.md) — 4가지 캐싱 레이어 상세 설명
- [Next.js fetch vs TanStack Query](../tech/frontend/nextjs-fetch-vs-tanstack.md) — 서버/클라이언트 캐시 이분법
- [React Query 로딩 전략](../tech/frontend/loading-strategy.md) — useQuery vs Suspense vs HydrationBoundary 비교
- [TanStack Query 설정 & 고급 패턴](../tech/frontend/tanstack-query-config.md) — staleTime/gcTime, Optimistic Update, Mutation

## 출처

- nextjs-caching.md — 2026-04-15
- nextjs-fetch-vs-tanstack.md — 2026-04-15
- loading-strategy.md — 2026-04-15
- tanstack-query-config.md — 2026-04-15
