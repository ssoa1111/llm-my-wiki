# LangGraph

> LangChain 위에 구축된 그래프 기반 AI 오케스트레이션 프레임워크. 순환·조건부 분기·상태 관리가 필요한 복잡한 에이전트 시스템에 사용.

## 핵심 내용

[LangChain](../entities/langchain.md)의 선형 체인으로는 구현할 수 없는 **순환(cycle)**, **조건부 분기**, **멀티 에이전트 협업**을 지원한다.

**아키텍처**: 노드(Node)와 엣지(Edge)로 구성된 방향성 그래프
- **노드**: 함수 형태의 작업 단위 (LLM 호출, 도구 실행, 상태 변환 등)
- **엣지**: 노드 간 데이터 흐름
- **조건부 엣지**: 상태에 따라 다음 노드를 동적으로 결정
- **순환**: 이전 노드로 되돌아가는 반복 구조

**상태 관리**: `TypedDict`(Python) 또는 `Interface`(TypeScript)로 명시적 상태 정의. 모든 노드가 중앙 집중식 상태를 공유.

**LangSmith**: LangGraph 실행 추적 및 디버깅 도구. 환경변수 `LANGCHAIN_TRACING_V2=true`로 활성화.

**설치**: `pip install langgraph langchain langchain-openai`

### LangChain vs LangGraph 비교

| 항목 | LangChain | LangGraph |
|------|-----------|-----------|
| 구조 | 선형 체인 | 그래프 (순환 가능) |
| 분기 | 제한적 | 복잡한 조건부 분기 |
| 상태 | 제한적 | 명시적 중앙 상태 |
| 멀티 에이전트 | 어려움 | 지원 |
| 사용 케이스 | 단순 RAG, 프로토타입 | 고급 RAG, Self-Reflective Agent |

### 주요 사용 패턴

- **[고급 RAG 패턴](../concepts/advanced-rag.md)**: Adaptive/Corrective/Self-RAG 구현 (retry loop 필요)
- **멀티 에이전트**: 오케스트레이터 + 서브에이전트 구조
- **Human-in-the-loop**: 중간에 인간 승인 단계 삽입

## 관련 페이지

- [LangChain](../entities/langchain.md) — LangGraph의 기반 프레임워크, 단순한 RAG에 적합
- [고급 RAG 패턴](../concepts/advanced-rag.md) — LangGraph로 구현하는 핵심 패턴
- [오케스트레이터 아키텍처](../tech/ai/orchestrator-architecture.md) — LangGraph 기반 멀티에이전트 설계
- [RAG](../concepts/rag.md) — LangGraph로 구현되는 기반 개념

## 출처

- RAG vs LangChain vs LangGraph — 2026-04-14
- LangGraph 시작하기 위한 준비사항 — 2026-04-14
