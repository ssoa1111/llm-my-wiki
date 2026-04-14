# 중앙 집중식 에러 처리 (Centralized Error Handling)

> 애플리케이션 전체의 에러를 단일 핸들러로 모아 일관되게 처리하는 아키텍처 패턴

## 핵심 내용

**핵심 원칙**: "애플리케이션 어디서든 발생한 에러는 반드시 하나의 중앙 시스템을 거쳐 나간다"

컴포넌트마다 try-catch와 에러 표시 로직이 흩어지는 안티패턴 대신, 모든 에러를 `globalErrorHandler.handle(error)` 하나로 모은다.

### 5계층 캡처 시스템 (Defense in Depth)

```
Level 1: API Fetch Wrapper         → HTTP 에러 (가장 많은 비중)
Level 2: React Query Global Handler → 데이터 페칭 에러
Level 3: Error Boundary            → 컴포넌트 렌더링 에러
Level 4: Next.js error.tsx         → 페이지 레벨 에러
Level 5: window.onerror + unhandledrejection → 최후 방어선
```

모든 레벨의 에러가 최종적으로 중앙 핸들러로 전달된다.

### 중앙 핸들러 내부 처리 흐름

1. 에러 수신
2. 에러 타입 판별 (HTTP 상태코드, Error 객체 타입)
3. 에러 정규화 (기술적 메시지 → 사용자 친화적 메시지)
4. **중복 제거**: 에러 해시 + 타임스탬프로 3초 이내 동일 에러 중복 표시 방지
5. 라우팅 결정 (Toast / Modal / Redirect)
6. 로깅 (개발: console, 프로덕션: Sentry)
7. 사용자 피드백 실행

### 에러 분류 → 라우팅

| 에러 | 처리 방식 |
|------|----------|
| 401 Unauthorized | 로그인 페이지로 즉시 리다이렉트 |
| 403 Forbidden | 접근 거부 페이지 |
| 400 ValidationError | 폼 필드 인라인 표시 |
| 429 RateLimitError | "잠시 후 다시 시도" Toast |
| 500 InternalServerError | "서버 오류" Toast |
| 502/503 | "서비스 점검 중" Modal |
| 결제·계정 삭제 등 중요 작업 | 명확한 확인 Modal |
| 일반 API 에러 | 3초 자동 사라지는 Toast |

### 핵심 이점

- **일관성**: 같은 종류 에러는 항상 같은 방식으로 표시
- **유지보수성**: 에러 메시지 디자인 변경 시 1개 파일만 수정
- **정책 적용**: "5xx는 모두 Sentry 보고" 같은 전역 정책을 한 곳에서 관리
- **모니터링**: 에러 발생 빈도·패턴 집계 가능

### 주의사항

- **순환 참조 방지**: 핸들러 내부에서 에러 발생 시 재귀 무한루프 위험 → 내부는 try-catch로 보호, 에러 시 `console.error`만
- **타입 안정성**: TypeScript로 `AppError` 기반 타입 계층 정의
- **성능**: 에러 핸들링은 빠르게 (로깅은 비동기로, 사용자 피드백 우선)

## 관련 페이지

- [오케스트레이터 아키텍처](../ai/orchestrator-architecture.md) — 중앙 집중 패턴의 AI 에이전트 버전

## 출처

- 중앙 집중식 에러 처리 시스템.md) — 2026-04-14
