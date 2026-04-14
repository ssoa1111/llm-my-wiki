# RAG (Retrieval-Augmented Generation)

> 쿼리 시점에 외부 문서를 검색하여 LLM에 컨텍스트로 제공함으로써 답변 품질을 높이는 방식

## 핵심 내용

RAG는 LLM의 정적 파라미터 지식을 보완하기 위해 외부 지식 소스를 동적으로 참조하는 아키텍처다.

**동작 원리**:
1. 문서를 청크(chunk)로 분할하고 임베딩 벡터로 변환
2. [벡터 데이터베이스](../tech/ai/vector-database.md)에 저장
3. 사용자 쿼리를 임베딩 후 유사 청크 검색 (코사인 유사도 등)
4. 검색된 청크를 컨텍스트로 LLM에 주입하여 답변 생성

**장점**:
- 구현이 단순하고 빠르게 프로토타이핑 가능
- 원본 문서를 그대로 보존 (지식 변형 없음)
- 최신 문서를 실시간으로 반영 가능

**단점**:
- 크로스 문서 연결이 없음 — 여러 문서에 걸친 개념 통합 불가
- 지식이 축적·합성되지 않음 — 매번 원본 검색에 의존
- 청크 품질에 답변 품질이 크게 좌우됨

**[LLM Wiki](../concepts/llm-wiki.md)와의 비교**: RAG는 원본 문서를 검색하는 반면, LLM Wiki는 LLM이 직접 지식을 합성·축적한다. RAG는 보존 중심, LLM Wiki는 축적 중심.

**기본 RAG의 한계**: 항상 같은 검색 전략, 검색 실패 시 그냥 진행, 품질 체크 없음 → [고급 RAG 패턴](../concepts/advanced-rag.md)(Adaptive/Corrective/Self-RAG)으로 해결.

## 관련 페이지

- [LLM Wiki](../concepts/llm-wiki.md) — 지식 축적 방식의 대안적 접근
- [RAG vs LLM Wiki 비교](../syntheses/rag-vs-llm-wiki.md) — 두 접근법의 상세 비교
- [벡터 데이터베이스](../tech/ai/vector-database.md) — RAG의 핵심 인프라
- [고급 RAG 패턴](../concepts/advanced-rag.md) — 기본 RAG의 한계를 극복하는 Adaptive/Corrective/Self-RAG
- [청킹](../concepts/chunking.md) — RAG 품질을 좌우하는 문서 분할 전략
- [임베딩 모델](../tech/ai/embedding-models.md) — 문서와 쿼리를 벡터로 변환하는 모델
- [LangChain](../entities/langchain.md) — 기본 RAG 구현 프레임워크
- [LangGraph](../entities/langgraph.md) — 고급 RAG 구현 프레임워크

## 출처

- [RAG vs LLM Wiki: 지식 관리의 두 가지 접근법](../../sources/sample-rag-vs-wiki.md) — 2026-04-10
