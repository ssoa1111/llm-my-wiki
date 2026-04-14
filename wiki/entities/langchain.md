# LangChain

> LLM 애플리케이션을 쉽게 만들기 위한 Python/JavaScript 프레임워크. 선형 체인 방식으로 RAG 파이프라인 구축에 최적화.

## 핵심 내용

LangChain은 LLM 호출, 프롬프트 관리, 문서 로더, 벡터 스토어 연결 등을 추상화한 프레임워크다. **단계별 순차 실행(A → B → C)**이 핵심이며, LCEL(LangChain Expression Language)로 파이프라인을 간결하게 표현할 수 있다.

```python
# 기본 RAG 파이프라인 (선형)
retriever | prompt_template | llm | output_parser
```

**적합한 케이스**:
- 단순하고 예측 가능한 워크플로우
- 기본 [RAG](../concepts/rag.md) 파이프라인 (문서 검색 → 답변 생성)
- 빠른 프로토타이핑
- 상태 관리가 복잡하지 않은 경우

**제한사항**:
- 순환(loop) 불가
- 복잡한 조건부 분기 어려움
- 멀티 에이전트 구현 어려움
→ 이 한계를 극복하기 위해 [LangGraph](../entities/langgraph.md)가 만들어짐

**LangSmith**: LangChain/LangGraph 실행 추적·모니터링 도구. 디버깅과 성능 분석에 활용. (유료)

## 관련 페이지

- [LangGraph](../entities/langgraph.md) — LangChain 위에 구축된 고급 오케스트레이션 프레임워크
- [RAG](../concepts/rag.md) — LangChain으로 구현하는 핵심 패턴
- [고급 RAG 패턴](../concepts/advanced-rag.md) — LangGraph가 필요한 복잡한 RAG

## 출처

- RAG vs LangChain vs LangGraph — 2026-04-14
