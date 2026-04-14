# 프론트엔드 상태 관리

> React 애플리케이션에서 데이터의 흐름과 공유를 제어하는 다양한 패턴과 라이브러리 비교.

## 핵심 내용

### 상태의 종류
| 종류 | 정의 | 적합한 도구 |
|------|------|------------|
| Local State | 단일 컴포넌트 내부 | `useState`, `useReducer` |
| Shared State | 여러 컴포넌트가 공유 | Context, Zustand, Jotai |
| Server State | 서버 데이터 캐시 | TanStack Query, SWR |
| URL State | URL에 저장되는 상태 | Next.js `searchParams` |
| Form State | 폼 입력값 | React Hook Form |

### Context API
```tsx
const ThemeContext = createContext<Theme>('light')

function App() {
  const [theme, setTheme] = useState<Theme>('light')
  return (
    <ThemeContext.Provider value={theme}>
      <Page />
    </ThemeContext.Provider>
  )
}
```
- 전역으로 값을 공유하지만 **Consumer 컴포넌트 전부** 리렌더링
- 자주 변하는 값에 사용 시 성능 저하 → 분리 또는 `useMemo` 필요
- 적합: 테마, 언어, 인증 정보 등 드물게 변하는 전역 값

### Zustand
```tsx
const useStore = create<State>()(set => ({
  count: 0,
  increment: () => set(state => ({ count: state.count + 1 })),
}))
```
- 구독(selector) 기반: `useStore(s => s.count)` — count만 변할 때만 리렌더
- Provider 없음, 외부 스토어 패턴
- Immer 미들웨어로 불변성 편리하게 처리
- devtools 미들웨어로 Redux DevTools 연동
- 적합: 중규모 이상 전역 상태, 복잡한 비즈니스 로직

### Jotai
- atom 기반 원자적 상태 관리 (Recoil 영향)
- 의존 관계 자동 추적, 필요한 컴포넌트만 리렌더
- SSR 지원이 Recoil보다 안정적

### TanStack Query (React Query)
```tsx
const { data, isLoading } = useQuery({
  queryKey: ['user', id],
  queryFn: () => fetchUser(id),
  staleTime: 60_000,
})
```
- 서버 상태 전용: 캐싱, 백그라운드 재패치, optimistic update
- `queryKey` 기반 캐시 무효화
- `useMutation`으로 서버 쓰기 작업 처리

### Redux Toolkit
- 대규모 엔터프라이즈에서 여전히 사용
- `createSlice`로 보일러플레이트 감소
- RTK Query로 서버 상태 처리 가능
- 작은 프로젝트에는 과도한 복잡성

### 선택 기준
- **단순 공유**: Context (드물게 변하는 값)
- **전역 클라이언트 상태**: Zustand
- **서버 데이터**: TanStack Query
- **원자적 상태**: Jotai
- **대규모 팀 / 복잡한 비즈니스 로직**: Redux Toolkit

### Next.js App Router에서 상태 관리
- Server Component는 상태를 가질 수 없음 → 상태는 Client Component에만 존재
- URL(searchParams)을 상태로 활용하면 SSR과 자연스럽게 연동
- Zustand store를 Provider로 감싸 SSR hydration 처리 필요

## 관련 페이지

- [Context와 Zustand](./context-zustand.md) — Context API와 Zustand 심층 비교
- [React 렌더링 최적화](./react-rendering-optimization.md) — Context 리렌더링 문제 해결
- [SSR/SSG/ISR/CSR](../../concepts/ssr-ssg-isr-csr.md) — App Router에서 상태와 렌더링 전략

## 출처

- 상태관리 — 2026-04-10
