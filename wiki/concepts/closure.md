# 클로저 (Closure)

> 함수가 선언될 때의 렉시컬 환경을 기억하여, 외부 스코프의 변수에 접근할 수 있는 JavaScript의 핵심 메커니즘.

## 핵심 내용

### 정의
클로저는 **함수 + 그 함수가 선언된 렉시컬 환경**의 조합이다. 내부 함수가 외부 함수의 변수에 접근할 수 있으며, 외부 함수가 반환된 후에도 해당 변수는 메모리에 유지된다.

```js
function makeCounter() {
  let count = 0 // 클로저로 캡처되는 변수

  return {
    increment: () => ++count,
    decrement: () => --count,
    getCount: () => count,
  }
}

const counter = makeCounter()
counter.increment() // 1
counter.increment() // 2
counter.getCount()  // 2
// makeCounter 호출 스택은 종료됐지만 count는 살아있음
```

### 렉시컬 스코프 (Lexical Scope)
- JavaScript는 **렉시컬 스코프**: 함수가 **어디서 호출됐는지**가 아니라 **어디서 정의됐는지**가 스코프를 결정
- 클로저는 이 렉시컬 환경의 참조를 유지

### 클로저의 활용

#### 데이터 은닉 (캡슐화)
```js
function createAccount(initialBalance) {
  let balance = initialBalance // private

  return {
    deposit(amount) { balance += amount },
    withdraw(amount) {
      if (amount > balance) throw new Error('Insufficient funds')
      balance -= amount
    },
    getBalance() { return balance }
  }
}
```

#### 함수 팩토리
```js
function multiply(factor) {
  return (number) => number * factor // factor를 클로저로 캡처
}

const double = multiply(2)
const triple = multiply(3)
double(5) // 10
triple(5) // 15
```

#### 부분 적용 (Partial Application) / 커링 (Currying)
```js
const add = (a) => (b) => a + b
const add5 = add(5)
add5(3) // 8
```

### React에서의 클로저
React hooks는 클로저를 적극 활용한다.

```tsx
function Counter() {
  const [count, setCount] = useState(0)

  // handleClick은 렌더 시점의 count를 클로저로 캡처
  const handleClick = () => {
    console.log(count) // 현재 렌더의 count 값
    setCount(count + 1)
  }

  return <button onClick={handleClick}>{count}</button>
}
```

#### Stale Closure 문제
```tsx
useEffect(() => {
  const interval = setInterval(() => {
    setCount(count + 1) // ❌ count는 초기값(0)으로 고정됨
  }, 1000)
  return () => clearInterval(interval)
}, []) // 의존성 없음 → count가 업데이트되어도 클로저는 0을 참조

// 해결: 함수형 업데이트
useEffect(() => {
  const interval = setInterval(() => {
    setCount(prev => prev + 1) // ✅ 최신 값 기반 업데이트
  }, 1000)
  return () => clearInterval(interval)
}, [])
```

### 반복문과 클로저 (클래식 문제)
```js
// 문제: var는 블록 스코프가 없음
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100) // 3, 3, 3 출력
}

// 해결 1: let (블록 스코프)
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100) // 0, 1, 2 출력
}

// 해결 2: IIFE로 클로저 생성
for (var i = 0; i < 3; i++) {
  ;(function(j) {
    setTimeout(() => console.log(j), 100)
  })(i)
}
```

### 메모리 관리
- 클로저는 외부 변수를 참조하는 한 GC 대상이 되지 않음
- 불필요한 클로저가 큰 객체를 참조하면 메모리 누수 가능
- 이벤트 리스너, 타이머 등 명시적 해제 필요

## 관련 페이지

- [프로토타입](../concepts/prototype.md) — 클로저와 함께 JavaScript 핵심 개념
- [이벤트 루프와 비동기](../concepts/event-loop.md) — 비동기 콜백과 클로저의 관계
- [useEffect](../tech/frontend/use-effect.md) — React hook의 stale closure 문제
- [지연평가](../concepts/lazy-evaluation.md) — 렉시컬 환경과 지연실행 패턴

## 출처

- 클로저 — 2026-04-10
