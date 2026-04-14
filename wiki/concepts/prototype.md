# 프로토타입 (Prototype)

> JavaScript의 상속 메커니즘으로, 모든 객체는 프로토타입 체인을 통해 다른 객체의 속성과 메서드를 공유한다.

## 핵심 내용

### 프로토타입 체인
JavaScript의 모든 객체는 `[[Prototype]]` 내부 슬롯을 가지며, 이를 통해 다른 객체를 참조한다. 속성 접근 시 객체 자신 → 프로토타입 → 프로토타입의 프로토타입 → ... → `null` 순으로 탐색한다.

```js
const animal = {
  breathe() { return 'breathing' }
}

const dog = Object.create(animal)
dog.bark = function() { return 'woof' }

dog.bark()    // 'woof' — 자신의 속성
dog.breathe() // 'breathing' — 프로토타입 체인 탐색
dog.toString() // Object.prototype.toString — 체인 끝까지 탐색
```

### `__proto__` vs `prototype`
| | `__proto__` | `prototype` |
|--|-------------|-------------|
| 위치 | 모든 **객체** | **함수** 객체만 |
| 의미 | 이 객체의 프로토타입 | 이 생성자로 만들 객체들의 프로토타입 |
| 표준 | 비표준 (레거시) | 표준 |

```js
function Person(name) {
  this.name = name
}
Person.prototype.greet = function() {
  return `Hi, I'm ${this.name}`
}

const alice = new Person('Alice')
alice.__proto__ === Person.prototype // true
alice.greet() // "Hi, I'm Alice"
```

### 생성자 함수와 new 연산자
`new` 키워드의 동작:
1. 빈 객체 생성
2. 생성자의 `prototype`을 새 객체의 `[[Prototype]]`으로 연결
3. 생성자 함수 실행 (`this` = 새 객체)
4. 반환값이 객체이면 그것을, 아니면 새 객체 반환

```js
// new 내부 동작 직접 구현
function myNew(Constructor, ...args) {
  const obj = Object.create(Constructor.prototype)
  const result = Constructor.apply(obj, args)
  return result instanceof Object ? result : obj
}
```

### 클래스(Class)와 프로토타입
ES6 class는 **문법적 설탕(syntactic sugar)**이다. 내부적으로 프로토타입 체인을 사용한다.

```js
class Animal {
  constructor(name) {
    this.name = name
  }
  speak() {
    return `${this.name} makes a sound`
  }
}

class Dog extends Animal {
  speak() {
    return `${this.name} barks`
  }
}

// 위 코드는 본질적으로 아래와 동일
Dog.prototype.__proto__ === Animal.prototype // true
```

### 프로토타입 메서드 vs 인스턴스 메서드
```js
class Counter {
  count = 0 // 인스턴스 속성 (각 인스턴스가 개별 소유)

  // 프로토타입 메서드 (공유됨, 메모리 효율적)
  increment() {
    this.count++
  }

  // 인스턴스 메서드 (화살표 함수 — this 바인딩 고정)
  handleClick = () => {
    this.increment()
  }
}
```

### 유용한 프로토타입 관련 메서드
```js
Object.create(proto)         // proto를 [[Prototype]]으로 하는 객체 생성
Object.getPrototypeOf(obj)   // obj의 [[Prototype]] 반환
Object.setPrototypeOf(obj, proto) // [[Prototype]] 설정 (성능 주의)
obj.hasOwnProperty('key')    // 자신의 속성인지 확인 (체인 제외)
'key' in obj                 // 체인 포함 속성 존재 확인
instanceof                   // 프로토타입 체인에 constructor.prototype 있는지 확인
```

### TypeScript에서의 프로토타입
TypeScript의 interface와 class는 결국 JavaScript 프로토타입으로 컴파일되지만, 타입 시스템이 구조적 타이핑으로 작동하므로 프로토타입 체인을 직접 다룰 일은 줄어든다.

## 관련 페이지

- [클로저](../concepts/closure.md) — JavaScript의 또 다른 핵심 메커니즘
- [TypeScript](../tech/typescript.md) — 프로토타입 기반 JavaScript에 타입 시스템 추가
- [기초 CS](../tech/cs-fundamentals.md) — 객체지향 개념과의 연결

## 출처

- prototype — 2026-04-10
