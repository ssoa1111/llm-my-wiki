# Obsidian

> 마크다운 기반 개인 지식 관리(PKM) 도구. 로컬 파일 저장과 링크 그래프가 특징.

## 핵심 내용

Obsidian은 마크다운 파일을 로컬에 저장하고 페이지 간 링크로 지식 그래프를 구성하는 PKM(Personal Knowledge Management) 도구다.

**주요 특징**:
- 모든 노트가 로컬 마크다운 파일 — 플랫폼 종속 없음
- 백링크(backlink) 자동 추적
- 그래프 뷰로 지식 연결 시각화
- 풍부한 플러그인 생태계

**LLM Wiki 플랫폼으로서의 적합성**:
Obsidian은 [LLM Wiki](../concepts/llm-wiki.md)의 이상적인 구현 환경이다:
- 마크다운 형식 → LLM이 직접 읽고 쓸 수 있음
- 로컬 파일 시스템 → 파일 I/O로 자동화 용이
- 링크 기반 구조 → 개념 간 상호참조를 자연스럽게 관리

반면 [RAG](../concepts/rag.md) 파이프라인은 별도의 벡터 DB 인프라가 필요하다.

## 관련 페이지

- [LLM Wiki](../concepts/llm-wiki.md) — Obsidian을 플랫폼으로 활용하는 지식 관리 방식
- [벡터 데이터베이스](../tech/ai/vector-database.md) — RAG에서 Obsidian 역할에 해당하는 인프라

## 출처

- RAG vs LLM Wiki: 지식 관리의 두 가지 접근법 — 2026-04-10
