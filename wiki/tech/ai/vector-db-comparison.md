# 벡터 DB 검색속도 비교

> 문서 100만 개 기준 벡터 DB 속도 비교 — pgvector(PostgreSQL)는 가장 느리고, Pinecone/Qdrant/Milvus는 전용 알고리즘과 메모리 기반으로 10배 이상 빠르다.

## 핵심 내용

### 속도 비교 (문서 100만 개)

```
PostgreSQL(pgvector): 100-500ms
Weaviate:              30-70ms  (~3배 빠름)
Qdrant:                20-60ms  (~5배 빠름)
Milvus:                15-50ms  (~8배 빠름)
Pinecone:              10-50ms  (~10배 빠름)
```

---

### 왜 전용 벡터 DB가 빠른가

**알고리즘 차이**
- PostgreSQL/pgvector: IVFFlat — 모든 벡터를 순차 비교 (구식)
- Pinecone, Qdrant: HNSW — 그래프로 빠르게 탐색 (최신, ~100배 빠름)

**메모리 vs 디스크**
- PostgreSQL: 디스크 읽기 (느림)
- Pinecone/Qdrant: RAM 상주 (빠름)

**언어 최적화**
- Qdrant: Rust (성능 특화)
- Pinecone: C++/Rust (성능 특화)
- PostgreSQL: C (범용)

마트(PostgreSQL)처럼 뭐든 팔면 과일 찾기가 느리고, 과일 전문점(Pinecone)처럼 특화되면 빠르다.

---

### DB별 특성

| DB | 타입 | 속도 | 비용 | 특징 |
|----|------|------|------|------|
| pgvector | PostgreSQL 확장 | 느림 | 무료 | 기존 Supabase에 통합 가능 |
| Qdrant | 오픈소스+클라우드 | 매우 빠름 | 무료 1GB | Rust 기반, 무료 티어 좋음 |
| Milvus | 오픈소스 | 빠름 | 무료 (자체 호스팅) | 대용량 특화, 설정 복잡 |
| Pinecone | 완전 관리형 | 가장 빠름 | $70/월~ | 설정 0, 관리 편함 |
| Weaviate | 오픈소스+클라우드 | 빠름 | 무료 티어 있음 | GraphQL 지원 |

---

### 실무 선택 가이드

```
문서 < 10만 개:
→ Supabase Vector(pgvector) 충분 (50-100ms)

문서 10-100만 개:
→ Qdrant 클라우드 (무료 1GB)

문서 100만 개+:
→ Pinecone (비싸지만 관리 편함)

극한 성능 필요:
→ Milvus (직접 구축)
```

대부분 개인/소규모 프로젝트는 **Supabase Vector가 충분**하다. 성능 문제가 생길 때 Qdrant로 마이그레이션을 고려하면 된다.

## 관련 페이지

- [벡터 데이터베이스](./vector-database.md) — 벡터 DB 개념과 종류
- [RAG 문서 검색 메커니즘](./rag-search-mechanism.md) — 벡터 검색이 동작하는 원리
- [임베딩 검색 정확성 향상](./embedding-search-accuracy.md) — 검색 품질 개선 전략
- [Supabase — Next.js 연동](../backend/supabase-nextjs.md) — pgvector 기반 Supabase Vector

## 출처

- DB별 검색속도 비교 — 2026-04-14
