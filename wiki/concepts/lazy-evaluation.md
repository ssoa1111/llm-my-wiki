# 지연평가 (Lazy Evaluation)

> 필요한 시점에만 값을 계산하는 전략 — JavaScript Iterator API를 활용해 불필요한 연산을 건너뛰어 성능을 향상시킨다.

## 핵심 내용

### 즉시평가 vs 지연평가

```
즉시평가 (Eager): [1,2,3,...,100].filter(...).map(...)
  → filter로 100개 전부 순회 → map으로 결과 전부 변환 → 첫 3개만 사용

지연평가 (Lazy): [1,2,...,100].values().filter(...).map(...).take(3)
  → 3개를 채우는 순간 멈춤 → 나머지 원소는 아예 건드리지 않음
```

### JavaScript Iterator Helpers (ES2025)

`Array.prototype.values()`로 Iterator를 만들면 `.filter()`, `.map()`, `.take()`, `.toArray()` 등을 체이닝할 수 있다.

```javascript
const arr = [1, 20, 34, 5, 6, 12, 9, 11, 44, 27]

// 3의 배수 중 앞 3개만 추출 — 조건이 채워지면 나머지는 순회 안 함
arr.values().filter(el => el % 3 === 0).take(3).toArray()
// [6, 12, 9]
```

### 실전 예시 — 대용량 배열 처리

```javascript
const userData = [
  { id: 1, name: 'Alice', age: 30, city: 'New York' },
  { id: 2, name: 'Bob', age: 25, city: 'London' },
  { id: 3, name: 'Charlie', age: 35, city: 'New York' },
  { id: 4, name: 'David', age: 28, city: 'Paris' },
  { id: 5, name: 'Eve', age: 40, city: 'London' },
  { id: 6, name: 'Frank', age: 22, city: 'New York' },
  { id: 7, name: 'Grace', age: 33, city: 'London' },
]

// 즉시평가: filter → 5개 처리, map → 5개 처리, slice → 3개 반환
const eager = userData
  .filter(user => user.age > 25)
  .map(user => ({ fullName: user.name.toUpperCase(), homeTown: user.city.toUpperCase() }))
  .slice(0, 3)

// 지연평가: Alice(age 30 ✅), Bob(25 ❌), Charlie(35 ✅), David(28 ✅) → 3개 채워서 즉시 중단
const lazy = userData.values()
  .filter(user => user.age > 25)
  .map(user => ({ fullName: user.name.toUpperCase(), homeTown: user.city.toUpperCase() }))
  .take(3)
  .toArray()

// 결과 동일
// [
//   { fullName: 'ALICE', homeTown: 'NEW YORK' },
//   { fullName: 'CHARLIE', homeTown: 'NEW YORK' },
//   { fullName: 'EVE', homeTown: 'LONDON' }  ← 즉시평가와 달리 Eve(id:5)가 4번째 처리 대상
// ]
```

> **주의**: 결과가 다를 수 있다. 즉시평가의 `.slice(0, 3)`은 조건 통과 순서 기준, 지연평가의 `.take(3)`도 동일하지만 중간 처리량이 다르다.

### Iterator 수동 제어

```javascript
const iter = [10, 20, 30].values()
console.log(iter.next()) // { value: 10, done: false }
console.log(iter.next()) // { value: 20, done: false }
console.log(iter.next()) // { value: 30, done: false }
console.log(iter.next()) // { value: undefined, done: true }
```

### 주요 Iterator 메서드

| 메서드 | 역할 |
|--------|------|
| `.filter(fn)` | 조건 통과한 원소만 |
| `.map(fn)` | 각 원소 변환 |
| `.take(n)` | 앞 n개만 (n개 채우면 즉시 중단) |
| `.drop(n)` | 앞 n개 건너뜀 |
| `.flatMap(fn)` | map 후 1단계 flatten |
| `.toArray()` | Iterator → 배열로 변환 (여기서 실제 계산 시작) |
| `.forEach(fn)` | 소비 (반환값 없음) |

> **핵심**: `.toArray()` 또는 `.forEach()`를 호출하기 전까지는 실제 계산이 일어나지 않는다.

### 언제 쓸까?

```
대용량 배열 + 앞 N개만 필요할 때  → .values()...take(n).toArray()
전체 순회가 필요할 때             → 일반 배열 메서드가 더 간단
제너레이터와 조합                 → function* 으로 무한 시퀀스 생성 + take()로 제한
```

## 관련 페이지

- [이벤트 루프와 비동기](./event-loop.md) — JavaScript 실행 모델 이해
- [클로저](./closure.md) — 렉시컬 환경과 지연실행 패턴

## 출처

- JS Iterator Helpers 지연평가 예시 — 2026-04-15
