# HTTP 상태 코드

> HTTP 응답 상태 코드의 분류와 각 코드의 의미. API 개발과 디버깅에 필수적인 레퍼런스.

## 핵심 내용

### 자주 쓰는 코드 (빠른 참고)

| 코드 | 의미 | 언제 사용 |
|------|------|---------|
| 200 | OK | 요청 성공 |
| 201 | Created | 리소스 생성 성공 (POST) |
| 204 | No Content | 성공, 반환 데이터 없음 (DELETE) |
| 301 | Moved Permanently | 영구 리다이렉트 |
| 302 | Found | 임시 리다이렉트 |
| 304 | Not Modified | 캐시 유효 (ETag 활용) |
| 400 | Bad Request | 잘못된 요청 파라미터 |
| 401 | Unauthorized | 인증 필요 (로그인 안 됨) |
| 403 | Forbidden | 인가 실패 (권한 없음) |
| 404 | Not Found | 리소스 없음 |
| 409 | Conflict | 현재 상태와 충돌 (중복 데이터 등) |
| 422 | Unprocessable Entity | 문법 OK, 처리 불가 (유효성 검증 실패) |
| 429 | Too Many Requests | 레이트 리밋 초과 |
| 500 | Internal Server Error | 서버 내부 오류 |
| 503 | Service Unavailable | 서버 과부하 / 점검 중 |

### 전체 분류

**1xx — 정보 응답**
- `101 Switching Protocols`: WebSocket 업그레이드 시

**2xx — 성공**
- `200 OK`, `201 Created`, `202 Accepted` (비동기 처리 수락), `204 No Content`
- `206 Partial Content`: 파일 분할 다운로드

**3xx — 리다이렉션**
- `301` vs `308`: 영구 리다이렉트 (308은 메서드 변경 불가)
- `302` vs `307`: 임시 리다이렉트 (307은 메서드 변경 불가)
- `304 Not Modified`: 캐시 재사용 가능

**4xx — 클라이언트 오류**
- `401 Unauthorized` vs `403 Forbidden`:
  - 401: 로그인이 필요함 (누구인지 모름)
  - 403: 로그인됐지만 권한 없음 (누군지 알지만 접근 거부)
- `405 Method Not Allowed`: GET-only에 POST 요청 등
- `410 Gone`: 리소스가 영구 삭제됨 (404와 달리 되돌아오지 않음)
- `422 Unprocessable Entity`: 폼 유효성 검증 실패에 적합

**5xx — 서버 오류**
- `502 Bad Gateway`: 게이트웨이/프록시가 upstream에서 잘못된 응답 받음
- `503 Service Unavailable`: 일시적 과부하, 유지보수 중
- `504 Gateway Timeout`: upstream 응답 시간 초과

## 관련 페이지

- [REST API 규약](../rest-api.md) — 각 HTTP 메서드와 상태코드 조합 규칙
- [중앙 집중식 에러 처리](./centralized-error-handling.md) — 상태코드별 에러 핸들링 패턴
- [JWT 인증 — Next.js 구현](./jwt-auth-nextjs.md) — 401/403 처리 패턴

## 출처

- 네트워크 상태코드 — 2026-04-14
