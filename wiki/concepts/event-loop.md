# 이벤트 루프와 비동기

> JavaScript의 단일 스레드 런타임에서 비동기 작업을 처리하는 메커니즘.

## 핵심 내용

### JavaScript 런타임 구성 요소
```
┌─────────────────────────────────────────┐
│           JavaScript Engine             │
│  ┌──────────────┐  ┌─────────────────┐  │
│  │  Call Stack  │  │   Memory Heap   │  │
│  └──────────────┘  └─────────────────┘  │
└─────────────────────────────────────────┘
         ↕
┌─────────────────────────────────────────┐
│             Web APIs / Node APIs        │
│  (setTimeout, fetch, DOM events, ...)   │
└─────────────────────────────────────────┘
         ↕
┌──────────────┐    ┌──────────────────┐
│  Task Queue  │    │ Microtask Queue  │
│ (Macrotasks) │    │ (Promise, queueMicrotask) │
└──────────────┘    └──────────────────┘
         ↕
┌─────────────────────────────────────────┐
│              Event Loop                 │
└─────────────────────────────────────────┘
```

### 이벤트 루프 동작 순서
1. **Call Stack** 실행 (현재 동기 코드)
2. Call Stack이 비면:
3. **Microtask Queue 전부** 처리 (Promise.then, queueMicrotask, MutationObserver)
4. **Macrotask Queue에서 하나** 가져와 실행
5. 다시 Microtask Queue 비우기
6. 반복

### Macrotask vs Microtask
| | Macrotask | Microtask |
|--|-----------|-----------|
| 예시 | `setTimeout`, `setInterval`, `setImmediate`, I/O, UI 렌더링 | `Promise.then`, `async/await`, `queueMicrotask`, `MutationObserver` |
| 처리 | 큐에서 **하나씩** 가져옴 | Call Stack 빌 때마다 **전부** 처리 |
| 우선순위 | 낮음 | 높음 |

### Promise와 async/await
```js
console.log('1') // 동기

setTimeout(() => console.log('2'), 0) // Macrotask

Promise.resolve().then(() => console.log('3')) // Microtask

console.log('4') // 동기

// 출력 순서: 1 → 4 → 3 → 2
```

```js
async function fetchData() {
  const data = await fetch('/api/data') // await 이후는 Microtask
  console.log(data)
}
```
- `await`는 `Promise.then`의 문법적 설탕
- `await` 이후 코드는 microtask로 스케줄링

### 비동기 패턴
#### Promise 체이닝
```js
fetch('/api/user')
  .then(r => r.json())
  .then(user => fetch(`/api/posts/${user.id}`))
  .then(r => r.json())
  .catch(err => console.error(err))
```

#### async/await (권장)
```js
async function loadUserPosts(userId: string) {
  try {
    const user = await fetchUser(userId)
    const posts = await fetchPosts(user.id)
    return posts
  } catch (error) {
    handleError(error)
  }
}
```

#### 병렬 처리
```js
// 순차 (느림)
const user = await fetchUser(id)
const posts = await fetchPosts(id)

// 병렬 (빠름)
const [user, posts] = await Promise.all([fetchUser(id), fetchPosts(id)])
```

### setTimeout(fn, 0)의 의미
- 0ms라도 즉시 실행이 아님 → Macrotask Queue에 등록 후 현재 실행 완료 후 처리
- 최소 지연: HTML 스펙상 중첩 5회 이후 최소 4ms

### Node.js의 추가 큐
- `process.nextTick`: Microtask보다도 우선 처리 (같은 단계 완료 후)
- `setImmediate`: I/O 콜백 직후 실행
- 순서: `process.nextTick` > `Promise.then` > `setImmediate` > `setTimeout`

### 흔한 실수
```js
// ❌ 콜백 지옥
getData(function(a) {
  getMore(a, function(b) {
    getEvenMore(b, function(c) { ... })
  })
})

// ✅ async/await
const a = await getData()
const b = await getMore(a)
const c = await getEvenMore(b)
```

## 관련 페이지

- [useEffect](../tech/frontend/use-effect.md) — React에서 비동기 Effect 처리
- [클로저](../concepts/closure.md) — 비동기 콜백에서 자주 등장하는 개념
- [Node Runtime & Edge Runtime](../tech/frontend/node-edge-runtime.md) — 런타임 환경 차이

## 출처

- 이벤트 루프와 비동기 — 2026-04-10
