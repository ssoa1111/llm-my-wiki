# LangGraph 아키텍처 핵심 개념

> LangGraph를 사용하기 위한 핵심 개념 — 그래프 구조(Node/Edge), 중앙 상태(TypedDict), 순환 구조(조건부 분기), 비동기 처리, Tool 통합.

## 핵심 내용

### 1. 그래프 기반 아키텍처 (Nodes & Edges)

```python
from langgraph.graph import StateGraph, END

# 노드 = 함수
def my_node(state):
    return updated_state

graph = StateGraph(MyState)
graph.add_node("node_a", step1_func)
graph.add_node("node_b", step2_func)

# 엣지 = 연결
graph.add_edge("node_a", "node_b")  # A → B 순서 실행
```

LangGraph Studio에서 그래프를 시각적으로 확인 가능.

---

### 2. 상태 관리 (TypedDict)

모든 노드가 하나의 중앙 상태를 공유한다:

```python
from typing import TypedDict, Annotated
from langgraph.graph.message import add_messages

class State(TypedDict):
    messages:   Annotated[list, add_messages]  # 대화 기록 자동 추가
    documents:  list[str]   # 검색 결과
    quality:    int         # 검증 점수
    retry_count: int        # 재시도 횟수

def step1(state: State) -> State:
    data = fetch_data()
    return {"documents": data}  # 상태 업데이트

def step2(state: State) -> State:
    # 이전 단계 데이터 접근 가능
    summary = summarize(state["documents"])
    return {"summary": summary}
```

---

### 3. 순환 구조 (조건부 분기)

LangGraph의 가장 강력한 기능 — 품질이 낮으면 이전 단계로 돌아가는 루프 구현:

```python
def should_retry(state: State):
    if state["retry_count"] >= 3:
        return "finish"   # 최대 시도 초과
    if state["quality"] < 70:
        return "retry"    # 품질 낮으면 재검색
    return "finish"

graph.add_conditional_edges(
    "check_quality",
    should_retry,
    {
        "retry": "search",   # 순환!
        "finish": END
    }
)
graph.add_edge("search", "check_quality")  # 루프 완성
```

---

### 4. 비동기 처리 (async/await)

여러 작업 병렬 실행으로 속도 개선:

```python
import asyncio

async def parallel_search(state: State):
    # 순차: 3+2+2=7초 → 병렬: max(3,2,2)=3초
    results = await asyncio.gather(
        search_notion(state["query"]),
        search_github(state["query"]),
        search_web(state["query"]),
    )
    return {"results": results}

async def enrich_data(state: State):
    analysis, user_data = await asyncio.gather(
        llm.ainvoke(prompt),           # 5초
        db.fetch_user_profile(user_id) # 1초
    )
    # 병렬: 5초 (순차: 6초)
```

---

### 5. Tool 통합

LLM이 상황에 맞는 도구를 자율 선택:

```python
from langchain_core.tools import tool

@tool
def search_notion(query: str) -> str:
    """Notion 문서를 검색합니다"""
    pass

@tool
def calculate(expression: str) -> float:
    """수학 계산을 수행합니다"""
    return eval(expression)

tools = [search_notion, calculate]

# LLM이 자동으로 적절한 도구 선택
agent = create_agent(llm, tools)
```

---

### 6. LangSmith 모니터링

```python
import os
os.environ["LANGCHAIN_TRACING_V2"] = "true"
os.environ["LANGCHAIN_API_KEY"] = "your-key"

# 이후 모든 실행이 자동으로 LangSmith에 기록됨
```

---

### LangGraph 설치

```bash
pip install langgraph langchain langchain-openai

# 환경변수
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
SUPABASE_URL=https://...
SUPABASE_KEY=...
```

---

### 핵심 개념 요약

| 개념 | 역할 |
|------|------|
| Node | 실행 단위 (함수) |
| Edge | 노드 간 연결 |
| Conditional Edge | 조건부 분기 (순환 가능) |
| State (TypedDict) | 모든 노드가 공유하는 중앙 데이터 |
| add_messages Annotator | 메시지 리스트를 덮어쓰지 않고 추가 |
| MemorySaver | 체크포인팅으로 대화 기록 유지 |

## 관련 페이지

- [LangGraph](../../entities/langgraph.md) — LangGraph 엔티티 개요
- [고급 RAG 패턴](../../concepts/advanced-rag.md) — LangGraph로 구현하는 Adaptive/Corrective/Self-RAG
- [멀티에이전트 구조에서 고급 RAG 패턴 적용](../../syntheses/multi-agent-rag.md) — LangGraph 기반 멀티에이전트 설계
- [DeepAgent vs LangChain vs LangGraph](../../syntheses/deepagent-langchain-langgraph.md) — 세 프레임워크 비교

## 출처

- LangGraph 시작하기 위한 준비사항 — 2026-04-14
