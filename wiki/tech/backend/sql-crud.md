# SQL CRUD와 고급 쿼리

> SQL의 기본 CRUD 연산부터 JOIN, 집계, 서브쿼리까지 실무에 필요한 쿼리 패턴 완전 가이드.

## 핵심 내용

### INSERT — 데이터 삽입

```sql
-- 기본 삽입
INSERT INTO users (email, username, age)
VALUES ('hong@example.com', '홍길동', 25);

-- 여러 행 한 번에
INSERT INTO users (email, username, age) VALUES
  ('kim@example.com', '김철수', 30),
  ('lee@example.com', '이영희', 22);

-- DEFAULT 자동 생성 (id, created_at 등 생략 가능)
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 서브쿼리로 값 가져오기
INSERT INTO posts (user_id, title)
VALUES (
  (SELECT id FROM users WHERE username = '홍길동'),
  '게시글 제목'
);
```

### SELECT — 데이터 조회

```sql
-- 기본 조회
SELECT username, email, age FROM users
WHERE age > 25
ORDER BY age DESC
LIMIT 10 OFFSET 20;  -- 페이지네이션: 21번째부터 10개

-- 패턴 매칭
SELECT * FROM users WHERE email LIKE '%@gmail.com';

-- IN, NULL 체크
SELECT * FROM users WHERE username IN ('홍길동', '김철수');
SELECT * FROM users WHERE address IS NULL;

-- DISTINCT 중복 제거
SELECT DISTINCT city FROM users;
```

### UPDATE / DELETE

```sql
-- UPDATE
UPDATE users SET age = 26 WHERE username = '홍길동';

-- DELETE vs TRUNCATE
DELETE FROM 테이블명;       -- 롤백 가능, 트리거 발생, 느림
TRUNCATE TABLE 테이블명;    -- 롤백 불가, 더 빠름, 테이블 초기화
```

### JOIN — 테이블 연결

```sql
-- INNER JOIN (교집합)
SELECT u.username, p.title
FROM users u
INNER JOIN posts p ON u.id = p.user_id;

-- LEFT JOIN (왼쪽 테이블 기준, 없는 경우 NULL)
SELECT u.username, p.title
FROM users u
LEFT JOIN posts p ON u.id = p.user_id;
```

### 집계 함수

```sql
SELECT 
  COUNT(*) as total,
  AVG(age) as avg_age,
  MAX(age) as max_age,
  MIN(age) as min_age
FROM users;

-- GROUP BY
SELECT city, COUNT(*) as user_count
FROM users
GROUP BY city
HAVING COUNT(*) > 5;  -- 집계 결과 필터
```

### 제약 조건

- `NOT NULL`: 필수 값
- `UNIQUE`: 중복 불가
- `FOREIGN KEY`: 참조 무결성 (부모 테이블에 값 존재해야 함)
- `CHECK`: 조건 검사

## 관련 페이지

- [Supabase — Next.js 연동](./supabase-nextjs.md) — Supabase 클라이언트로 SQL 실행
- [SQL 테이블 설계](./sql-table-design.md) — 정규화, 인덱스, 관계 설계

## 출처

- SQL CRUD와 고급 쿼리 완전 가이드 — 2026-04-14
