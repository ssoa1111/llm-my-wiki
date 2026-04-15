# React 성능 최적화 — 메모이제이션부터 Core Web Vitals까지

> 불필요한 리렌더링 진단, 메모이제이션 API의 올바른 사용 기준, Core Web Vitals 측정, 체크리스트까지 — 진단→최적화→검증 사이클 완성 가이드.

## 핵심 내용

### 성능 문제의 두 축: 렌더링과 로딩

React 앱 성능 문제는 크게 두 영역에서 발생한다.

1. **렌더링 비용**: 불필요한 리렌더링, 무거운 연산, 긴 컴포넌트 트리
2. **로딩 비용**: 번들 크기, 이미지, 폰트, 네트워크 요청

두 영역은 별개가 아니다. 렌더링 최적화(INP)와 로딩 최적화(LCP, CLS)가 합쳐져야 Core Web Vitals 점수가 개선된다.

---

### 1단계 — 진단: 문제를 먼저 측정한다

최적화 전 반드시 측정이 선행되어야 한다. 추측 기반 최적화는 오버헤드만 늘린다.

#### React 리렌더링 진단

```
React DevTools Profiler
  → 어떤 컴포넌트가 → 얼마나 자주 → 왜 리렌더됐는지 확인
  → "Highlight updates when components render" 활성화
  → flame chart에서 렌더 시간 확인
```

리렌더링은 세 가지 조건에서 발생한다:
- state 변경 (`useState`, `useReducer`)
- props 변경 (참조 동일성 포함)
- 부모 컴포넌트 리렌더 (자식은 기본적으로 함께 리렌더)

#### Core Web Vitals 진단

| 지표 | 목표값 | 진단 도구 |
|------|--------|-----------|
| LCP (주요 콘텐츠 로딩) | ≤2.5s | Lighthouse, PageSpeed Insights |
| INP (입력 응답성) | ≤200ms | Chrome DevTools Performance 탭 |
| CLS (레이아웃 안정성) | ≤0.1 | Lighthouse, DevTools |

실사용 데이터(RUM) 수집:
```tsx
// Next.js reportWebVitals
export function reportWebVitals(metric: NextWebVitalsMetric) {
  sendToAnalytics(metric) // 실제 사용자 환경 데이터
}
```

Lab 데이터(Lighthouse)와 RUM을 함께 봐야 한다. Lighthouse는 인위적 환경이므로 실사용 데이터와 차이가 날 수 있다.

---

### 2단계 — 최적화: 메모이제이션 의사결정 흐름

#### useMemo / useCallback / React.memo 언제 쓰는가

```
리렌더링 문제가 Profiler로 확인됐는가?
│
├── NO → 최적화 불필요. 메모이제이션 추가하지 말 것.
│         (불필요한 메모이제이션은 클로저 생성 + 캐시 비교 비용)
│
└── YES → 어떤 종류의 문제인가?
          │
          ├── 자식 컴포넌트가 부모 리렌더 때 불필요하게 함께 리렌더됨
          │     └── React.memo로 자식 감싸기
          │           │
          │           └── props에 객체/함수가 있는가?
          │                 ├── 객체/배열 → useMemo로 안정화
          │                 └── 함수 → useCallback으로 안정화
          │
          ├── 렌더 중 무거운 연산이 매번 재실행됨
          │     └── useMemo 적용
          │           └── 연산 시간 ≥1ms인가?
          │                 ├── YES → useMemo 적용 가치 있음
          │                 └── NO → 원시값이면 그냥 인라인 계산
          │
          └── 함수가 useEffect / useMemo 의존성 배열에 들어가 있음
                └── useCallback으로 함수 참조 안정화
```

#### 올바른 조합 패턴

```tsx
function Parent() {
  const [items, setItems] = useState<Item[]>([])

  // 1. 함수 참조 안정화 → React.memo 자식에 전달할 때 효과 발휘
  const handleDelete = useCallback((id: string) => {
    setItems(prev => prev.filter(i => i.id !== id))
  }, [])

  // 2. 연산 결과 캐싱 → 필터/정렬 같은 무거운 배열 처리
  const activeItems = useMemo(() => items.filter(i => i.active), [items])

  return <Child items={activeItems} onDelete={handleDelete} />
}

// 3. props shallow equal 비교 → 불필요한 리렌더 차단
const Child = React.memo(({ items, onDelete }) => { ... })
```

세 API는 독립적으로 쓰면 효과가 반감된다. React.memo는 함수/객체 props의 참조가 매번 바뀌면 무용지물이 되므로, 반드시 useCallback/useMemo와 함께 적용해야 한다.

#### 남용 금지 기준

- 단순 원시값(string, number, boolean) → 메모이제이션 불필요
- React.memo 없이 useCallback만 쓰는 것 → 대부분 의미 없음
- Profiler 확인 없이 선제적 적용 → 오버엔지니어링

> React 19 React Compiler(auto-memoization)가 점진적으로 수동 메모이제이션 부담을 줄이는 방향으로 발전 중.

