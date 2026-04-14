# RAG 문서 검색 메커니즘

> 문서 준비(청킹→임베딩→저장)와 실시간 검색(질문 임베딩→유사도 계산→Top-K 반환)의 두 단계로 구성되는 RAG 핵심 메커니즘.

## 핵심 내용

### 전체 흐름

```
사전 준비 (한 번만):
문서 → 청킹 → 임베딩 → 벡터 DB 저장

실시간 검색 (질문마다):
질문 → 임베딩 → 유사도 계산 → Top-K 문서 반환
```

---

### 1단계: 문서 준비

**청킹** — 문서를 적절한 크기로 분할.

```python
from langchain.text_splitter import RecursiveCharacterTextSplitter

splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,      # 500자씩
    chunk_overlap=50,    # 50자 겹치게 (문맥 유지)
    separators=["\n\n", "\n", " ", ""]
)
chunks = splitter.split_text(long_doc)
```

| 상황 | 권장 크기 |
|------|---------|
| 일반 문서 | 500-1000자 |
| 코드 | 100-300줄 |
| 대화 | 3-5 메시지 |

너무 작으면 문맥 손실, 너무 크면 검색 부정확.

**임베딩** — 텍스트를 숫자 벡터로 변환. 의미가 유사한 텍스트는 가까운 벡터를 가짐.

```python
from langchain_openai import OpenAIEmbeddings

embeddings_model = OpenAIEmbeddings(model="text-embedding-3-small")
# "Next.js는 React 프레임워크입니다" → [0.023, -0.145, 0.089, ...] (1536차원)
```

---

### 2단계: 실시간 검색

질문도 같은 임베딩 모델로 변환 후 **코사인 유사도**로 모든 저장 벡터와 비교:

```python
def cosine_similarity(vec1, vec2):
    dot_product = np.dot(vec1, vec2)
    return dot_product / (np.linalg.norm(vec1) * np.linalg.norm(vec2))

# 유사도 높을수록 관련 있는 문서
results = vectorstore.similarity_search("Next.js란?", k=3)
```

---

### 고급 검색 전략

**하이브리드 검색** (추천) — 벡터 검색 + 키워드(BM25) 결합. 정확도 약 15% 향상, 속도 거의 동일.

```python
from langchain.retrievers import EnsembleRetriever, BM25Retriever

vector_retriever = vectorstore.as_retriever(search_kwargs={"k": 5})
bm25_retriever = BM25Retriever.from_texts(documents)
bm25_retriever.k = 5

ensemble_retriever = EnsembleRetriever(
    retrievers=[vector_retriever, bm25_retriever],
    weights=[0.5, 0.5]
)
```

**MMR** (Maximum Marginal Relevance) — 유사도는 높지만 다양한 결과 반환. `lambda_mult`로 유사도 vs 다양성 균형 조정.

**메타데이터 필터링** — 날짜, 소스 등으로 검색 범위 좁히기.

**재순위화** — 1차 검색 10개 중 LLM(Cohere Rerank 등)으로 3개 최종 선별.

---

### 검색 전략 선택

| 전략 | 정확도 | 속도 | 비용 | 추천 상황 |
|------|--------|------|------|---------|
| 벡터만 | 70% | 0.1초 | 저렴 | 프로토타입 |
| 하이브리드 | 85% | 0.15초 | 저렴 | 대부분 경우 (권장) |
| 하이브리드+MMR+재순위 | 90% | 0.5초 | 비쌈 | 의료/법률/금융 |

---

### Supabase Vector 설정 예시

```sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE documents (
  id BIGSERIAL PRIMARY KEY,
  content TEXT,
  metadata JSONB,
  embedding VECTOR(1536)
);

-- 벡터 검색 인덱스
CREATE INDEX ON documents
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- 유사도 검색 함수
CREATE FUNCTION match_documents(
  query_embedding VECTOR(1536),
  match_count INT DEFAULT NULL,
  filter JSONB DEFAULT '{}'
) RETURNS TABLE (id BIGINT, content TEXT, metadata JSONB, similarity FLOAT)
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT id, content, metadata,
    1 - (documents.embedding <=> query_embedding) AS similarity
  FROM documents
  WHERE metadata @> filter
  ORDER BY documents.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

## 관련 페이지

- [고급 RAG 패턴](../../concepts/advanced-rag.md) — Adaptive/Corrective/Self-RAG로 검색 품질 개선
- [청킹](../../concepts/chunking.md) — 청킹 전략 상세
- [임베딩 모델](./embedding-models.md) — OpenAI, Cohere 등 임베딩 모델 비교
- [벡터 유사도 측정](./vector-similarity.md) — 코사인/유클리드/내적 비교
- [벡터 데이터베이스](./vector-database.md) — 벡터 DB 종류와 선택
- [Supabase — Next.js 연동](../backend/supabase-nextjs.md) — Supabase vector store 연동

## 출처

- RAG 문서 검색 메커니즘 상세 — 2026-04-14
