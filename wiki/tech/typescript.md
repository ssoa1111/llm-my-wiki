# TypeScript

> JavaScript에 정적 타입 시스템을 추가한 언어로, 컴파일 타임 오류 검출과 IDE 지원 향상을 제공한다.

## 핵심 내용

### 기본 타입
```ts
// 원시 타입
let name: string = 'Alice'
let age: number = 30
let active: boolean = true
let nothing: null = null
let undef: undefined = undefined

// 배열
let nums: number[] = [1, 2, 3]
let strs: Array<string> = ['a', 'b']

// 튜플
let pair: [string, number] = ['age', 30]

// 특수 타입
let anything: any      // 타입 검사 비활성화 (지양)
let unknown: unknown   // 타입 검사 필요 (any의 안전한 버전)
function noop(): void {}
function fail(): never { throw new Error() } // 반환 안 함
```

### 인터페이스 vs 타입 별칭
```ts
// Interface — 객체 구조 정의, 확장(extends) 지원
interface User {
  id: string
  name: string
  email?: string // 선택적
}

interface Admin extends User {
  role: 'admin'
}

// Type Alias — 유니온, 인터섹션, 튜플 등 다양한 타입 표현
type Status = 'active' | 'inactive' | 'pending' // 유니온
type AdminUser = User & { role: 'admin' }         // 인터섹션
type Point = [number, number]                     // 튜플
```

**선택 기준:**
- 객체 형태 → 선호에 따라 둘 다 가능 (일관성 유지)
- 유니온/인터섹션/복잡한 타입 → `type`
- 라이브러리 공개 API → `interface` (선언 병합 지원)

### 제네릭 (Generics)
```ts
// 함수
function identity<T>(arg: T): T { return arg }
identity<string>('hello')
identity(42) // 타입 추론

// 인터페이스
interface ApiResponse<T> {
  data: T
  status: number
  message: string
}

// 제네릭 제약
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key]
}
```

### 유틸리티 타입
```ts
interface User { id: string; name: string; email: string; age: number }

Partial<User>          // 모든 속성 선택적
Required<User>         // 모든 속성 필수
Readonly<User>         // 모든 속성 읽기 전용
Pick<User, 'id' | 'name'>   // 선택한 속성만
Omit<User, 'age'>      // 특정 속성 제외
Record<string, User>   // 키-값 매핑
Exclude<'a'|'b'|'c', 'a'> // 'b' | 'c'
Extract<'a'|'b'|'c', 'a'|'b'> // 'a' | 'b'
NonNullable<string | null | undefined> // string
ReturnType<typeof fetchUser>  // 함수 반환 타입 추출
Parameters<typeof fetchUser>  // 함수 파라미터 타입 추출
```

### 타입 가드
```ts
// typeof
function process(value: string | number) {
  if (typeof value === 'string') {
    return value.toUpperCase() // string 타입 확정
  }
  return value.toFixed(2) // number 타입 확정
}

// instanceof
function handle(err: unknown) {
  if (err instanceof Error) {
    console.log(err.message) // Error 타입 확정
  }
}

// 사용자 정의 타입 가드
function isUser(obj: unknown): obj is User {
  return typeof obj === 'object' && obj !== null && 'id' in obj
}

// 판별 유니온 (Discriminated Union)
type Shape =
  | { kind: 'circle'; radius: number }
  | { kind: 'square'; side: number }

function area(shape: Shape): number {
  switch (shape.kind) {
    case 'circle': return Math.PI * shape.radius ** 2
    case 'square': return shape.side ** 2
  }
}
```

### 조건부 타입 & infer
```ts
type IsString<T> = T extends string ? 'yes' : 'no'
type A = IsString<string>  // 'yes'
type B = IsString<number>  // 'no'

// infer로 타입 추출
type UnwrapPromise<T> = T extends Promise<infer U> ? U : T
type C = UnwrapPromise<Promise<string>> // string
```

### React + TypeScript 패턴
```tsx
// 컴포넌트 props
interface ButtonProps {
  children: React.ReactNode
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void
  variant?: 'primary' | 'secondary'
  disabled?: boolean
}

const Button: React.FC<ButtonProps> = ({ children, onClick, variant = 'primary', disabled }) => (
  <button className={variant} onClick={onClick} disabled={disabled}>
    {children}
  </button>
)

// useState with type
const [user, setUser] = useState<User | null>(null)

// useRef
const inputRef = useRef<HTMLInputElement>(null)

// 이벤트
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setValue(e.target.value)
}
```

### tsconfig 주요 옵션
```json
{
  "compilerOptions": {
    "strict": true,           // 모든 엄격 검사 활성화 (권장)
    "noUncheckedIndexedAccess": true, // 인덱스 접근 시 undefined 포함
    "exactOptionalPropertyTypes": true, // 선택적 속성 타입 엄격화
    "target": "ES2022",
    "lib": ["ES2022", "DOM"],
    "moduleResolution": "bundler",
    "paths": { "@/*": ["./src/*"] } // 경로 별칭
  }
}
```

## 관련 페이지

- [프로토타입](../concepts/prototype.md) — TypeScript 클래스의 JavaScript 기반
- [React 렌더링 최적화](./frontend/react-rendering-optimization.md) — TypeScript와 React 최적화 패턴
- [기초 CS](../tech/cs-fundamentals.md) — 타입 시스템의 이론적 배경

## 출처

- Typescript — 2026-04-10
