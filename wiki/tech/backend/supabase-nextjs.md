# Supabase — Next.js 연동 가이드

> Next.js에서 Supabase를 설정하고 TypeScript 타입을 자동 생성하며 CRUD 작업을 수행하는 방법.

## 핵심 내용

### 초기 설정 — TypeScript 타입 자동 생성

```json
// package.json
{
  "scripts": {
    "generate-types": "npx supabase gen types typescript --project-id [project_id] --schema public > types_db.ts"
  }
}
```

```bash
# 1. Supabase CLI 로그인
npx supabase login

# 2. DB 스키마 기반 타입 생성
npm run generate-types
# → types_db.ts 자동 생성
```

---

### 기본 CRUD

```typescript
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types_db'

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// READ
const { data, error } = await supabase.from('note').select('*')

// CREATE
const { data, error } = await supabase
  .from('note')
  .insert({ title: '제목', content: '내용' })

// UPDATE
const { data, error } = await supabase
  .from('note')
  .update({ title: '새 제목' })
  .eq('id', noteId)

// DELETE
const { error } = await supabase
  .from('note')
  .delete()
  .eq('id', noteId)
```

---

### SQL 직접 실행

```sql
-- 테이블 정책 확인
SELECT * FROM pg_policies WHERE tablename = 'profiles';

-- 데이터 전체 삭제
DELETE FROM 테이블명;           -- 롤백 가능, 로그 기록
TRUNCATE TABLE 테이블명;        -- 더 빠름, 롤백 불가
```

---

### Row Level Security (RLS)

Supabase는 PostgreSQL RLS를 사용해 행 단위 접근 제어 구현. Anon Key 사용 시 RLS 정책이 적용됨.

```sql
-- 자신의 데이터만 조회 가능
CREATE POLICY "Users can view own data" ON profiles
  FOR SELECT USING (auth.uid() = user_id);
```

---

### Server Component에서 사용 (App Router)

```typescript
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export default async function Page() {
  const supabase = createServerComponentClient({ cookies })
  const { data } = await supabase.from('posts').select('*')
  return <div>{/* 렌더링 */}</div>
}
```

## 관련 페이지

- [벡터 데이터베이스](../ai/vector-database.md) — Supabase Vector Store로 벡터 검색 가능
- [JWT 인증 — Next.js 구현](./jwt-auth-nextjs.md) — Supabase Auth와 JWT 통합
- [SQL CRUD](./sql-crud.md) — 고급 SQL 쿼리 패턴

## 출처

- supabase setting — 2026-04-14
- supabase query — 2026-04-14
