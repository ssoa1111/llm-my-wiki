# RAG vs LLM Wiki: 지식 관리 패러다임 비교

> 외부 지식을 활용하는 두 가지 LLM 아키텍처의 핵심 차이: 검색 중심(RAG) vs. 축적 중심(LLM Wiki)

## 핵심 내용

[RAG](../concepts/rag.md)와 [LLM Wiki](../concepts/llm-wiki.md)는 LLM이 외부 지식을 활용하는 방식에서 근본적으로 다른 철학을 가진다.

### 비교 표

| 항목 | RAG | LLM Wiki |
|------|-----|----------|
| 지식 저장 방식 | 원본 문서 청크 (벡터 DB) | 합성된 마크다운 페이지 |
| 지식 활용 시점 | 쿼리 시점에 동적 검색 | 사전에 축적·구조화 |
| 크로스 문서 연결 | 없음 | 명시적 링크로 관리 |
| 지식 축적 | 없음 (원본만 보존) | 복리로 축적 |
| 구현 복잡도 | 낮음 | 중간 (초기 설정 필요) |
| 원본 충실도 | 높음 | 낮음 (LLM 합성 개입) |
| 오류 위험 | 낮음 | 높음 (LLM 실수 가능) |
| 플랫폼 | [벡터 데이터베이스](../tech/vector-database.md) | [Obsidian](../entities/obsidian.md) 등 파일 기반 |

### 언제 무엇을 선택할까?

**RAG가 적합한 경우**:
- 원본 문서의 정확한 내용이 중요할 때
- 빠른 프로토타이핑이 필요할 때
- 지식이 자주 바뀌는 영역 (최신 뉴스, 실시간 데이터)

**LLM Wiki가 적합한 경우**:
- 지식 간 연결과 통합적 이해가 중요할 때
- 장기적으로 지식을 축적·발전시킬 때
- 개인 학습 및 연구 관리

### 역사적 맥락

[Vannevar Bush](../entities/vannevar-bush.md)의 Memex(1945)는 연상적 연결을 통한 지식 관리를 구상했다. LLM Wiki는 이 비전을 AI로 구현하며, RAG는 더 단순한 검색-응답 패턴에 가깝다. [Andrej Karpathy](../entities/andrej-karpathy.md)는 LLM Wiki의 "지식 복리 축적" 속성이 RAG에 없는 핵심 가치라고 주장한다.

## 관련 페이지

- [RAG](../concepts/rag.md) — 검색 기반 지식 증강 방식
- [LLM Wiki](../concepts/llm-wiki.md) — 축적 기반 지식 관리 방식
- [Andrej Karpathy](../entities/andrej-karpathy.md) — LLM Wiki 개념 제안자
- [Vannevar Bush](../entities/vannevar-bush.md) — Memex로 역사적 맥락 제공
- [벡터 데이터베이스](../tech/vector-database.md) — RAG의 핵심 인프라
- [Obsidian](../entities/obsidian.md) — LLM Wiki의 이상적 플랫폼

## 출처

- [RAG vs LLM Wiki: 지식 관리의 두 가지 접근법](../../sources/sample-rag-vs-wiki.md) — 2026-04-10
