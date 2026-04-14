# n8n + Supabase 벡터 연동

> n8n에서 Supabase pgvector를 연결해 문서 임베딩을 저장하고 유사도 검색을 하는 방법 — 테이블 설계 결정 포함.

## 핵심 내용

### 1. Supabase 테이블 및 함수 설정

```sql
-- pgvector 확장 활성화
CREATE EXTENSION vector;

-- 문서 저장 테이블
CREATE TABLE documents (
  id bigserial PRIMARY KEY,
  content TEXT,        -- Document.pageContent
  metadata JSONB,      -- Document.metadata
  embedding vector(1536)  -- OpenAI text-embedding-3-small 기준
);

-- 유사도 검색 함수
CREATE FUNCTION match_documents (
  query_embedding vector(1536),
  match_count INT DEFAULT NULL,
  filter JSONB DEFAULT '{}'
) RETURNS TABLE (
  id BIGINT,
  content TEXT,
  metadata JSONB,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
#variable_conflict use_column
BEGIN
  RETURN QUERY
  SELECT
    id,
    content,
    metadata,
    1 - (documents.embedding <=> query_embedding) AS similarity
  FROM documents
  WHERE metadata @> filter
  ORDER BY documents.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

> `<=>`: 코사인 거리 (작을수록 유사)  
> `1 - (<=>)`: 코사인 유사도 (클수록 유사, 0.75+ = 유사)

---

### 2. n8n에서 Supabase 연결

1. **n8n Supabase 노드** → 새 계정 추가
2. **Supabase에서 정보 확인**:
   - URL: `Settings > Data API > URL`
   - API Key: `Settings > API Keys > service_role (secret)`
3. n8n Credential에 URL + Key 저장

---

### 3. 벡터 컬럼 설계 — 어느 방식이 효율적?

여러 테이블(예: 게시글, 댓글, 상품)에 벡터 검색이 필요할 때:

**방식 A: 각 테이블에 vector 컬럼 추가**
```sql
ALTER TABLE posts ADD COLUMN embedding vector(1536);
ALTER TABLE comments ADD COLUMN embedding vector(1536);
ALTER TABLE products ADD COLUMN embedding vector(1536);
```

**방식 B: 벡터 전용 테이블 하나 생성**
```sql
CREATE TABLE embeddings (
  id BIGSERIAL PRIMARY KEY,
  source_type TEXT,  -- 'post' | 'comment' | 'product'
  source_id BIGINT,
  content TEXT,
  embedding vector(1536)
);
```

**권장: 방식 A (각 테이블에 vector 컬럼)**
- 조인 불필요 → 쿼리 단순
- 테이블별 RLS 그대로 적용
- pgvector 인덱스 효율적

---

### 4. 실시간 벡터 업데이트 방법

Supabase 데이터 변경 시 자동으로 임베딩 업데이트:

1. Supabase Extensions에서 `http`, `pg_net` 활성화
2. `pg_net`으로 데이터 변경 시 n8n Webhook 트리거
3. n8n에서 임베딩 생성 → Supabase에 저장

---

### 5. n8n RPC 호출 시 주의사항

n8n HTTP 노드로 Supabase RPC 호출 시 흔한 오류:

**오류 1: `invalid json`**
```json
// ❌ 잘못된 예 — 키에 쌍따옴표 누락, embedding 이중 배열
{ query_embedding: [[$json.data]] }

// ✅ 올바른 예
{
  "query_embedding": {{ $json.data[0].embedding }},
  "match_count": 3
}
```

**오류 2: 함수 못 찾음 (schema cache)**
- PostgREST는 파라미터 이름으로 매칭 → JSON 키와 함수 파라미터명 동일하게
- 스키마 리로드: `NOTIFY pgrst, 'reload schema';`
- 권한 부여: `GRANT EXECUTE ON FUNCTION match_documents TO anon;`

---

### 6. 벡터 검색 시 metadata 필터링

특정 조건(카테고리, 난이도 등)으로 검색 결과를 좁혀야 할 때:

```sql
-- metadata_filter 파라미터를 포함한 검색 함수
CREATE FUNCTION match_work_category_embedding(
  query_embedding vector(3072),
  match_count int,
  match_threshold float,
  metadata_filter jsonb    -- ← 반드시 추가
)
RETURNS TABLE (id bigint, content text, similarity float)
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT id, content,
    1 - (embedding <=> query_embedding) AS similarity
  FROM documents
  WHERE 
    -- 유사도 조건
    1 - (embedding <=> query_embedding) > match_threshold
    -- metadata 필터 조건
    AND (metadata->>'difficulty_level')::int = (metadata_filter->>'difficulty_level')::int
    AND metadata->>'category' = metadata_filter->>'category'
  ORDER BY embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

**작동 순서**:
```
1. 임베딩 유사도로 후보 찾기 (예: 100개)
   ↓
2. metadata 조건으로 필터링
   difficulty_level = 2 인 것만
   category = "홈페이지" 인 것만
   ↓
3. 최종 결과 (예: 5개)
```

> **함수에 `metadata_filter` 파라미터가 없으면 필터링 작동 안 함!**  
> 확인: `SELECT pg_get_function_arguments(oid) FROM pg_proc WHERE proname = 'match_work_category_embedding';`

### 7. 유사도 낮게 나올 때 개선 방법

| 원인 | 해결 |
|------|------|
| 임베딩 텍스트에 ID/숫자 노이즈 | `search_text` 전용 컬럼에 정제 텍스트만 임베딩 |
| 저장/질문 모델 다름 | 동일 임베딩 모델 사용 |
| 벡터 검색만 사용 (집계 질문) | metadata filter + 벡터 하이브리드 |
| threshold/topK 설정 | topK 확대 후 유사도 가중 평균 |

**카테고리 추출 파이프라인** (질문에서 카테고리 파악):
1. 사전 매핑(동의어 딕셔너리) — 빠름, 비용 0
2. 카테고리 라벨 임베딩 vs 질의 임베딩 코사인 유사도 매칭
3. (옵션) LLM 폐쇄형 분류 → JSON으로 하나만 선택

## 관련 페이지

- [벡터 데이터베이스](../ai/vector-database.md) — pgvector 개요, 유사도 측정 방법
- [임베딩 검색 정확성 향상](../ai/embedding-search-accuracy.md) — 검색 품질 개선
- [Supabase — Next.js 연동](../backend/supabase-nextjs.md) — Supabase 기본 설정
- [n8n AI Agent 노드 설정](./n8n-ai-agent.md) — AI Agent에서 활용

## 출처

- n8n와 supabase 연결 — 2026-04-14
- vector와 column간의 상관관계 — 2026-04-14
- 벡터 검색 시 필터 — 2026-04-14
- n8n 이슈 정리 — 2026-04-14
