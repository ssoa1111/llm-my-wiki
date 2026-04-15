# JavaScript 동작 원리 3대 핵심 — 클로저, 프로토타입, 이벤트 루프

> 렉시컬 스코프(클로저), 프로토타입 체인(상속), 단일 스레드 이벤트 루프(비동기)는 각각 독립된 개념이 아니라 하나의 실행 모델 위에서 맞물려 돌아가는 JavaScript의 핵심 세 축이다.

## 핵심 내용

### 세 개념의 역할 분담

JavaScript가 다른 언어와 다르게 동작하는 이유는 이 세 가지 설계 선택에서 비롯된다.

| 개념 | 다루는 문제 | 핵심 메커니즘 |
|------|------------|--------------|
| **클로저** | "함수가 어떤 값을 기억하는가" | 렉시컬 환경의 참조 유지 |
| **프로토타입** | "객체가 어떤 능력을 물려받는가" | `[[Prototype]]` 체인 탐색 |
| **이벤트 루프** | "코드가 언제, 어떤 순서로 실행되는가" | Call Stack + Task/Microtask Queue |

이 세 개념은 각자의 영역이 있지만, 실제 코드에서는 항상 동시에 작동한다. 클로저로 만들어진 메서드는 프로토타입 체인 위에 올라가고, 그 메서드가 비동기 콜백으로 호출될 때 이벤트 루프가 실행 순서를 제어한다.

---

### 클로저와 프로토타입이 맞물리는 방식

프로토타입 메서드는 `this`를 통해 인스턴스에 접근하지만, 클로저는 렉시컬 스코프를 통해 외부 변수를 캡처한다. 이 둘은 서로 다른 방식으로 "데이터에 접근"한다.

```js
function createPerson(name) {
  // name은 클로저로 캡처된 private 변수
  let _callCount = 0

  function Person() {}

  // 프로토타입에 올린 메서드 — 모든 인스턴스가 공유
  Person.prototype.greet = function() {
    _callCount++ // 클로저 변수에 접근
    return `Hi, I'm ${name}. Called ${_callCount} times.`
  }

  Person.prototype.getCallCount = function() {
    return _callCount // 클로저 변수 읽기
  }

  return new Person()
}

const alice = createPerson('Alice')
alice.greet()       // "Hi, I'm Alice. Called 1 times."
alice.greet()       // "Hi, I'm Alice. Called 2 times."
alice.getCallCount() // 2
```

여기서 `_callCount`는 클로저로 은닉된 private 상태이고, `greet`과 `getCallCount`는 프로토타입에 등록된 공유 메서드다. 두 메커니즘이 협력해 캡슐화를 구현한다.

---

### 이벤트 루프와 클로저가 맞물리는 방식

비동기 콜백은 항상 클로저를 통해 실행 시점의 값을 참조한다. 이벤트 루프가 콜백을 꺼내 실행할 때, 콜백이 캡처한 렉시컬 환경이 그대로 살아있다.

```js
function startTimer(label) {
  let elapsed = 0

  // setInterval 콜백은 elapsed를 클로저로 캡처
  const id = setInterval(() => {
    elapsed += 100
    console.log(`${label}: ${elapsed}ms`) // label과 elapsed 모두 클로저
  }, 100)

  // 1초 후 정리 — 이것도 id, label을 클로저로 캡처
  setTimeout(() => {
    clearInterval(id)
    console.log(`${label} 완료`)
  }, 1000)
}

startTimer('Task A')
// Task A: 100ms → 200ms → ... → 1000ms → Task A 완료
```

`startTimer` 함수 호출이 끝난 후에도 `elapsed`, `id`, `label`은 클로저 덕분에 살아 있고, 이벤트 루프가 매 100ms마다 Macrotask Queue에서 콜백을 꺼내 실행할 때 이 값들에 접근한다.

---

### 세 개념이 동시에 작동하는 통합 예제

다음 코드는 클로저(상태 은닉), 프로토타입(메서드 공유), 이벤트 루프(비동기 실행 순서)가 한 곳에서 모두 나타난다.

```js
class EventEmitter {
  // 인스턴스 속성 — 각 인스턴스가 개별 소유 (프로토타입 아님)
  #listeners = {}  // 클로저와 유사하게 외부에서 직접 접근 불가

