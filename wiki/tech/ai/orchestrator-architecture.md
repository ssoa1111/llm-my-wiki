# 오케스트레이터 아키텍처

> AI 멀티에이전트 시스템에서 중앙 오케스트레이터가 서브에이전트·스킬·도구를 조율하는 설계 패턴

## 핵심 내용

```
사용자 요청
    │
    ▼
┌─────────────────────────┐
│     오케스트레이터 (LLM)  │
│  라우팅 규칙을 읽고 판단   │
└──────┬────────┬──────────┘
       │        │
       ▼        ▼
 [서브에이전트] [스킬/도구]
  rag-agent    summarize
  web-agent    calculator
```

**핵심 원칙**: 서브에이전트는 오케스트레이터를 모른다 (느슨한 결합). 각 서브에이전트는 자신의 역할에만 집중.

### 구성 요소

**오케스트레이터 (Orchestrator)**
- 사용자 의도를 파악하고 어떤 서브에이전트·도구를 사용할지 결정
- LLM 기반, 시스템 프롬프트에 라우팅 규칙 정의
- [ReAct 패턴](../../concepts/prompt-engineering.md) 적용: 추론(Reasoning) + 행동(Action) 교차

**서브에이전트 (Sub-Agent)**
- 특정 도메인에 전문화된 독립 에이전트
- RAG 서브에이전트, 웹 검색 에이전트 등
- 오케스트레이터로부터 태스크를 받아 처리 후 결과 반환

**스킬 (Skill)**
- 재사용 가능한 기능 단위 (summarize, translate, refine 등)
- 여러 에이전트에서 공유

**도구 (Tool)**
- 외부 시스템과의 인터페이스 (calculator, weather API 등)

### RAG 서브그래프 흐름 (LangGraph 구현 예시)

```
retrieve → grade ─┬─ generate → validate ──┬→ END (성공)
                  │                        └→ generate (재시도)
                  └─ no_document → END (탈출)
```

1. **retrieve**: 벡터 검색 (k=10 후보) → LLM 리랭크 → 상위 3개
2. **grade**: Corrective RAG — 문서가 실제로 답할 수 있는지 판단
3. **generate**: Parent-Child 청킹이면 parent_content 우선 사용
4. **validate**: Self-RAG — grounded·no_hallucination·relevant 3가지 검증
5. **no_document**: 품질 미달 시 "찾을 수 없음" 반환 → 오케스트레이터가 웹 검색 결정

### 문서 검색 기법

- 벡터 유사도 (코사인) — 기본
- HNSW — ANN 인덱스 알고리즘
- 키워드 필터·메타데이터 — 정확한 조건 매칭
- pg_trgm — PostgreSQL 텍스트 유사도 검색

### 상태 관리

Claude Code의 경우 별도 상태 객체 없이 **대화 히스토리**로 상태를 관리. 내부적으로 Plan 수립 → TaskCreate → TaskUpdate(in_progress) → 실행 → TaskUpdate(completed) 사이클.

### 스킬 체이닝 (Skill Chaining)

여러 스킬을 순차적으로 실행해야 할 때 사용하는 패턴.

```
오케스트레이터가 시스템 프롬프트 읽기
  → "사전 정의 스킬 체인" 섹션에서 체인 설명 확인
  → 체인 이름에서 단계 추론
  → 스킬 체인 실행 규칙에 따라 각 Tool 순차 호출
  → 결과 사용자에게 출력
```

**HITL (Human-in-the-Loop) 포함 시 주의사항**:
- 단순 tool 호출은 중간에 사용자 피드백(interrupt)을 넣기 어려움
- 해결: LangGraph의 `create_agent interrupt` 사용 → 단계별 승인 가능
- Claude Code 방식: 대화 히스토리로 상태 관리 → Plan 수립 → TaskCreate → TaskUpdate(in_progress) → 실행 → TaskUpdate(completed)

**에이전트 플로우 예시**:
```
질문
 ├─ "날씨는?"          → get_weather 직접 호출
 ├─ "문서 요약해줘"    → summarize 스킬 직접 호출
 ├─ "PDF에서 찾아봐"   → rag-agent 서브에이전트 호출
 └─ "refine+요약 체인" → 스킬 체인 실행
```

### 에이전트의 스킬/도구 선택 기준

에이전트는 **description 텍스트만** 읽고 어떤 스킬/도구를 선택할지 결정한다.

```
에이전트 → description 텍스트 분석 → 가장 적합한 도구 선택
```

- 내부 구현 로직, 파라미터 이름, 파일 구조는 선택에 영향 없음
- **description이 곧 인터페이스**다: 설명이 정확하고 구체적일수록 더 잘 선택됨
- "스킬 vs 도구"의 구분은 개발자의 추상화 레벨 차이일 뿐 — 에이전트에게는 동일

**좋은 description 예시**:
```
# ❌ 모호한 설명
"데이터를 처리한다"

# ✅ 구체적인 설명
"PDF 파일에서 텍스트를 추출하고 벡터 검색으로 관련 내용을 반환한다.
  사용 시점: 사용자가 문서 내용에 대해 질문할 때"
```

### 구현 프레임워크

- **[LangGraph](../../entities/langgraph.md)**: Python, 그래프 기반
- **PydanticAI**: Python, 타입 안전성 강조
- **[n8n](../../entities/n8n.md)**: 노코드, 시각적 편집

## 관련 페이지

- [LangGraph](../../entities/langgraph.md) — 오케스트레이터 구현에 사용하는 프레임워크
- [고급 RAG 패턴](../../concepts/advanced-rag.md) — 오케스트레이터 내 RAG 서브에이전트 패턴
- [청킹](../../concepts/chunking.md) — RAG 서브에이전트의 문서 처리
- [프롬프트 엔지니어링](../../concepts/prompt-engineering.md) — 오케스트레이터 시스템 프롬프트 설계
- [Claude Code 개념](./claude-code-concepts.md) — Skill/Subagent/Command 구분
- [Python RAG 구현](./rag-python-implementation.md) — LangGraph 멀티에이전트 코드 예시

## 출처

- 오케스트레이터 아키텍처 — 2026-04-14
- 에이전트가 스킬 또는 툴 선택 기준 — 2026-04-14
