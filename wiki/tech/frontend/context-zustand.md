# Context와 Zustand

> React Context API와 Zustand를 비교하고, 각각의 특성에 맞는 올바른 사용 시나리오를 정리한다.

## 핵심 내용

### Context API 동작 원리

```tsx
// 1. Context 생성
const CountContext = createContext<{ count: number; setCount: (n: number) => void } | null>(null)

// 2. Provider로 값 제공
function CountProvider({ children }: { children: React.ReactNode }) {
  const [count, setCount] = useState(0)
  return (
    <CountContext.Provider value={{ count, setCount }}>
      {children}
    </CountContext.Provider>
  )
}

// 3. Consumer에서 사용
function Counter() {
  const ctx = useContext(CountContext)
  if (!ctx) throw new Error('CountProvider 없음')
  return <button onClick={() => ctx.setCount(ctx.count + 1)}>{ctx.count}</button>
}
```

**Context 리렌더링 문제**: `value` 객체가 매 렌더마다 새로 생성되면 모든 Consumer 리렌더링.

```tsx
// ❌ 매 렌더마다 새 객체 → 모든 Consumer 리렌더
<CountContext.Provider value={{ count, setCount }}>

// ✅ useMemo로 참조 안정화
const value = useMemo(() => ({ count, setCount }), [count])
<CountContext.Provider value={value}>
```

### Context 성능 문제와 해결책

#### Context 분리
```tsx
// 자주 변하는 값과 드물게 변하는 값을 분리
const ThemeContext = createContext<Theme>('light')    // 드물게 변함
const UserContext = createContext<User | null>(null)  // 로그인 시 1회 변함
const CartContext = createContext<Cart>({ items: [] }) // 자주 변함
```

#### 상태와 디스패치 분리
```tsx
// 상태와 디스패치를 별도 Context로 분리
// 디스패치만 필요한 컴포넌트는 상태 변경에 영향받지 않음
const CountStateContext = createContext<number>(0)
const CountDispatchContext = createContext<Dispatch<Action>>(() => {})
```

### Zustand

```tsx
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

interface BearState {
  bears: number
  fish: number
  addBear: () => void
  removeFish: () => void
}

const useBearStore = create<BearState>()(
  devtools(
    persist(
      (set) => ({
        bears: 0,
        fish: 10,
        addBear: () => set((state) => ({ bears: state.bears + 1 })),
        removeFish: () => set((state) => ({ fish: state.fish - 1 })),
      }),
      { name: 'bear-storage' } // localStorage 키
    )
  )
)
```

#### Selector로 구독 최적화
```tsx
// ✅ bears만 변할 때만 리렌더 (fish 변경 시 리렌더 안 함)
function BearCount() {
  const bears = useBearStore((state) => state.bears)
  return <div>{bears} bears</div>
}

// ✅ 여러 값: shallow 비교 사용
import { shallow } from 'zustand/shallow'
const { bears, fish } = useBearStore(
  (state) => ({ bears: state.bears, fish: state.fish }),
  shallow
)
```

#### Zustand 미들웨어
- **`devtools`**: Redux DevTools 연동
- **`persist`**: localStorage/sessionStorage 영구 저장
- **`immer`**: 불변성 없이 직접 수정 문법 사용
- **`subscribeWithSelector`**: 특정 상태 변화 구독

### Context vs Zustand 비교

| 항목 | Context API | Zustand |
|------|------------|---------|
| 설치 | 내장 | 별도 패키지 (~1KB) |
| Provider | 필요 | 불필요 |
| 리렌더 제어 | 어려움 (전체 Consumer) | Selector로 세밀하게 |
| 외부 접근 | 불가 | `getState()`, `setState()` |
| DevTools | 없음 | devtools 미들웨어 |
| 비동기 | 직접 구현 | 직접 구현 (미들웨어 옵션) |
| 학습 비용 | 낮음 | 낮음 |

### 언제 무엇을 사용할까

**Context 적합:**
- 테마, 언어, 인증 정보 등 **드물게 변하는** 앱 전역 값
- 간단한 props drilling 해결
- 추가 라이브러리 없이 해결하고 싶을 때

**Zustand 적합:**
- 자주 변하는 전역 상태 (장바구니, 필터, 모달 상태 등)
- 컴포넌트 외부에서 상태 접근·수정 필요할 때
- Redux처럼 복잡한 설정 없이 전역 상태 관리
- DevTools 디버깅이 필요할 때

### Next.js App Router에서 Zustand
SSR 환경에서 store가 요청 간 공유되는 것을 방지하기 위해 Provider 패턴 사용:

```tsx
// store/use-counter-store.ts
export const createCounterStore = () => create<CounterState>()(...)

// components/counter-store-provider.tsx
'use client'
export const CounterStoreProvider = ({ children }: { children: React.ReactNode }) => {
  const storeRef = useRef<CounterStore | null>(null)
  if (!storeRef.current) {
    storeRef.current = createCounterStore()
  }
  return (
    <CounterStoreContext.Provider value={storeRef.current}>
      {children}
    </CounterStoreContext.Provider>
  )
}
```

## 관련 페이지

- [프론트엔드 상태 관리](./state-management.md) — 전체 상태 관리 솔루션 비교
- [React 렌더링 최적화](./react-rendering-optimization.md) — Context 리렌더링 최적화
- [SSR/SSG/ISR/CSR](../../concepts/ssr-ssg-isr-csr.md) — App Router에서의 상태 관리

## 출처

- Context와 Zustand — 2026-04-10
