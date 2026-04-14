# SQL 테이블 설계

> PostgreSQL 기준 CREATE TABLE 문법, 제약조건(NOT NULL/UNIQUE/FK/CHECK), RLS, 인덱스까지 실무 테이블 설계 가이드.

## 핵심 내용

### 데이터 타입

| 타입 | 설명 |
|------|------|
| `TEXT` | 문자열 (길이 제한 없음) |
| `INTEGER` | 정수 |
| `BOOLEAN` | true/false |
| `TIMESTAMPTZ` | 타임존 포함 날짜/시간 |
| `UUID` | 고유 식별자 (128bit) |
| `JSONB` | JSON 데이터 (인덱싱 지원) |
| `VECTOR(n)` | pgvector 임베딩 벡터 |

---

### 제약조건 (Constraints)

```sql
CREATE TABLE profiles (
    id         UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
    username   TEXT         NOT NULL UNIQUE,
    email      TEXT         NOT NULL UNIQUE,
    level      INTEGER      DEFAULT 1,
    status     TEXT         CHECK (status IN ('active', 'inactive')) DEFAULT 'active',
    created_at TIMESTAMPTZ  DEFAULT NOW()
);
```

- **PRIMARY KEY**: 행을 고유 식별. NOT NULL + UNIQUE 자동 적용. 테이블당 하나.
- **NOT NULL**: 값 필수. 나중에 추가하기 어려우므로 설계 시 신중히 결정.
- **UNIQUE**: 중복 불가. 이메일, 사용자명 등에 사용.
- **DEFAULT**: 입력 안 하면 기본값. `gen_random_uuid()`로 UUID 자동 생성.
- **CHECK**: 허용 값 범위 지정.

---

### 외래키 (Foreign Key)

```sql
-- 1. 부모 테이블 먼저 생성
CREATE TABLE categories (
    id   UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL
);

-- 2. 자식 테이블 (참조)
CREATE TABLE posts (
    id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title       TEXT NOT NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    author_id   UUID REFERENCES users(id)      ON DELETE CASCADE,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

**ON DELETE 옵션**:
- `CASCADE`: 부모 삭제 시 자식도 삭제
- `SET NULL`: 부모 삭제 시 자식의 FK를 NULL로
- `RESTRICT` (기본값): 자식이 있으면 부모 삭제 방지

---

### 복합 UNIQUE 제약

```sql
-- 한 사용자가 같은 글에 중복 좋아요 불가
CREATE TABLE post_likes (
    id      UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(post_id, user_id)
);
```

---

### 인덱스 (성능)

```sql
-- 자주 검색하는 컬럼에 인덱스 추가
CREATE INDEX idx_posts_user_id    ON posts(user_id);
CREATE INDEX idx_posts_created_at ON posts(created_at);
```

---

### Row Level Security (RLS)

Supabase/PostgreSQL에서 행 단위 접근 제어:

```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 모든 사람이 조회 가능
CREATE POLICY "Public profiles" ON profiles
    FOR SELECT USING (true);

-- 본인 것만 수정 가능
CREATE POLICY "Users update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);
```

---

### 실전 예제: 블로그 시스템

```sql
CREATE TABLE users (
    id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email      TEXT NOT NULL UNIQUE,
    username   TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE posts (
    id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title       TEXT NOT NULL,
    content     TEXT NOT NULL,
    author_id   UUID REFERENCES users(id) ON DELETE CASCADE,
    status      TEXT CHECK (status IN ('draft', 'published')) DEFAULT 'draft',
    views       INTEGER DEFAULT 0,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE comments (
    id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id    UUID REFERENCES posts(id) ON DELETE CASCADE,
    user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
    content    TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 설계 팁

1. **설계 순서**: 부모 테이블 → 자식 테이블 (참조 관계 순서대로 생성)
2. **PRIMARY KEY 필수**: 모든 테이블에 UUID PK 사용
3. **NOT NULL 신중하게**: 나중에 추가하면 기존 데이터에 default 필요
4. **CHECK로 데이터 품질 보장**: status, role 등 허용값 명확히
5. **인덱스**: FK 컬럼과 자주 조회되는 컬럼에 추가

## 관련 페이지

- [SQL CRUD와 고급 쿼리](./sql-crud.md) — INSERT/SELECT/UPDATE/DELETE 실무 패턴
- [Supabase — Next.js 연동](./supabase-nextjs.md) — Supabase에서 테이블 관리

## 출처

- SQL 테이블 설계 학습 가이드 — 2026-04-14