---

### 3단계 — 렌더링 구조 개선

메모이제이션만이 답이 아니다. 구조 자체를 바꾸면 더 근본적으로 해결된다.

#### State Colocation
상태를 사용하는 컴포넌트와 최대한 가깝게 위치시킨다. 전역 상태로 올리면 관련 없는 컴포넌트도 리렌더된다.

#### 컴포넌트 분리
빠르게 변하는 부분과 느리게 변하는 부분을 별도 컴포넌트로 분리한다.

#### 가상화 (Virtualization)
수천 개 이상의 긴 목록은 보이는 항목만 DOM에 렌더링한다 (`react-virtual`, `react-window`).

#### React 18 Concurrent Features
- `useTransition`: 비긴급 업데이트를 낮은 우선순위로 처리 → UI 블로킹 방지, INP 개선
- `useDeferredValue`: 값 업데이트 지연, 입력 반응성 유지
- Automatic Batching: Promise/setTimeout 내부에서도 상태 업데이트 자동 배치

---

### 4단계 — Core Web Vitals 최적화

#### LCP 개선 (주요 콘텐츠 로딩 속도)
- LCP 이미지에 `priority` prop 추가 → preload 처리
- `next/image`로 WebP/AVIF 자동 변환, lazy loading
- CDN + 캐싱으로 서버 응답 시간(TTFB) 단축
- 렌더링 차단 리소스 제거 (CSS/JS 지연 로딩)

#### CLS 개선 (레이아웃 안정성)
- 이미지/비디오에 `width`, `height` 명시 → 공간 예약
- 스켈레톤 UI로 콘텐츠 로딩 전 공간 확보
- `next/font`로 폰트 자가 호스팅 → 폰트 교체로 인한 레이아웃 이동 방지

#### INP 개선 (입력 응답성)
- 50ms 이상 Long Task → 청크로 분할
- `useTransition`으로 비긴급 렌더링 분리
- 이벤트 핸들러에 디바운스/스로틀 적용
- CPU 집약적 작업은 Web Worker로 분리

#### 번들 크기 최적화
```tsx
// 코드 스플리팅 — 초기 번들에서 분리
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Skeleton />,
})
```
- `@next/bundle-analyzer`로 번들 시각화
- Tree shaking 가능한 ESM 패키지 사용
- 무거운 라이브러리 경량 대체재 탐색 (moment → date-fns 등)

---

### 진단→최적화→검증 사이클

```
[진단]
  React DevTools Profiler → 리렌더링 핫스팟 파악
  Lighthouse / Chrome DevTools → LCP, INP, CLS 수치 확인
  RUM (reportWebVitals) → 실사용자 데이터 수집
        ↓
[최적화]
  렌더링 구조 개선 (State Colocation, 컴포넌트 분리)
  메모이제이션 적용 (React.memo + useCallback + useMemo 조합)
  Concurrent Features 활용 (useTransition, useDeferredValue)
  번들 최적화 (dynamic import, Tree shaking)
  리소스 최적화 (이미지, 폰트, 스크립트)
        ↓
[검증]
  Lighthouse 재측정 → 목표값 달성 여부 확인
  Profiler 재실행 → 리렌더링 감소 확인
  RUM 모니터링 → 실사용 환경에서 회귀 없는지 추적
  CI 성능 예산 → 자동 회귀 감지
        ↓
  개선됐는가? NO → 다시 [진단]으로
             YES → 모니터링 유지
```

---

### 실전 우선순위

성능 최적화를 처음 시작할 때 다음 순서로 접근한다:

1. **Lighthouse 측정** → 현재 점수 파악, 가장 큰 문제 영역 식별
2. **번들 크기 확인** → `@next/bundle-analyzer` 실행, 큰 청크 분리
3. **React Profiler** → 리렌더링 빈도·비용 높은 컴포넌트 파악
4. **메모이제이션 적용** → 확인된 병목에만 선택적으로
5. **이미지/폰트 최적화** → `next/image`, `next/font` 적용
6. **RUM 설정** → 실사용 데이터 지속 수집

## 관련 페이지

- [React 렌더링 최적화](../tech/frontend/react-rendering-optimization.md) — 리렌더링 조건과 최적화 패턴 전체
- [useMemo vs useCallback vs React.memo](../tech/frontend/usememo-usecallback-reactmemo.md) — 세 메모이제이션 API 비교와 사용 기준
- [성능 측정 및 개선](../tech/frontend/performance-measurement.md) — Core Web Vitals 지표와 측정 도구
- [성능 개선 체크리스트](../tech/frontend/performance-checklist.md) — 로딩·렌더링·네트워크 실전 체크리스트

## 출처

- React의 렌더링 최적화 — 2026-04-15
- useMemo vs useCallback vs React.memo — 2026-04-15
- 성능 측정 개선 — 2026-04-15
- 성능개선 체크리스트 — 2026-04-15