  // 프로토타입 메서드 — 모든 인스턴스가 공유
  on(event, callback) {
    if (!this.#listeners[event]) this.#listeners[event] = []
    this.#listeners[event].push(callback)
  }

  emit(event, data) {
    const handlers = this.#listeners[event] ?? []
    handlers.forEach(fn => {
      // 각 핸들러를 microtask로 비동기 실행
      Promise.resolve().then(() => fn(data))
    })
  }
}

// 사용 예
const emitter = new EventEmitter()

let messageCount = 0 // 클로저로 캡처될 외부 상태

emitter.on('message', (data) => {
  messageCount++ // 클로저 — 콜백이 외부 변수 참조
  console.log(`[${messageCount}] ${data}`)
})

console.log('before emit')
emitter.emit('message', 'hello')  // 핸들러는 microtask로 예약
emitter.emit('message', 'world')  // 핸들러는 microtask로 예약
console.log('after emit')

// 출력 순서:
// before emit      ← 동기 (Call Stack)
// after emit       ← 동기 (Call Stack)
// [1] hello        ← Microtask Queue (Promise.then)
// [2] world        ← Microtask Queue (Promise.then)
```

이 예제에서:
- **프로토타입**: `on`, `emit`은 `EventEmitter.prototype`에 등록된 공유 메서드
- **클로저**: 이벤트 핸들러 `(data) => { messageCount++ ... }`가 외부 `messageCount`를 캡처
- **이벤트 루프**: `Promise.resolve().then()`으로 핸들러를 Microtask Queue에 넣어, 현재 동기 코드가 끝난 후 실행

---

### 실전에서 자주 마주치는 교차점

**1. 반복문 + 비동기 + 클로저 (클래식 함정)**
```js
// var는 블록 스코프 없음 → 클로저가 같은 i를 공유
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0) // 3, 3, 3
}

// let은 반복마다 새 렉시컬 환경 → 클로저가 각자의 i를 캡처
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 0) // 0, 1, 2
}
```
이벤트 루프가 콜백을 꺼낼 시점에 `var i`는 이미 3이 되어 있다. `let`은 반복마다 새 클로저를 만들어 이를 해결한다.

**2. 프로토타입 메서드의 this 바인딩 문제**
```js
class Timer {
  count = 0

  // 프로토타입 메서드: this는 호출 방식에 따라 결정됨
  tick() { this.count++ }

  // 인스턴스 메서드 (화살표 함수): this가 클로저로 고정
  tickArrow = () => { this.count++ }

  start() {
    setInterval(this.tick, 100)       // ❌ this가 undefined (strict mode)
    setInterval(this.tickArrow, 100)  // ✅ this가 인스턴스로 고정
    setInterval(this.tick.bind(this), 100) // ✅ bind로 명시적 고정
  }
}
```
이벤트 루프가 Macrotask에서 `this.tick`을 꺼내 실행할 때, 프로토타입 메서드는 `this` 컨텍스트를 잃는다. 화살표 함수는 클로저로 `this`를 렉시컬 환경에서 캡처해 이 문제를 해결한다.

---

### 세 개념의 연결 구조 요약

```
렉시컬 환경 (Lexical Environment)
  └─ 클로저: 함수가 선언 시점의 환경을 기억
       └─ 비동기 콜백도 클로저 → 이벤트 루프가 나중에 실행해도 값 유지

객체 시스템 (Object System)
  └─ 프로토타입: 객체 간 [[Prototype]] 링크로 메서드 공유
       └─ 메서드 내에서 클로저 변수에 접근 가능

실행 모델 (Execution Model)
  └─ 이벤트 루프: Call Stack 빌 때 Queue에서 콜백 꺼내 실행
       └─ 콜백은 클로저, 콜백 안의 객체는 프로토타입 체인을 탄다
```

세 개념 모두 "JavaScript는 단일 스레드 + 렉시컬 스코프 + 프로토타입 기반 언어"라는 하나의 설계 철학에서 파생된다. 이 구조를 이해하면 React의 Stale Closure, 이벤트 핸들러의 `this` 문제, Promise 실행 순서 같은 현실 버그의 원인을 한 번에 설명할 수 있다.

## 관련 페이지

- [클로저](../concepts/closure.md) — 렉시컬 환경을 기억하는 함수의 메커니즘
- [프로토타입](../concepts/prototype.md) — `[[Prototype]]` 체인을 통한 JavaScript 상속
- [이벤트 루프와 비동기](../concepts/event-loop.md) — Call Stack과 Task Queue로 구성된 단일 스레드 실행 모델

## 출처

- 클로저 — 2026-04-15
- prototype — 2026-04-15
- 이벤트 루프와 비동기 — 2026-04-15
