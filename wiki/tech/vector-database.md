# 벡터 데이터베이스

> 고차원 임베딩 벡터를 저장하고 유사도 검색(ANN)을 지원하는 데이터베이스. RAG의 핵심 인프라.

## 핵심 내용

벡터 데이터베이스는 텍스트·이미지 등을 임베딩 모델로 변환한 고차원 벡터를 저장하고, 쿼리 벡터와 가장 유사한 벡터를 빠르게 찾아주는 특수 데이터베이스다.

**주요 도구**:
- **Pinecone**: 완전 관리형 클라우드 벡터 DB. 빠른 프로토타이핑에 적합.
- **Weaviate**: 오픈소스, 그래프 기반 벡터 DB. 다중 모달 지원.
- **Chroma**: 경량 오픈소스 임베딩 DB. 로컬 개발에 적합.

**핵심 연산**:
- **임베딩(Embedding)**: 텍스트를 수백~수천 차원의 부동소수점 벡터로 변환
- **인덱싱**: HNSW, IVF 등 ANN(Approximate Nearest Neighbor) 알고리즘으로 검색 가속
- **유사도 검색**: 코사인 유사도, 내적 등으로 가장 관련 있는 청크 반환

**[RAG](../concepts/rag.md)에서의 역할**:
벡터 DB는 RAG 파이프라인의 지식 저장소다. 문서 청크를 임베딩으로 변환·저장하고, 쿼리 시점에 관련 청크를 검색하여 LLM 컨텍스트로 제공한다.

**[LLM Wiki](../concepts/llm-wiki.md)와의 비교**:
LLM Wiki에서는 벡터 DB 대신 [Obsidian](../entities/obsidian.md) 같은 파일 기반 저장소를 사용한다. 벡터 DB는 원본 문서를 그대로 저장하는 반면, LLM Wiki는 합성된 지식을 마크다운으로 저장한다.

## 관련 페이지

- [RAG](../concepts/rag.md) — 벡터 DB를 핵심 인프라로 사용하는 아키텍처
- [LLM Wiki](../concepts/llm-wiki.md) — 벡터 DB를 사용하지 않는 대안적 접근
- [Obsidian](../entities/obsidian.md) — LLM Wiki에서 벡터 DB에 해당하는 저장 플랫폼

## 출처

- [RAG vs LLM Wiki: 지식 관리의 두 가지 접근법](../../sources/sample-rag-vs-wiki.md) — 2026-04-10
