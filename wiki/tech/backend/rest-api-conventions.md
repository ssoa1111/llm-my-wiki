# REST API 규약

> Stateless, Client-Server 분리, Uniform Interface 원칙에 따른 RESTful API 설계 규약 — URL 명사화, 소문자 하이픈, 복수형, 버전 관리.

## 핵심 내용

### 핵심 원칙

- **Stateless**: 각 요청은 독립적. 서버는 클라이언트 상태를 저장하지 않음.
- **Client-Server 분리**: 클라이언트와 서버가 독립적으로 발전 가능.
- **Uniform Interface**: 일관된 인터페이스로 리소스 식별과 조작.

---

### HTTP 메서드

| 메서드 | 용도 | 멱등성 |
|--------|------|--------|
| `GET` | 리소스 조회 (읽기 전용, 안전함) | ✅ |
| `POST` | 새 리소스 생성 | ❌ |
| `PUT` | 리소스 전체 수정/대체 | ✅ |
| `PATCH` | 리소스 부분 수정 | ✅ |
| `DELETE` | 리소스 삭제 | ✅ |

---

### URL 설계 규칙

**리소스는 명사로 표현**
```
✅ /users
✅ /products
❌ /getUsers
❌ /createProduct
```

**소문자 + 단어 구분은 하이픈(-)**
```
✅ /user-profiles
❌ /userProfiles
❌ /user_profiles
```

**컬렉션은 복수형**
```
✅ /users
✅ /orders
❌ /user
```

**계층 구조로 관계 표현**
```
/users/{userId}/orders/{orderId}
/posts/{postId}/comments/{commentId}
```

---

### 추가 규약

**버전 관리** — URL에 버전 포함
```
/v1/users
/v2/users
```

**필터링, 정렬, 페이징** — 쿼리 파라미터 사용
```
/users?role=admin&sort=name&page=2&limit=20
/posts?status=published&category=tech&createdAfter=2024-01-01
```

**중첩 깊이 제한** — 3단계 이상은 별도 엔드포인트로 분리 권장
```
✅ /users/{userId}/orders
❌ /users/{userId}/orders/{orderId}/items/{itemId}/reviews
```

---

### HTTP 상태 코드 사용

| 상황 | 코드 |
|------|------|
| 성공 조회 | 200 OK |
| 리소스 생성 성공 | 201 Created |
| 삭제 성공 | 204 No Content |
| 유효성 오류 | 400 Bad Request |
| 인증 필요 | 401 Unauthorized |
| 권한 없음 | 403 Forbidden |
| 리소스 없음 | 404 Not Found |
| 서버 오류 | 500 Internal Server Error |

---

### Next.js App Router에서 구현

```typescript
// app/api/users/[userId]/route.ts
export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  const user = await db.user.findUnique({ where: { id: params.userId } });
  if (!user) return Response.json({ error: 'Not found' }, { status: 404 });
  return Response.json(user);
}

export async function PATCH(
  request: Request,
  { params }: { params: { userId: string } }
) {
  const body = await request.json();
  const updated = await db.user.update({ where: { id: params.userId }, data: body });
  return Response.json(updated);
}
```

## 관련 페이지

- [HTTP 상태 코드](./http-status-codes.md) — 전체 상태 코드 참조
- [중앙 집중식 에러 처리](./centralized-error-handling.md) — API 에러 응답 일관성
- [Zod — 스키마 유효성 검증](./zod-validation.md) — API Route에서 요청 데이터 검증

## 출처

- REST API 규약 — 2026-04-14
