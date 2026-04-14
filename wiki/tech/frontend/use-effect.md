# useEffect

> React에서 컴포넌트 외부와 동기화하기 위한 훅으로, 사이드 이펙트를 선언적으로 관리한다.

## 핵심 내용

### 기본 개념
`useEffect`는 컴포넌트를 **외부 시스템과 동기화**하는 도구다. "렌더링 후 무언가 실행"이 아니라 "이 state/props 값에 외부를 맞추기"라는 관점이 핵심.

```tsx
useEffect(() => {
  // setup: 동기화 로직
  const connection = createConnection(roomId)
  connection.connect()

  return () => {
    // cleanup: 이전 동기화 해제
    connection.disconnect()
  }
}, [roomId]) // 의존성: roomId가 변할 때마다 재실행
```

### 의존성 배열 규칙
| 배열 | 동작 |
|------|------|
| 생략 | 매 렌더 후 실행 |
| `[]` (빈 배열) | 마운트 시 1회만 실행 |
| `[a, b]` | a 또는 b가 변할 때 실행 |

- **규칙**: Effect 내부에서 읽는 반응형 값(props, state, 파생값)은 **모두** 의존성에 포함
- `eslint-plugin-react-hooks`의 `exhaustive-deps` 규칙으로 자동 검사

### 클린업(Cleanup)의 중요성
- React 18 Strict Mode에서 개발 환경에 한해 **effect를 2번 실행** → 클린업 없으면 중복 구독, 메모리 누수
- 구독, 타이머, 이벤트 리스너, DOM 조작, 애니메이션 모두 클린업 필요

```tsx
useEffect(() => {
  const timer = setInterval(tick, 1000)
  return () => clearInterval(timer) // cleanup
}, [])

useEffect(() => {
  window.addEventListener('resize', handleResize)
  return () => window.removeEventListener('resize', handleResize)
}, [handleResize])
```

### Effect가 필요 없는 경우 (흔한 안티패턴)
1. **렌더링 중 파생 데이터 계산** → Effect 대신 렌더링 중 직접 계산 or `useMemo`
2. **props 변경에 따른 state 초기화** → `key` prop 변경으로 처리
3. **부모에 이벤트 전달** → Effect 없이 이벤트 핸들러에서 직접 호출
4. **앱 초기화 로직** → 모듈 레벨에서 실행 (컴포넌트 외부)

### useEffect vs useLayoutEffect
| | `useEffect` | `useLayoutEffect` |
|--|-------------|------------------|
| 실행 타이밍 | 페인트 **후** (비동기) | 페인트 **전** (동기) |
| 용도 | 대부분의 사이드 이펙트 | DOM 측정, 동기적 레이아웃 조정 |
| SSR | 서버에서 실행 안 됨 | 서버에서 실행 안 됨 (경고 발생) |

### React 18 이후: useEffect와 Concurrent Mode
- React 18의 Concurrent 렌더링에서 Effect는 더 유연하게 스케줄링
- `startTransition` 내 업데이트로 인한 Effect는 낮은 우선순위로 처리될 수 있음

### 데이터 패칭의 권장 방향
- `useEffect` 내 직접 fetch는 Race condition, 중복 요청 문제 발생
- 프레임워크(Next.js Server Component, TanStack Query, SWR) 사용이 권장

```tsx
// 피해야 할 패턴
useEffect(() => {
  fetch(`/api/user/${id}`).then(r => r.json()).then(setUser)
}, [id])

// 권장: TanStack Query
const { data: user } = useQuery({ queryKey: ['user', id], queryFn: () => fetchUser(id) })
```

**useEffect + fetch 시 흔한 실수 2가지**:

```typescript
// ❌ 문제 1: await 누락 → Promise 객체가 state에 저장됨
setData(res.json());       // Promise 객체 💀

// ✅ 올바른 방법
setData(await res.json()); // 실제 데이터 ✅

// ❌ 문제 2: 언마운트 후 state 업데이트 → 메모리 누수
useEffect(() => {
  fetchData(); // 비동기 완료 전 언마운트 시 error
}, []);

// ✅ AbortController로 cleanup
useEffect(() => {
  const controller = new AbortController();
  
  async function fetchData() {
    const res = await fetch('/api/data', { signal: controller.signal });
    setData(await res.json());
  }
  
  fetchData();
  return () => controller.abort(); // 언마운트 시 fetch 취소
}, []);
```

### Promise.all vs Promise.allSettled

```typescript
// Promise.all → 하나라도 실패하면 전체 실패 (즉시 reject)
const [user, posts] = await Promise.all([fetchUser(), fetchPosts()])
// fetchUser 실패 → fetchPosts도 무시됨 💀

// Promise.allSettled → 각각 결과 반환 (전부 완료 대기)
const results = await Promise.allSettled([fetchUser(), fetchPosts()])
// [{ status: "fulfilled", value: user }, { status: "rejected", reason: err }]

// 직렬(3초) vs 병렬(1초)
const user = await fetchUser()  // 직렬: 1초
const posts = await fetchPosts() // + 1초
const comments = await fetchComments() // + 1초 = 총 3초

const [user, posts, comments] = await Promise.all([  // 병렬: 최대 1초
  fetchUser(), fetchPosts(), fetchComments()
])
```

## 관련 페이지

- [React 렌더링 최적화](./react-rendering-optimization.md) — 불필요한 Effect 제거로 최적화
- [이벤트 루프와 비동기](../../concepts/event-loop.md) — 비동기 처리 메커니즘
- [useTransition](./use-transition.md) — Concurrent 렌더링과 Effect 우선순위

## 출처

- useEffect — 2026-04-10
- JS 관련 문제 — 2026-04-14
