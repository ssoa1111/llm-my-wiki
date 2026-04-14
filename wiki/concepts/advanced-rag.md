# 고급 RAG 패턴 (Advanced RAG)

> 기본 RAG의 한계(검색 실패, 환각, 획일적 검색)를 해결하는 세 가지 고급 패턴: Adaptive, Corrective, Self-RAG

## 핵심 내용

기본 [RAG](../concepts/rag.md)의 문제: 질문 유형 무관하게 항상 같은 방식으로 검색, 검색 실패 시 그냥 진행, 품질 체크 없음. 고급 RAG 패턴은 이를 각각 해결한다.

---

### 1. Adaptive RAG (적응형 RAG)

**"질문 유형에 따라 검색 전략을 다르게 선택"**

질문을 먼저 분류(Router)한 후 경로를 선택:
- 내부 지식 질문 → 벡터 DB 검색
- 최신 정보 질문 → 웹 검색
- 간단한 질문 → 직접 답변

**장점**: 불필요한 검색 감소 → 속도·비용·정확도 개선

---

### 2. Corrective RAG (교정형 RAG)

**"검색 결과가 부족하면 다른 방법으로 재시도"**

검색 후 관련성을 LLM으로 평가(0-100점):
- 점수 ≥ 70 → 답변 생성
- 점수 < 70 → 웹 검색으로 Fallback

**장점**: 오래된 정보 필터링, 검색 실패 시 자동 복구

---

### 3. Self-RAG (자가 반성 RAG)

**"생성한 답변을 스스로 검증하고 필요시 재생성"**

답변 생성 후 3가지를 병렬 검증:
1. 문서 근거 여부 (Support Check)
2. 환각 여부 (Hallucination Check)
3. 질문 관련성 (Relevance Check)

검증 실패 시 재생성 (최대 3회). 환각 방지가 핵심 목적.

---

### 세 패턴 결합: Ultra-RAG

```
[Adaptive] 질문 분류 → 적절한 소스 검색
[Corrective] 관련성 평가 → 필요시 웹 검색
[Self-RAG] 답변 검증 → 필요시 재생성
```

### 성능 비교

| 패턴 | 정확도 | 환각률 | 응답속도 | 비용/회 |
|------|--------|--------|----------|---------|
| 기본 RAG | 60-70% | 20-30% | ~3초 | $0.01 |
| Adaptive | 75-80% | 20-30% | ~4초 | $0.015 |
| Corrective | 80-85% | 15-20% | ~5-7초 | $0.025 |
| Self-RAG | 85-90% | 5-10% | ~8-12초 | $0.04 |
| Ultra-RAG | 90-95% | <5% | ~10-15초 | $0.06 |

### 선택 가이드

- 프로토타입 → 기본 RAG
- 다양한 질문 유형 → Adaptive RAG
- 검색 품질 중요 → Corrective RAG
- 환각 절대 안 됨 (의료/법률) → Self-RAG
- 프로덕션, 최고 품질 → Ultra-RAG

**구현은 [LangGraph](../entities/langgraph.md)로**: 순환(retry loop), 조건부 분기, 상태 관리가 필요하기 때문에 [LangChain](../entities/langchain.md)의 선형 체인으로는 구현하기 어렵다.

## 관련 페이지

- [RAG](../concepts/rag.md) — 기본 RAG 개념
- [LangGraph](../entities/langgraph.md) — 고급 RAG 구현에 필요한 그래프 오케스트레이션 프레임워크
- [LangChain](../entities/langchain.md) — 기본 RAG에 적합한 선형 프레임워크
- [청킹](../concepts/chunking.md) — RAG 품질을 좌우하는 문서 분할 전략
- [오케스트레이터 아키텍처](../tech/ai/orchestrator-architecture.md) — 멀티에이전트 시스템에서 RAG 활용

## 출처

- 고급 RAG 패턴 완벽 가이드 — 2026-04-14
- RAG vs LangChain vs LangGraph — 2026-04-14
