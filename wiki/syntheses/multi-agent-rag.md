# 멀티에이전트 구조에서 고급 RAG 패턴 적용

> Main Agent(오케스트레이터)에 Adaptive RAG, Sub Agent에 Corrective/Self-RAG를 적용하는 멀티에이전트 RAG 아키텍처.

## 핵심 내용

### 전체 구조

```
사용자 질문
    ↓
Main Agent (Orchestrator)  ← Adaptive RAG: 어느 Sub Agent로 보낼지 결정
    ↓           ↓           ↓
Sub Agent 1  Sub Agent 2  Sub Agent 3   ← Corrective + Self-RAG 적용
(Notion RAG) (GitHub RAG) (Web RAG)       각자 검색 → 품질 검증 → 답변
    ↓           ↓           ↓
Main Agent (결과 통합 & 최종 답변)
    ↓
최종 답변
```

---

### 패턴별 적용 위치

**Main Agent = Adaptive RAG (라우터)**

```python
class MainAgent:
    async def route_question(self, question: str):
        # LLM이 질문을 분석해 적절한 Sub Agent 결정
        prompt = f"질문: {question}\n어느 전문 에이전트로 라우팅할까요?"
        route = await self.llm.ainvoke(prompt)
        
        if route == "notion_agent":
            return await self.notion_agent.process(question)
        elif route == "github_agent":
            return await self.github_agent.process(question)
```

**Sub Agent = Corrective RAG + Self-RAG (품질 검증)**

```python
class NotionSubAgent:
    async def process(self, question: str):
        # 1. 벡터 검색
        docs = await self.vector_store.search(question)
        
        # 2. Corrective RAG: 품질 체크
        quality = await self.check_relevance(docs, question)
        if quality < 0.7:
            docs = await self.web_search(question)  # 재검색
        
        # 3. Self-RAG: 답변 품질 검증
        answer = await self.generate(question, docs)
        if not await self.validate_answer(answer, question):
            answer = await self.regenerate(question, docs)
        
        return answer
```

---

### 스킬체인 (Skill Chain)

DeepAgent 기반 오케스트레이터에서 여러 스킬을 순차적으로 실행하는 패턴.

**동작 방식**:
```
시스템 프롬프트 읽기
  → "사전 정의 스킬 체인" 섹션에서 체인 설명 확인
  → 체인 이름에서 단계 추론
  → 개별 Tool 순차 호출
  → 각 단계 결과를 사용자에게 출력 (승인 필요 시 HITL)
  → 다음 Tool 호출
```

**Tool vs Skill**:
- **Skill**: 비개발자를 위한 MD 파일 형태의 지시 (사용법 문서)
- **Tool**: 개발자가 코드로 만든 기능
- AI 입장에서는 둘 다 **tool**로 취급, 자율적으로 선택

**스킬체인 한계 및 해결**:
- Tool은 한 번 호출 후 종료 → 중간 사용자 피드백(interrupt) 불가
- 해결: LangGraph의 `create_agent` + `MemorySaver` + interrupt 사용

---

### Claude Code의 단계 실행 방식

```
Plan 수립 (사용자 승인)
  → TaskCreate × N개 (Todo 목록)
  → 1단계: TaskUpdate(in_progress) → Tool 실행 → TaskUpdate(completed)
  → 결과 출력 → 사용자 응답
  → 2단계: 반복
```

State를 별도 관리하지 않고 **대화 히스토리**로 상태 관리.

---

### LangGraph vs DeepAgent

| | DeepAgent | LangGraph |
|--|-----------|-----------|
| 인터럽트 | 불가 | `create_agent interrupt` 지원 |
| 설정 | 간단 (pip install) | 직접 그래프 설계 필요 |
| 적합 | 빠른 프로토타입 | Human-in-the-loop 필요 시 |

---

### Sub Agent별 벡터 DB 관리

**권장: 단일 DB + 메타데이터 분리**

```python
# documents 테이블 — metadata로 에이전트 구분
metadata = {
    "agent": "notion",   # notion | github | web
    "type": "til",
    "date": "2024-01-28"
}

# 에이전트별 검색 시 필터 적용
results = vectorstore.similarity_search(
    query,
    filter={"agent": "notion"}
)
```

- 장점: 관리 간단, 비용 저렴, Agent 간 교차 검색 가능
- 단점: 데이터 많아지면 느려질 수 있음

**대안: Agent별 별도 테이블** (성능 격리 필요 시)
- notion_documents, github_documents, web_documents 각각 분리
- 단점: 관리 복잡, 비용 높음, Agent 간 공유 어려움

## 관련 페이지

- [고급 RAG 패턴](../concepts/advanced-rag.md) — Adaptive/Corrective/Self-RAG 개념
- [오케스트레이터 아키텍처](../tech/ai/orchestrator-architecture.md) — 멀티에이전트 설계 원칙
- [LangGraph](../entities/langgraph.md) — 그래프 기반 오케스트레이션
- [Claude Code 개념](../tech/ai/claude-code-concepts.md) — Skill/Tool/Command 차이
- [DeepAgent vs LangChain vs LangGraph](../syntheses/deepagent-langchain-langgraph.md) — 프레임워크 계층 비교

## 출처

- 멀티에이전트 구조에서 고급 RAG 패턴 적용 — 2026-04-14
- 스킬체인 — 2026-04-14
