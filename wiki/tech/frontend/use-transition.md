# useTransition

> React 18에서 도입된 훅으로, UI를 블로킹하지 않고 낮은 우선순위 상태 업데이트를 처리한다.

## 핵심 내용

### 등장 배경
React 18의 Concurrent Rendering은 렌더링 작업을 중단·재개할 수 있게 했다. `useTransition`은 이를 활용해 급하지 않은 업데이트를 "transition"으로 표시하여 UI 응답성을 유지한다.

### 기본 사용법
```tsx
const [isPending, startTransition] = useTransition()

function handleTabChange(tab: string) {
  startTransition(() => {
    setActiveTab(tab) // 이 업데이트는 낮은 우선순위
  })
}

return (
  <div>
    <button onClick={() => handleTabChange('settings')}>
      Settings
    </button>
    {isPending && <Spinner />} {/* transition 진행 중 표시 */}
    <TabContent tab={activeTab} />
  </div>
)
```

### 동작 원리
1. `startTransition` 내부의 state 업데이트는 **비긴급(non-urgent)** 으로 표시
2. 긴급 업데이트(타이핑, 클릭 피드백)가 들어오면 transition 렌더링 **중단** 후 긴급 처리
3. 긴급 처리 완료 후 transition 재개
4. `isPending`은 transition이 처리 중일 때 `true`

### useTransition vs useDeferredValue
| | `useTransition` | `useDeferredValue` |
|--|-----------------|-------------------|
| 제어 대상 | **상태 업데이트** | **값(derived value)** |
| 사용 위치 | 이벤트 핸들러 | 컴포넌트 내부 |
| 적합한 경우 | 내 코드의 state 업데이트 | 외부에서 받은 값 지연 |

```tsx
// useDeferredValue 예시
function SearchResults({ query }) {
  const deferredQuery = useDeferredValue(query) // 지연된 값으로 무거운 렌더 수행
  return <HeavyList query={deferredQuery} />
}
```

### 실제 활용 시나리오
1. **탭 전환**: 탭 클릭은 즉각 반응, 탭 내용 렌더링은 transition으로
2. **검색 필터**: 입력은 즉각, 필터된 목록 갱신은 transition으로
3. **페이지 전환**: Next.js App Router에서 `router.push`와 함께 로딩 UI 표시

### Next.js에서의 활용
```tsx
// App Router에서 navigate + pending 상태 표시
const router = useRouter()
const [isPending, startTransition] = useTransition()

function navigate(href: string) {
  startTransition(() => {
    router.push(href)
  })
}
```

### 제약사항
- `startTransition` 내부는 **동기** 코드만 (async/await 직접 불가)
- 텍스트 입력 제어(`input.value`)에는 사용 불가 — 입력은 항상 긴급 업데이트여야 함
- Transition 중 이전 렌더 결과가 화면에 유지되므로 stale UI 표시에 주의

## 관련 페이지

- [React 렌더링 최적화](./react-rendering-optimization.md) — 전체 최적화 전략
- [useMemo vs useCallback vs React.memo](./usememo-usecallback-reactmemo.md) — 다른 최적화 API
- [이벤트 루프와 비동기](../../concepts/event-loop.md) — 비동기 처리와 우선순위

## 출처

- useTransition — 2026-04-10
