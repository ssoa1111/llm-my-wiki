# Vue 3 완전 정리

> Composition API 기반의 Vue 3 핵심 개념과 실무 패턴 — ref/reactive, Composable, Pinia, Vue Router, VeeValidate+Zod 폼 관리까지.

## 핵심 내용

### Composition API vs Options API

| | Options API | Composition API |
|---|---|---|
| 스타일 | 객체 기반 | 함수 기반 |
| 로직 재사용 | Mixin | Composable |
| TypeScript | 제한적 | 완벽 지원 |
| 권장 여부 | 레거시 지원 | ✅ 권장 |

```vue
<script setup>
// Composition API — 권장 방식
import { ref, computed, onMounted } from 'vue'

const count = ref(0)
const double = computed(() => count.value * 2)
onMounted(() => console.log('마운트됨'))
</script>
```

### 반응형 데이터

```js
import { ref, reactive } from 'vue'

const count = ref(0)          // 원시값 — .value로 접근
count.value++

const state = reactive({ name: '홍길동', age: 25 })  // 객체/배열 — 직접 접근
state.age++
```

### Composable — 로직 재사용

React의 커스텀 훅에 해당하는 패턴.

```js
// composables/useCounter.js
import { ref } from 'vue'

export function useCounter() {
  const count = ref(0)
  const increment = () => count.value++
  return { count, increment }
}
```

### Watch & WatchEffect

```js
// watch: 명시적 감시, 이전/이후 값 비교 가능
watch(count, (newVal, oldVal) => {
  console.log(`${oldVal} → ${newVal}`)
}, { immediate: true })

// watchEffect: 내부 반응형 값 자동 추적
watchEffect(() => {
  console.log('count가 바뀜:', count.value)
})
```

| | `watch` | `watchEffect` |
|---|---|---|
| 감시 대상 | 명시적 지정 | 자동 추적 |
| 이전 값 접근 | ✅ | ❌ |
| 즉시 실행 | 옵션 필요 | 기본값 |

### Provide / Inject — Props Drilling 없이 깊은 전달

```js
// 조상 컴포넌트
provide('theme', ref('dark'))

// 후손 컴포넌트 (몇 단계 아래든 OK)
const theme = inject('theme', 'light') // 'light'는 기본값
```

### Pinia — 공식 상태 관리 (Vuex 대체)

```js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  const double = computed(() => count.value * 2)
  function increment() { count.value++ }
  return { count, double, increment }
})
```

### Vue Router

```js
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/',         component: HomeView },
    { path: '/user/:id', component: UserView }, // 동적 라우트
  ]
})
```

```js
// 컴포넌트에서
const router = useRouter()
const route = useRoute()

console.log(route.params.id)  // 파라미터 접근
router.push('/about')         // 페이지 이동
```

### 폼 관리 — VeeValidate + Zod

```js
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { loginSchema } from '@/schemas/authSchema'

const { handleSubmit, isSubmitting } = useForm({
  validationSchema: toTypedSchema(loginSchema),
})
```

**방법 선택 가이드**:
| 방법 | 언제 |
|---|---|
| `<Field>` 컴포넌트 | 기본 HTML 인풋 빠르게 |
| `useField` | 커스텀 컴포넌트 |
| `values` 직접 접근 | 스크립트에서 값 읽기 |
| `defineField` | 검사 타이밍 세밀하게 |

### 성능 최적화

```vue
<script setup>
import { defineAsyncComponent, shallowRef } from 'vue'

// 지연 로딩
const HeavyComponent = defineAsyncComponent(() => import('./HeavyComponent.vue'))

// shallowRef: 중첩 객체 반응형 추적 안 함
const state = shallowRef({ data: [] })
</script>

<template>
  <KeepAlive>  <!-- 컴포넌트 캐싱 -->
    <HeavyComponent v-if="show" />
  </KeepAlive>
</template>
```

### 전역 에러 처리

```js
// Vue 컴포넌트 에러
app.config.errorHandler = (err, instance, info) => {
  console.error('[Global Error]', err, info)
}

// Promise 미처리 에러
window.addEventListener('unhandledrejection', (event) => {
  console.error('[Unhandled Promise]', event.reason)
})
```

### 추천 라이브러리 스택

| 목적 | 추천 |
|---|---|
| 폼 유효성 검사 | VeeValidate + Zod |
| 서버 데이터 패치/캐싱 | TanStack Vue Query |
| 클라이언트 상태 | Pinia |
| HTTP 클라이언트 | Axios |
| 풀스택 프레임워크 | Nuxt 3 |

## 관련 페이지

- [프론트엔드 상태 관리](./state-management.md) — React 상태 관리와 비교
- [Zustand 완전 정리](./zustand.md) — React 생태계 유사 상태 관리 (Pinia와 비교)
- [Zod — 스키마 유효성 검증](../backend/zod-validation.md) — VeeValidate와 조합하는 Zod 사용법
- [TanStack Query 설정 & 고급 패턴](./tanstack-query-config.md) — Vue Query와 동일 라이브러리

## 출처

- Vue 3 완전 정리 가이드 — 2026-04-15
