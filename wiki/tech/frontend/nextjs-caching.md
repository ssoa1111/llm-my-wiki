# Next.js 캐싱 전략

> Next.js App Router의 4가지 캐싱 레이어 — Request Memoization, Data Cache, Full Route Cache, Router Cache.

## 핵심 내용

### 4가지 캐싱 레이어 개요

```
1. Request Memoization   — 같은 렌더링 중 동일 fetch 중복 제거
2. Data Cache            — fetch 결과를 서버에 영구/시간 기반 저장
3. Full Route Cache      — 빌드된 페이지(HTML+RSC) CDN에 저장
4. Router Cache          — 방문한 페이지를 클라이언트에 저장
```

---

### 1. Request Memoization (자동)

같은 렌더링 사이클에서 동일한 URL을 여러 번 fetch해도 실제 요청은 1번만 발생.

```typescript
// 3번 호출했지만 실제 네트워크 요청은 1번
const user1 = await getUser()  // 실제 요청
const user2 = await getUser()  // 캐시 사용
const user3 = await getUser()  // 캐시 사용
```

---

### 2. Data Cache (fetch 캐싱)

```typescript
// 영구 캐싱 (기본값 — SSG처럼 동작)
const res = await fetch('https://api.example.com/posts')

// 캐싱 비활성화 (SSR처럼 동작)
const res = await fetch('...', { cache: 'no-store' })

// 시간 기반 재검증 (ISR처럼 동작)
const res = await fetch('...', { next: { revalidate: 60 } })

// 태그 기반 재검증 (On-demand ISR)
const res = await fetch('...', { next: { tags: ['posts'] } })
```

**태그 기반 재검증** (권장):
```typescript
// Server Action에서 캐시 무효화
'use server'
import { revalidateTag } from 'next/cache'

export async function createPost() {
  await savePost()
  revalidateTag('posts')  // 'posts' 태그 캐시 전부 무효화
}
```

---

### 3. Full Route Cache (페이지 캐싱)

```typescript
// 페이지 캐싱 전략 설정
export const dynamic = 'force-static'   // 항상 정적 (빌드 시 생성)
export const dynamic = 'force-dynamic'  // 항상 동적 (캐싱 없음)
export const revalidate = 60            // 60초마다 재생성 (ISR)
```

**자동 동적 렌더링 조건** (force-dynamic 불필요):
- `cookies()` 또는 `headers()` 사용
- `searchParams` props 사용
- `fetch(url, { cache: 'no-store' })` 사용

---

### 4. Router Cache (클라이언트)

방문한 페이지를 클라이언트에 자동 저장. `<Link>` 컴포넌트 호버 시 프리패치도 저장.

- 정적 라우트: 5분 유지
- 동적 라우트: 30초 유지

```typescript
// 수동 갱신
const router = useRouter()
router.refresh()  // 현재 페이지 캐시 무효화
```

---

### 실전 전략 선택 가이드

| 데이터 유형 | fetch 설정 | 비고 |
|------------|-----------|------|
| 정적 (잘 안 바뀜) | `next: { revalidate: 3600 }` | 카테고리, 설정 |
| 주기적 업데이트 | `next: { tags: ['x'] }` + `revalidateTag` | 게시글 목록 |
| 실시간 (항상 최신) | `cache: 'no-store'` | 실시간 데이터 |
| 사용자별 데이터 | `cache: 'no-store'` | 인증 필요 데이터 |

## 관련 페이지

- [SSR/SSG/ISR/CSR](../../concepts/ssr-ssg-isr-csr.md) — 렌더링 전략과 캐싱의 관계
- [성능 측정 및 개선](./performance-measurement.md) — 캐싱이 TTFB/LCP에 미치는 영향
- [성능 개선 체크리스트](./performance-checklist.md) — 데이터 패칭 캐싱 체크리스트

## 출처

- 캐싱 종류 — 2026-04-14
