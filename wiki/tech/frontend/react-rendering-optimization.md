# React 렌더링 최적화

> 불필요한 리렌더링을 방지하고 렌더링 비용을 최소화하는 React 패턴과 기법 모음.

## 핵심 내용

### 리렌더링 발생 조건
React 컴포넌트는 다음 세 가지 경우에 리렌더링된다:
1. **state 변경** — `useState`, `useReducer`의 값이 바뀔 때
2. **props 변경** — 부모로부터 새로운 props 값을 받을 때
3. **부모 리렌더링** — 부모 컴포넌트가 리렌더링되면 자식도 기본적으로 리렌더링

### React.memo
```tsx
const Child = React.memo(({ value }: { value: number }) => {
  return <div>{value}</div>
})
```
- props가 얕은 비교(shallow equal)로 같으면 리렌더링 건너뜀
- 렌더링 비용이 비싼 컴포넌트에 적용 효과적
- 주의: 함수·객체 props는 매 렌더마다 새로 생성되므로 `useCallback` / `useMemo`와 함께 사용

### useMemo
```tsx
const sorted = useMemo(() => heavySort(list), [list])
```
- 의존성 배열이 변경될 때만 재계산
- 연산 비용이 높은 값, 참조 동일성이 필요한 객체/배열에 사용
- 남용 금지: 단순 연산엔 메모이제이션 오버헤드가 더 큼

### useCallback
```tsx
const handleClick = useCallback(() => {
  doSomething(id)
}, [id])
```
- 함수 참조를 메모이제이션 → `React.memo` 자식에 콜백 전달 시 리렌더 방지
- 이벤트 핸들러, effect 의존성으로 쓰이는 함수에 적용

### 상태 끌어올리기 vs. 내려보내기
- **State Colocation**: 상태를 사용하는 컴포넌트와 최대한 가깝게 유지 → 관련 없는 컴포넌트 리렌더 방지
- **State Lifting**: 여러 컴포넌트가 공유해야 할 때만 상위로 이동

### 컴포넌트 분리 패턴
- 빠르게 변하는 부분과 느리게 변하는 부분을 별도 컴포넌트로 분리
- 리스트 아이템은 별도 컴포넌트 + `React.memo` 처리

### key prop 최적화
- 안정적이고 고유한 key 사용 (인덱스 key 지양)
- key 변경은 강제 마운트/언마운트 → 의도적 리셋에만 사용

### Virtualization (가상화)
- 긴 목록에서 보이는 항목만 DOM에 렌더링
- `react-window`, `react-virtual` 라이브러리 활용
- 수천 개 이상 목록에서 필수

### Concurrent Features (React 18+)
- `useTransition`: 급하지 않은 업데이트를 낮은 우선순위로 처리 → UI 블로킹 방지
- `useDeferredValue`: 값 업데이트를 지연, 입력 반응성 유지
- Automatic Batching: 이벤트 핸들러 외부(setTimeout, Promise 등)에서도 자동 배치

### Profiler로 측정
```tsx
<React.Profiler id="Component" onRender={callback}>
  <Component />
</React.Profiler>
```
- React DevTools Profiler로 어떤 컴포넌트가 얼마나 자주 렌더링되는지 파악 먼저

## 관련 페이지

- [useMemo vs useCallback vs React.memo](./usememo-usecallback-reactmemo.md) — 세 API의 차이와 사용 기준
- [useTransition](./use-transition.md) — 비긴급 업데이트를 낮은 우선순위로 처리
- [SSR/SSG/ISR/CSR](../../concepts/ssr-ssg-isr-csr.md) — 서버 렌더링 전략과의 관계
- [성능 측정 및 개선](./performance-measurement.md) — Core Web Vitals 측정 방법

## 출처

- React의 렌더링 최적화 — 2026-04-10
