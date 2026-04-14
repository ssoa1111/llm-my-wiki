# React Query 로딩 전략

> Next.js App Router에서 useQuery / useSuspenseQuery+Suspense / 서버 프리패칭+HydrationBoundary 세 가지 전략 비교와 페이지 유형별 선택 가이드.

## 핵심 내용

### 3가지 전략 비교

| 전략 | 장점 | 단점 | 적합 케이스 |
|------|------|------|------------|
| `useQuery` + 컴포넌트 로딩 | 간단, 세밀한 제어 | 보일러플레이트, 일관성 부족 | 모달, 실시간 데이터, 소형 UI |
| `useSuspenseQuery` + Suspense | 로딩 로직 분리, TypeScript 안전 | Suspense boundary 설계 필요 | 대시보드, 인증 페이지 |
| 서버 프리패칭 + HydrationBoundary + Suspense | SEO, 초기 로딩 0, API 절약 | 서버 부하, 설정 복잡 | 공개 페이지, SEO 중요 페이지 |

---

### 각 전략 코드

**1. useQuery (기본)**
```typescript
const { data, isLoading, isError } = useQuery({...});
if (isLoading) return <LoadingSpinner />;
if (isError) return <ErrorMessage />;
return <Content data={data} />;
```

**2. useSuspenseQuery + Suspense**
```typescript
// 컴포넌트 (data 항상 존재, undefined 없음)
const { data } = useSuspenseQuery({...});
return <Content data={data} />;

// 상위
<Suspense fallback={<Loading />}>
  <Component />
</Suspense>
```

**3. 서버 프리패칭 + HydrationBoundary (권장 조합)**
```typescript
// 서버 컴포넌트 (page.tsx)
await queryClient.prefetchQuery({...});

<HydrationBoundary state={dehydrate(queryClient)}>
  <Suspense fallback={<SkeletonUI />}>
    <ClientComponent />  {/* useSuspenseQuery 사용 */}
  </Suspense>
</HydrationBoundary>
```

---

### HydrationBoundary vs Suspense 역할

- **HydrationBoundary**: 서버에서 가져온 데이터를 클라이언트 캐시에 심어서 **중복 API 호출 방지**
- **Suspense**: 데이터 없을 때 **fallback 로딩 UI 표시**

Next.js 스트리밍과 결합: 서버가 데이터를 준비하는 동안 헤더/푸터와 Suspense fallback을 먼저 전송 → 데이터 완성 시 UI 교체. 체감 속도 향상.

---

### 페이지 유형별 추천 전략

| 페이지 유형 | 추천 전략 | 이유 |
|------------|---------|------|
| FAQ, 공지사항 목록 | 서버 프리패칭 + Suspense | SEO, 정적 데이터 |
| 공지사항 상세 | 서버 프리패칭 + Suspense | SEO, 공유 링크 |
| 대시보드 | useSuspenseQuery + Suspense | 여러 위젯, 인증 필요 |
| 프로필 수정 폼 | useQuery | 개인 데이터, 폼 표시 우선 |
| 채팅, 실시간 | useQuery | 자주 갱신, 프리패칭 효과 없음 |
| 모달/드롭다운 | useQuery | 소형 UI, 독립 로딩 |
| 무한 스크롤 | useInfiniteQuery | HTML 크기 문제 |

---

### 의사결정 흐름

```
공개 페이지 + SEO 중요?
  → 서버 프리패칭 + useSuspenseQuery + Suspense ⭐

인증 필요 + 여러 위젯?
  → useSuspenseQuery + Suspense

실시간 데이터 / 작은 UI?
  → useQuery + 컴포넌트 로딩

기본 (판단 어려울 때):
  → useSuspenseQuery + Suspense
```

## 관련 페이지

- [SSR/SSG/ISR/CSR](../../concepts/ssr-ssg-isr-csr.md) — 렌더링 전략과 데이터 패칭 관계
- [Next.js 캐싱 전략](./nextjs-caching.md) — Data Cache와 Router Cache
- [프론트엔드 상태 관리](./state-management.md) — TanStack Query, Zustand 비교

## 출처

- 07. 로딩 전략 — 2026-04-14
