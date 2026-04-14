# 프론트엔드 실전 에러 패턴 모음

> React Hook Form 리렌더링, searchParam 인코딩, Zustand 스토어 초기화, recharts/shadcn 호환성 — 실제 프로덕션에서 만난 에러와 해결법.

## 핵심 내용

### 1. React Hook Form — 불필요한 리렌더링 방지

**증상**: 폼 필드 하나 변경 시 전체 폼 컴포넌트 리렌더링

**원인**: `watch()` 사용 또는 form 객체를 prop으로 내려보내는 패턴

**해결 패턴**:

```tsx
// ❌ 잘못된 패턴 - watch()는 전체 폼 구독
function ParentForm() {
  const { register, watch } = useForm()
  const value = watch('fieldName')  // 모든 변경마다 리렌더링
  return <ChildField form={form} />  // prop으로 전달도 NG
}

// ✅ 올바른 패턴 - useFormContext + useWatch
function ParentForm() {
  const methods = useForm()
  return (
    <FormProvider {...methods}>
      <ChildField />
    </FormProvider>
  )
}

function ChildField() {
  const { register } = useFormContext()     // prop drilling 불필요
  const value = useWatch({ name: 'fieldName' })  // 해당 필드만 구독
  return <input {...register('fieldName')} />
}
```

**3가지 규칙**:
1. `watch` 대신 `useWatch` — 해당 컴포넌트만 리렌더링
2. `useFormContext` 사용 — prop drilling 제거
3. Zustand 상태도 `useStore(store, selector)` 부분 구독

---

### 2. searchParam 인코딩 — `+`가 공백으로 변환되는 문제

**증상**: Base64 또는 암호화된 값을 URL 파라미터로 전달 시 매칭률 0%

**원인**: URL 쿼리스트링에서 `+`는 공백(space)으로 해석됨

```
암호화 결과: "abc+def/ghi="
URL 전달:    ?token=abc+def/ghi=
서버 수신:   "abc def/ghi="   ← + 가 space로 디코딩됨
매칭 실패!
```

**해결**:

```typescript
// ❌ 그냥 전달
router.push(`/verify?token=${encryptedValue}`)

// ✅ 방법 1: encodeURIComponent
router.push(`/verify?token=${encodeURIComponent(encryptedValue)}`)

// ✅ 방법 2: + 문자만 수동 교체
router.push(`/verify?token=${encryptedValue.replaceAll('+', '%2B')}`)

// 수신 측 (Next.js App Router)
const token = searchParams.get('token')
// encodeURIComponent 사용 시 자동 디코딩되므로 추가 처리 불필요
```

---

### 3. Zustand 스토어 — 로그인 시 초기화 타이밍

**증상**: 이전 계정 데이터가 다음 계정에서도 보임

**원인**: 로그아웃 핸들러에서 스토어를 지우면 **로그인 리다이렉트 후** 지워짐 (race condition)

```
로그아웃 클릭
→ 로그인 페이지로 이동 (리다이렉트 먼저 실행)
→ 새 계정으로 로그인 시작
→ clearAllStores() 실행  ← 너무 늦음!
→ 새 계정으로 로그인했는데 이전 데이터 잔류
```

**해결**: 로그인 제출 시점에 초기화

```typescript
// ❌ 로그아웃 핸들러에서 초기화
function logout() {
  router.push('/login')
  clearAllStores()    // 리다이렉트 후 실행될 수 있음
}

// ✅ 로그인 제출 시점에 초기화
async function handleLoginSubmit(credentials) {
  clearAllStores()    // 로그인 전에 확실히 초기화
  await login(credentials)
  router.push('/dashboard')
}
```

---

### 4. recharts v3 + shadcn/ui 호환성 오류

**증상**: shadcn `chart` 컴포넌트 사용 시 차트 미렌더링 또는 에러

**원인**: shadcn/ui의 chart 컴포넌트는 recharts v2 API 기반 — recharts v3와 API 변경

**해결 방법 1**: recharts 직접 사용 (shadcn 래퍼 우회)

```tsx
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts'

function MyChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="value" stroke="#8884d8" />
      </LineChart>
    </ResponsiveContainer>
  )
}
```

**해결 방법 2**: shadcn chart 컴포넌트 재설치 (v2.15.4 기준)

```bash
pnpm dlx shadcn@latest add chart
# 자동으로 호환되는 recharts 버전으로 설치
```

| 상황 | 권장 방법 |
|------|----------|
| 이미 recharts v3 사용 중 | 방법 1 (ResponsiveContainer 직접) |
| shadcn 차트 컴포넌트 쓰고 싶음 | 방법 2 (재설치) |

---

### 5. TurboRepo — 패키지 간 스타일 미적용

**증상**: `packages/ui`의 컴포넌트를 `apps/web`에서 가져왔는데 Tailwind 스타일 없음

**원인**: `tailwind.config.ts`의 `content` 경로가 실제 파일 위치와 불일치

```typescript
// packages/ui/tailwind.config.ts
// ❌ src/ 폴더 없을 때 경로
content: ['../../packages/ui/**/*.{js,ts,jsx,tsx}']

// ✅ src/ 폴더 사용 시
content: ['../../packages/ui/src/**/*.{js,ts,jsx,tsx}']
//                                ↑ src/ 추가 필수
```

**TurboRepo 의존성 버전 불일치**

```
apps/web의 lodash: 4.17.20
apps/admin의 lodash: 4.17.21
→ 빌드 오류 또는 예상치 못한 동작
```

```yaml
# pnpm-workspace.yaml
packages:
  - 'apps/*'
  - 'packages/*'

# ✅ pnpm catalog (pnpm 8+) — 중앙 버전 관리
# pnpm-workspace.yaml
catalog:
  lodash: "4.17.21"
  react: "18.3.1"

# 각 package.json
{
  "dependencies": {
    "lodash": "catalog:"    # catalog에서 버전 참조
  }
}
```

| 방식 | 특징 |
|------|------|
| `workspace:*` | 모노레포 내부 패키지 참조 (호이스팅) |
| `catalog:` | 외부 패키지 버전 중앙 관리 (pnpm 8+) |

독립 배포 앱이 여러 개인 경우 `catalog:` 사용 권장.

## 관련 페이지

- [Context와 Zustand](./context-zustand.md) — Zustand 부분 구독 패턴
- [useMemo vs useCallback vs React.memo](./usememo-usecallback-reactmemo.md) — 리렌더링 방지
- [모노레포 — Turborepo 기초](../infra/monorepo-turborepo.md) — pnpm workspace 설정
- [Next.js 환경변수 관리](./nextjs-env-vars.md) — URL 인코딩 관련 환경변수 처리

## 출처

- form 요소 re-redering 방지 — 2026-04-14
- searchParam의 복호화 변환 시 매칭률이 0으로 나오는 문제 — 2026-04-14
- 이전 계정의 searchParam이 다른계정에서도 유지가 됨 — 2026-04-14
- GA에서 차트가 안 나오는 문제 — 2026-04-14
- tuborepo 사용 시 app간의 모듈 버전 불일치 — 2026-04-14
- TurboRepo에서 package에서 가져온 컴포넌트 스타일이 적용되지 않음 — 2026-04-14
