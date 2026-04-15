# Zustand 완전 정리

> 보일러플레이트 없는 React 전역 상태 관리 라이브러리 (~1KB) — set/get/subscribe API, 미들웨어, 슬라이스 패턴 완전 정리.

## 핵심 내용

### 기본 사용법

```javascript
import { create } from 'zustand'

const useStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  reset: () => set({ count: 0 }),
}))

function Counter() {
  const { count, increment } = useStore()
  return <button onClick={increment}>{count}</button>
}
```

**핵심 특징**: Provider 불필요, 선택적 구독(selector), React 외부에서도 사용 가능

### 주요 API

**set** — 얕은 병합이 기본:
```javascript
set({ count: 5 })                          // 얕은 병합
set((state) => ({ count: state.count + 1 })) // 함수형
set({ count: 0 }, true)                    // replace: true → 완전 교체
```

**get** — 현재 상태 읽기 (액션 내부):
```javascript
const useStore = create((set, get) => ({
  double: () => set({ count: get().count * 2 })
}))
```

**selector** — 필요한 상태만 구독 (불필요한 리렌더 방지):
```javascript
const count = useStore((state) => state.count)
```

**getState / setState** — 컴포넌트 외부에서 사용:
```javascript
useStore.getState().count
useStore.setState({ count: 10 })
```

### subscribe — 리렌더 없이 상태 감시

> "상태 변화에 반응하고 싶지만, 리렌더링은 하기 싫을 때" 사용

```javascript
const unsub = useStore.subscribe(
  (state) => state.count,             // selector
  (count) => console.log('변경됨:', count) // callback
)
unsub() // 구독 해제
```

| 상황 | `useStore()` | `subscribe()` |
|---|---|---|
| UI 렌더링에 필요한 상태 | ✅ | ❌ |
| Canvas/D3/Three.js 연동 | ❌ | ✅ |
| GA·Mixpanel 분석 로깅 | ❌ | ✅ |
| 60fps 애니메이션 | ❌ | ✅ |
| 상태 간 연쇄 처리 | ❌ | ✅ |

```javascript
// 예: 60fps 애니메이션 (DOM 직접 조작)
useEffect(() => {
  const unsub = useStore.subscribe(
    (s) => s.scrollY,
    (y) => { headerRef.current.style.transform = `translateY(${y * 0.5}px)` }
  )
  return unsub
}, [])
```

### 미들웨어

**persist** — localStorage 영속성:
```javascript
import { persist } from 'zustand/middleware'

const useStore = create(persist(
  (set) => ({ count: 0 }),
  {
    name: 'my-storage',
    partialize: (state) => ({ count: state.count }), // 일부만 저장
  }
))
```

**immer** — 중첩 객체 직접 수정:
```javascript
import { immer } from 'zustand/middleware/immer'

// ❌ immer 없이
set((state) => ({ user: { ...state.user, address: { ...state.user.address, city: 'Seoul' } } }))

// ✅ immer 사용
set((state) => { state.user.address.city = 'Seoul' })
```

**미들웨어 조합**:
```javascript
const useStore = create(
  devtools(persist(immer((set) => ({ ... })), { name: 'storage-key' }))
)
```

### 슬라이스 패턴 — 대형 스토어 분리

스토어가 커지면 도메인별 슬라이스로 분리 후 하나로 합친다. `get()`으로 슬라이스 간 상태 참조 가능.

```javascript
// countSlice.js
export const createCountSlice = (set, get) => ({
  count: 0,
  increment: () => set((s) => ({ count: s.count + 1 })),
  resetIfUserLoggedOut: () => {
    if (!get().user) set({ count: 0 })  // userSlice 참조
  }
})

// store/index.js
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

const useStore = create(
  devtools(persist(immer((...a) => ({
    ...createCountSlice(...a),
    ...createUserSlice(...a),
    ...createCartSlice(...a),
  })), { name: 'app-storage' }))
)
```

> `(...a)`로 `set`, `get`, `api`를 각 슬라이스에 그대로 전달하는 것이 핵심.

### Redux vs Context vs Zustand

| | Redux | Context API | Zustand |
|---|---|---|---|
| 설정 복잡도 | 높음 | 낮음 | **매우 낮음** |
| 성능 | 좋음 | 리렌더 이슈 | **매우 좋음** |
| 번들 크기 | 큼 | 내장 | **~1KB** |
| DevTools | ✅ | ❌ | ✅ (미들웨어) |

## 관련 페이지

- [Context와 Zustand](./context-zustand.md) — React Context vs Zustand 비교, App Router SSR 패턴
- [프론트엔드 상태 관리](./state-management.md) — TanStack Query 포함 전체 상태 관리 패턴 비교
- [프론트엔드 실전 에러 패턴](./frontend-error-patterns.md) — Zustand 초기화 타이밍 이슈

## 출처

- Zustand 정리 🐻 — 2026-04-15
