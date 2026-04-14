# useMemo vs useCallback vs React.memo

> React의 세 가지 메모이제이션 API의 차이, 동작 원리, 그리고 올바른 사용 기준.

## 핵심 내용

### 세 API 한눈에 비교
| API | 메모이제이션 대상 | 언제 재계산/리렌더 |
|-----|-----------------|------------------|
| `useMemo` | **값(value)** | 의존성 배열 변경 시 |
| `useCallback` | **함수(function)** | 의존성 배열 변경 시 |
| `React.memo` | **컴포넌트(component)** | props shallow equal 실패 시 |

### useMemo — 연산 결과 캐싱
```tsx
const expensiveValue = useMemo(() => {
  return items.filter(i => i.active).sort(compareFn)
}, [items])
```
- 렌더링 도중 실행되는 순수 계산에 적용
- 의존성이 같으면 이전 결과를 그대로 반환
- 사용 기준:
  - 연산 시간이 유의미하게 길 때 (≥1ms 기준으로 판단)
  - 참조 동일성이 필요한 객체/배열을 effect 의존성에 넣을 때

### useCallback — 함수 참조 안정화
```tsx
const handleSubmit = useCallback((data: FormData) => {
  submitForm(data)
  navigate('/success')
}, [navigate])
```
- `useMemo(() => fn, deps)`의 단축 문법
- 사용 기준:
  - `React.memo`로 감싼 자식에 콜백을 prop으로 전달할 때
  - 함수가 `useEffect` / `useMemo` 의존성 배열에 포함될 때
- 주의: 단순 이벤트 핸들러에 무분별하게 쓰면 오히려 비용

### React.memo — 컴포넌트 리렌더 방지
```tsx
const ListItem = React.memo(function ListItem({ item, onDelete }) {
  return <div onClick={() => onDelete(item.id)}>{item.name}</div>
})
```
- 동작: 이전 props와 현재 props를 얕게 비교(shallow equal)
- 얕은 비교이므로 객체/함수 props는 매 렌더마다 새 참조 → `useMemo`/`useCallback` 필요
- 두 번째 인자로 커스텀 비교 함수 전달 가능
- 사용 기준:
  - 부모가 자주 리렌더되는데 자식은 변하지 않을 때
  - 렌더링 비용이 비싼 컴포넌트 (복잡한 DOM, 무거운 연산 포함)

### 함께 사용하는 패턴
```tsx
// 부모 컴포넌트
function Parent() {
  const [count, setCount] = useState(0)
  const [items, setItems] = useState<Item[]>([])

  // useCallback으로 안정화 → Child의 React.memo 효과 발휘
  const handleDelete = useCallback((id: string) => {
    setItems(prev => prev.filter(i => i.id !== id))
  }, [])

  // useMemo로 필터 결과 캐싱
  const activeItems = useMemo(() => items.filter(i => i.active), [items])

  return <Child items={activeItems} onDelete={handleDelete} />
}

// React.memo로 감싸 props 변경 시에만 리렌더
const Child = React.memo(({ items, onDelete }) => { ... })
```

### 남용 피하기
- 메모이제이션 자체도 비용 (클로저 생성, 캐시 비교)
- 단순 원시값(string, number)은 메모이제이션 불필요
- 렌더링이 실제로 문제가 될 때 React Profiler로 확인 후 적용
- React 19의 React Compiler(auto-memoization)가 점진적으로 이 부담을 줄이는 방향

## 관련 페이지

- [React 렌더링 최적화](./react-rendering-optimization.md) — 전체 최적화 전략
- [useTransition](./use-transition.md) — Concurrent 방식의 렌더 우선순위 제어
- [Context와 Zustand](./context-zustand.md) — 상태 변경이 리렌더에 미치는 영향

## 출처

- useMemo vs useCallback vs React.memo — 2026-04-10
