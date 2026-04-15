# 프론트엔드 상태 관리 계층화 — Context / Zustand / TanStack Query

> React 앱의 상태를 로컬 / 공유 클라이언트 / 서버 3계층으로 나누고, 각 계층에 맞는 도구를 배치하는 아키텍처 패턴.

## 핵심 내용

### 상태 3계층 모델

```
┌─────────────────────────────────────────────────────┐
│  서버 상태 (Server State)                             │
│  → TanStack Query (캐시, 백그라운드 refetch, mutation) │
├─────────────────────────────────────────────────────┤
│  공유 클라이언트 상태 (Shared Client State)            │
│  → 정적 전역값: Context API (테마, 언어, 인증)          │
│  → 동적 전역값: Zustand (장바구니, 모달, 필터)           │
├─────────────────────────────────────────────────────┤
│  로컬 상태 (Local State)                              │
│  → useState / useReducer (단일 컴포넌트 내부)           │
└─────────────────────────────────────────────────────┘
```

이 3계층을 혼용하지 않는 것이 핵심이다. 서버 데이터를 Zustand에 넣거나, 자주 변하는 전역값을 Context에 넣으면 성능 문제와 중복 동기화 이슈가 발생한다.

---

### 어떤 상태를 어디서 관리할까 — 의사결정 표

| 상태 예시 | 특성 | 적합한 도구 |
|-----------|------|------------|
| 입력 폼 값, 드롭다운 열림/닫힘 | 단일 컴포넌트, 짧은 생명주기 | `useState` |
| 다단계 폼 상태 | 단일 컴포넌트, 복잡한 전환 | `useReducer` |
| 테마(다크/라이트), 언어(i18n) | 전역, 드물게 변함 | **Context API** |
| 로그인 유저 정보 | 전역, 로그인 시 1회 설정 | **Context API** |
| 장바구니, 선택된 필터 | 전역, 자주 변함, 외부 접근 필요 | **Zustand** |
| 모달 상태, 사이드바 열림 | 전역, 자주 변함 | **Zustand** |
| 새로고침 후 유지할 UI 상태 | 전역, localStorage 영속 | **Zustand + persist** |
| API 데이터 (유저 목록, 게시글) | 서버 원천, 캐시 필요 | **TanStack Query** |
| 페이지네이션/무한스크롤 데이터 | 서버 원천, 페이지 전환 | **TanStack Query** |
| URL 필터, 정렬 파라미터 | SSR 연동, 공유 가능한 상태 | `searchParams` |

---

### Context API — 정적 전역값에 한정

Context는 구독 최적화 없이 **Provider 하위 모든 Consumer를 리렌더**시킨다.

```tsx
// ✅ 드물게 변하는 값 → Context 적합
const ThemeContext = createContext<'light' | 'dark'>('light')
const UserContext = createContext<User | null>(null)

// ❌ 자주 변하는 값 → 성능 저하
const CartContext = createContext<CartItem[]>([])  // Zustand로 대체
```

불가피하게 자주 변하는 값을 Context에 넣어야 한다면 `useMemo`로 참조 안정화하거나, 상태와 디스패치를 별도 Context로 분리한다.

```tsx
// 상태/디스패치 분리: 디스패치만 쓰는 컴포넌트는 상태 변화에 영향 안 받음
const CountStateContext = createContext<number>(0)
const CountDispatchContext = createContext<Dispatch<Action>>(() => {})
```

---

### Zustand — 동적 전역값의 표준

Provider 없이 어디서나 접근 가능한 외부 스토어 패턴. `selector`로 구독 범위를 최소화하는 것이 핵심이다.

```tsx
const useCartStore = create<CartState>()(
  devtools(
    persist(
      (set) => ({
        items: [],
        addItem: (item) => set((s) => ({ items: [...s.items, item] })),
        clearCart: () => set({ items: [] }),
      }),
      { name: 'cart-storage' }
    )
  )
)

// ✅ selector로 필요한 값만 구독 → 불필요한 리렌더 방지
function CartCount() {
  const count = useCartStore((s) => s.items.length)
  return <span>{count}</span>
}

// ✅ 여러 값 구독 시 shallow 비교
const { items, addItem } = useCartStore(
  (s) => ({ items: s.items, addItem: s.addItem }),
  shallow
)
```

**subscribe API**: UI 리렌더 없이 상태 변화에 반응해야 할 때 (Canvas/D3 연동, GA 이벤트 로깅, 60fps 애니메이션 등) 사용한다.

```tsx
useEffect(() => {
  const unsub = useCartStore.subscribe(
    (s) => s.items.length,
    (count) => analytics.track('cart_updated', { count })
  )
  return unsub
}, [])
```

스토어가 커지면 도메인별 **슬라이스 패턴**으로 분리한다.

```tsx
// 슬라이스 간 참조는 get()으로
export const createCartSlice = (set, get) => ({
  checkout: () => {
    if (!get().user) return  // userSlice 상태 참조
    set({ items: [] })
  }
})
```

---

### TanStack Query — 서버 상태 전담

