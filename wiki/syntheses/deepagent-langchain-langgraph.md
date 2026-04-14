# DeepAgent vs LangChain vs LangGraph

> 세 프레임워크의 계층 구조 — LangChain(블록) → LangGraph(오케스트레이션) → DeepAgent(완성된 에이전트).

## 핵심 내용

### 계층 구조

```
DeepAgent (deepagents)  ← 즉시 사용 가능한 완성된 에이전트
    ↑ 기반
LangGraph               ← 멀티 에이전트 오케스트레이션
    ↑ 기반
LangChain               ← AI 앱 개발 기본 프레임워크
```

비유: LangChain = 레고 블록, LangGraph = 조립 설명서, DeepAgent = 완성된 레고 제품.

---

### 각 프레임워크 특성

**LangChain**
- AI 애플리케이션 개발을 위한 **기본 프레임워크**
- LLM, 프롬프트, 체인, 도구 등의 빌딩 블록 제공
- 모든 것을 직접 조립해야 함
- 선형 파이프라인에 적합

**LangGraph**
- LangChain 위에 구축된 **상태 기반 오케스트레이션 라이브러리**
- 그래프 구조로 복잡한 멀티 에이전트 워크플로우 구현
- 체크포인팅, 스트리밍, Human-in-the-loop 지원
- 순환 구조(retry loop), 조건부 분기 구현 가능
- 여전히 직접 그래프를 설계해야 함

**DeepAgent (deepagents)**
- LangChain + LangGraph 위에 구축된 **즉시 사용 가능한 완성 에이전트**
- 4가지 내장 기능:
  - 플래닝 도구 (todo 리스트)
  - 서브 에이전트 생성
  - 파일시스템 접근
  - 상세한 시스템 프롬프트
- `pip install deepagents` 후 바로 사용 가능
- Claude Code가 이 아키텍처를 사용

---

### 비교표

| | LangChain | LangGraph | DeepAgent |
|--|-----------|-----------|-----------|
| 역할 | 기본 빌딩 블록 | 멀티 에이전트 오케스트레이션 | 완성된 에이전트 |
| 인터럽트(HITL) | 불가 | `create_agent interrupt` 지원 | 불가 (LangGraph로 대안) |
| 설정 복잡도 | 중간 | 높음 (그래프 직접 설계) | 낮음 (pip install만) |
| 적합 용도 | 단순 RAG, 체인 | Human-in-the-loop, 복잡한 워크플로우 | 빠른 프로토타입 |
| 순환 구조 | 불가 | 가능 | 내장 |

---

### 선택 가이드

```
단순 RAG나 체인 → LangChain
Human-in-the-loop 필요 → LangGraph
빠른 프로토타입 / 완성 에이전트 → DeepAgent
멀티에이전트 + HITL → LangGraph
```

고급 RAG 패턴(Adaptive/Corrective/Self-RAG)의 순환 구조와 조건부 분기는 LangGraph로 구현하는 것이 표준이다.

## 관련 페이지

- [LangGraph](../entities/langgraph.md) — LangGraph 상세 개념
- [LangChain](../entities/langchain.md) — LangChain 상세 개념
- [고급 RAG 패턴](../concepts/advanced-rag.md) — LangGraph로 구현하는 Adaptive/Corrective/Self-RAG
- [멀티에이전트 구조에서 고급 RAG 패턴 적용](../syntheses/multi-agent-rag.md) — 실제 멀티에이전트 RAG 아키텍처
- [오케스트레이터 아키텍처](../tech/ai/orchestrator-architecture.md) — 멀티에이전트 설계 원칙

## 출처

- 딥에이전트, 랭체인, 랭그래프 차이점 — 2026-04-14
