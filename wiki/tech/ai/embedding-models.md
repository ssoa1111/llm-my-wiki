# 임베딩 모델

> 텍스트를 고차원 벡터로 변환하는 모델. RAG의 검색 품질을 결정하는 핵심 요소.

## 핵심 내용

임베딩 모델은 텍스트의 "의미"를 숫자 벡터로 인코딩한다. 같은 의미의 텍스트는 벡터 공간에서 가까이 위치하게 된다.

### 주요 모델 비교

| 모델 | 차원 | 가격 | 특징 |
|------|------|------|------|
| **OpenAI text-embedding-3-small** ⭐ | 1536 | $0.02/1M 토큰 | 성능/가격 밸런스 최고, 표준 |
| **OpenAI text-embedding-3-large** | 3072 | $0.13/1M 토큰 | 최고 성능, 비쌈 |
| **Cohere embed-multilingual-v3.0** | 1024 | 중간 | 100개 언어 지원, **한국어 강함** |
| **Google text-embedding-004** | 768 | 중간 | 좋은 성능 |
| **BAAI/bge-small-en-v1.5** | 384 | 무료 | 오픈소스, 로컬 실행 |
| **sentence-transformers** | 다양 | 무료 | 오픈소스, 로컬 실행 |

**성능 순위**: OpenAI large > Cohere v3 > OpenAI small > Google > 오픈소스

### 차원(Dimension)의 의미

- 차원이 높을수록: 표현력 ↑, 저장 공간 ↑, 검색 속도 ↓
- 384차원: 빠름, 준수한 성능
- 1536차원: 표준 (대부분의 경우 충분)
- 3072차원: 최고 성능 (비용 고려 필요)

### 중요: 모델 변경 시 전체 재임베딩 필요

```
⚠️ OpenAI 벡터 ≠ Cohere 벡터
→ 모델을 바꾸면 기존 저장된 모든 벡터를 재생성해야 함
→ 초기에 모델을 신중하게 선택할 것
```

### 선택 가이드

```
일반 용도    → OpenAI text-embedding-3-small (성능/가격 최적)
한국어 중심  → Cohere embed-multilingual-v3.0
비용 0원    → BAAI/bge-small (로컬, 성능 준수)
최고 품질   → OpenAI text-embedding-3-large
```

## 관련 페이지

- [벡터 데이터베이스](./vector-database.md) — 임베딩 벡터를 저장하고 검색하는 인프라
- [청킹](../../concepts/chunking.md) — 임베딩 전에 문서를 분할하는 전략
- [벡터 유사도 측정](./vector-similarity.md) — 임베딩 벡터 간 유사도 계산 방식
- [RAG](../../concepts/rag.md) — 임베딩 모델이 핵심 구성요소인 아키텍처

## 출처

- 임베딩 모델 종류 — 2026-04-14