서버 데이터는 캐시 관리, 백그라운드 동기화, 에러 재시도가 필수다. TanStack Query는 이를 선언적으로 처리한다.

```
[마운트]
  → 캐시 있음? → 즉시 반환 + stale이면 백그라운드 refetch (화면 깜빡임 없음)
  → 캐시 없음? → fetch → 로딩 상태
```

**staleTime vs gcTime 구분**:

| 옵션 | 역할 | 기본값 |
|------|------|--------|
| `staleTime` | "언제 다시 가져올까?" (네트워크 요청 여부) | 0 |
| `gcTime` | "언제 메모리에서 지울까?" | 5분 |

`staleTime`을 적절히 설정하면 동일 데이터를 구독하는 여러 컴포넌트가 네트워크 요청 1번으로 동기화된다.

**select로 캐시 데이터 변환**: 캐시엔 원본, 컴포넌트엔 변환값 전달.

```tsx
// 네트워크 요청 1번, 두 컴포넌트가 다르게 구독
const { data: pending } = useQuery({
  queryKey: ['todos'],
  queryFn: fetchTodos,
  select: (d) => d.filter(t => !t.done),
})
```

**Optimistic Update 패턴**:

```
onMutate → 낙관적 업데이트 + 스냅샷 저장
  ├── 성공 → onSuccess
  └── 실패 → onError (스냅샷으로 롤백)
  └── onSettled → invalidateQueries (항상 서버와 동기화)
```

---

### Next.js App Router에서의 주의사항

#### Server Component 제약
Server Component는 상태를 가질 수 없다. 상태 관련 로직은 반드시 `'use client'` 컴포넌트에서만 동작한다.

#### Zustand SSR hydration 문제
Next.js App Router의 SSR 환경에서 Zustand 모듈 스코프 스토어를 그대로 쓰면 **요청 간 스토어가 공유**되어 데이터 오염이 발생한다.

```tsx
// ❌ 모듈 스코프 → 서버에서 요청 간 공유
const useStore = create(...)

// ✅ createStore + Provider 패턴으로 요청별 인스턴스 격리
export const createCounterStore = () => create<CounterState>()(...)

// layout.tsx
export default function Layout({ children }) {
  return (
    <CounterStoreProvider>  {/* 요청마다 새 인스턴스 */}
      {children}
    </CounterStoreProvider>
  )
}
```

Provider 내부에서 `useRef`로 스토어 인스턴스를 보관하면 서버 hydration과 클라이언트 상태가 충돌 없이 연결된다.

#### TanStack Query SSR
`HydrationBoundary`와 `dehydrate`를 사용해 서버에서 프리패치한 데이터를 클라이언트 캐시에 주입한다. 이를 통해 초기 로딩 플리커 없이 SSR 데이터와 클라이언트 캐시가 연결된다.

---

### 도구별 핵심 비교

| 항목 | Context API | Zustand | TanStack Query |
|------|------------|---------|---------------|
| 용도 | 정적 전역값 공유 | 동적 클라이언트 상태 | 서버 데이터 캐시 |
| 리렌더 제어 | 어려움 (전체 Consumer) | Selector로 세밀하게 | queryKey 단위 |
| 외부 접근 | 불가 | `getState()` 가능 | `queryClient` 가능 |
| 번들 크기 | 내장 | ~1KB | ~13KB |
| DevTools | 없음 | devtools 미들웨어 | ReactQueryDevtools |
| SSR | 기본 지원 | Provider 패턴 필요 | HydrationBoundary |
| 비동기 | 직접 구현 | 직접 구현 | 내장 (stale/refetch) |
| 영속성 | 없음 | persist 미들웨어 | gcTime 기반 |

---

### 권장 조합

대부분의 Next.js 앱에서 아래 조합이 적합하다:

```
useState/useReducer  → 컴포넌트 내부 UI 상태
Context API          → 테마, 언어, 인증 정보 (드물게 변함)
Zustand              → 장바구니, 모달, 필터 등 동적 전역 UI 상태
TanStack Query       → 서버 API 데이터 전체
searchParams (URL)   → 필터, 정렬, 페이지 번호 (공유 가능한 상태)
```

Redux는 대규모 팀 / 엄격한 단방향 데이터 흐름이 요구되는 엔터프라이즈 환경에서만 고려한다.

## 관련 페이지

- [프론트엔드 상태 관리](../tech/frontend/state-management.md) — 상태 종류별 도구 선택 기준 전체 개요
- [Context와 Zustand](../tech/frontend/context-zustand.md) — Context API vs Zustand 심층 비교, App Router SSR 패턴
- [Zustand 완전 정리](../tech/frontend/zustand.md) — set/get/subscribe API, 미들웨어, 슬라이스 패턴 심화
- [TanStack Query 설정 & 고급 패턴](../tech/frontend/tanstack-query-config.md) — staleTime/gcTime, Optimistic Update, 에러 핸들링

## 출처

- 상태관리 — 2026-04-15
- Context와 Zustand — 2026-04-15
- Zustand 정리 — 2026-04-15
- TanStack Query 설정 — 2026-04-15
