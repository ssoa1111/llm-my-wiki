# LLM Wiki

> LLM이 소스를 읽고 직접 마크다운 위키 페이지를 작성·유지하며 지식을 복리로 축적하는 방식

## 핵심 내용

LLM Wiki는 [RAG](../concepts/rag.md)의 단순 검색-생성 패턴을 넘어, LLM이 지식을 능동적으로 합성하고 페이지 형태로 저장·관리하는 아키텍처다. [Andrej Karpathy](../entities/andrej-karpathy.md)가 제안한 개념으로, 개인 지식 관리의 새로운 패러다임을 제시한다.

**동작 원리**:
1. 새 소스 문서가 들어오면 LLM이 전체를 읽고 핵심 내용 파악
2. 관련 wiki 페이지를 생성하거나 기존 페이지를 업데이트
3. 페이지 간 상호참조(링크)를 자동으로 추가
4. 인덱스와 로그를 갱신하여 지식 그래프를 유지

**장점**:
- 지식이 복리로 축적 — 새 소스가 기존 지식과 연결되며 풍부해짐
- 개념 간 연결이 명시적으로 유지됨
- 인간이 읽기 좋은 마크다운 형식으로 저장

**단점**:
- LLM이 합성 과정에서 실수하거나 편향이 개입될 수 있음
- 초기 구조 설계와 프롬프트 설정이 필요
- 원본 문서의 뉘앙스가 손실될 수 있음

**역사적 선례**: [Vannevar Bush](../entities/vannevar-bush.md)의 Memex(1945)는 인간이 연상적으로 정보를 연결하는 기계를 구상했다. LLM Wiki는 이 비전을 AI로 구현한 것으로 볼 수 있다.

**플랫폼**: [Obsidian](../entities/obsidian.md)은 마크다운 기반 로컬 파일 구조로 LLM Wiki의 이상적인 구현 환경을 제공한다.

## 관련 페이지

- [RAG](../concepts/rag.md) — 대안적 지식 활용 방식
- [RAG vs LLM Wiki 비교](../syntheses/rag-vs-llm-wiki.md) — 두 접근법의 상세 비교
- [Andrej Karpathy](../entities/andrej-karpathy.md) — LLM Wiki 개념 제안자
- [Vannevar Bush](../entities/vannevar-bush.md) — Memex로 LLM Wiki의 역사적 선례 제시
- [Obsidian](../entities/obsidian.md) — LLM Wiki 구현에 적합한 플랫폼

## 출처

- [RAG vs LLM Wiki: 지식 관리의 두 가지 접근법](../../sources/sample-rag-vs-wiki.md) — 2026-04-10
