# LLM Wiki Core Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Obsidian 볼트에 CLAUDE.md 스키마와 wiki 폴더 구조를 만들어, Claude가 소스를 ingest하고 지식 위키를 자동 유지할 수 있게 한다.

**Architecture:** CLAUDE.md가 Claude의 행동을 정의하는 두뇌 역할을 하고, wiki/ 폴더가 Claude가 생성·유지하는 마크다운 페이지들을 담는다. sources/ 폴더는 원본 자료를 보관하며 Claude는 읽기만 한다.

**Tech Stack:** Markdown, Claude Code CLI

---

## File Map

| 파일 | 역할 | 상태 |
|------|------|------|
| `CLAUDE.md` | Claude 행동 규칙 스키마 (핵심) | 생성 |
| `wiki/index.md` | 전체 페이지 카탈로그 | 생성 |
| `wiki/log.md` | 활동 로그 (append-only) | 생성 |
| `wiki/concepts/` | 개념 페이지 폴더 | 생성 |
| `wiki/entities/` | 인물·도구 페이지 폴더 | 생성 |
| `wiki/books/` | 책·논문 요약 폴더 | 생성 |
| `wiki/tech/` | 기술 노트 폴더 | 생성 |
| `wiki/syntheses/` | 크로스토픽 분석 폴더 | 생성 |
| `sources/` | 원본 소스 보관 폴더 | 생성 |
| `sources/sample-article.md` | 테스트용 샘플 소스 | 생성 |

---

## Task 1: 폴더 구조 생성

**Files:**
- Create: `wiki/concepts/.gitkeep`
- Create: `wiki/entities/.gitkeep`
- Create: `wiki/books/.gitkeep`
- Create: `wiki/tech/.gitkeep`
- Create: `wiki/syntheses/.gitkeep`
- Create: `sources/.gitkeep`

- [ ] **Step 1: obsidian/ 폴더에서 터미널 열기**

```bash
cd C:/Users/etribe/Desktop/testspace/obsidian
```

- [ ] **Step 2: 폴더 구조 생성**

```bash
mkdir -p wiki/concepts wiki/entities wiki/books wiki/tech wiki/syntheses sources
```

- [ ] **Step 3: 폴더 구조 확인**

```bash
ls -R wiki/ sources/
```

Expected output:
```
sources/:

wiki/:
books  concepts  entities  syntheses  tech

wiki/books:

wiki/concepts:

wiki/entities:

wiki/syntheses:

wiki/tech:
```

---

## Task 2: CLAUDE.md 작성

**Files:**
- Create: `CLAUDE.md`

이 파일이 시스템의 두뇌다. Claude가 이 볼트에서 실행될 때 가장 먼저 읽는 파일.

- [ ] **Step 1: CLAUDE.md 파일 생성**

`C:/Users/etribe/Desktop/testspace/obsidian/CLAUDE.md` 에 다음 내용으로 파일 생성:

```markdown
# LLM Wiki — 운영 규칙

이 파일은 Claude가 이 Obsidian 볼트를 위키로 유지·관리하기 위한 규칙을 정의합니다.
**이 볼트에서 어떤 작업을 하든 이 파일을 먼저 읽고 규칙을 따르세요.**

---

## 위키 구조

| 폴더 | 담당 내용 |
|------|----------|
| `wiki/concepts/` | 개념, 이론, 알고리즘, 패턴, 프레임워크 |
| `wiki/entities/` | 인물, 도구, 라이브러리, 프로젝트, 회사 |
| `wiki/books/` | 책, 논문, 아티클 요약 |
| `wiki/tech/` | 기술 노트, 코드 패턴, 아키텍처 결정, 설정 |
| `wiki/syntheses/` | 여러 개념을 연결하는 비교 분석, 크로스토픽 인사이트 |

---

## 절대 규칙

1. `sources/` 폴더의 파일은 **절대 수정하지 말 것** (읽기 전용)
2. 링크는 항상 **표준 마크다운** 형식 사용: `[페이지명](../category/page.md)`
3. Obsidian `[[wikilink]]` 형식 **사용 금지** (GitHub 렌더링 깨짐)
4. 모든 ingest/query/lint 작업 후 `wiki/index.md`와 `wiki/log.md` 반드시 업데이트

---

## 페이지 형식

모든 wiki 페이지는 다음 형식을 따른다:

```markdown
# 페이지 제목

> 한 줄 요약 (이 개념이 무엇인지 한 문장으로)

## 핵심 내용

[본문 — 명확하고 밀도 있게 작성. 불필요한 서론 없이 바로 내용으로]

## 관련 페이지

- [관련 페이지 1](../category/page1.md) — 연관 이유 한 줄
- [관련 페이지 2](../category/page2.md) — 연관 이유 한 줄

## 출처

- [소스명](../../sources/filename.md) — YYYY-MM-DD
```

---

## Ingest 워크플로

**트리거**: 사용자가 파일 경로 또는 텍스트를 ingest 요청

반드시 이 순서로 실행:

1. **읽기**: 소스 전체를 읽고 핵심 takeaway 3-5개 식별
2. **분류**: 어떤 카테고리의 페이지가 필요한지 판단
3. **페이지 생성/업데이트** (목표: 10-15개):
   - 새 개념 등장 → `wiki/concepts/concept-name.md` 생성
   - 언급된 인물/도구/라이브러리 → `wiki/entities/name.md` 생성 또는 업데이트
   - 책/논문/아티클이면 → `wiki/books/title.md` 에 요약 생성
   - 기술적 내용이면 → `wiki/tech/topic.md` 에 노트 생성
   - 여러 개념이 연결되면 → `wiki/syntheses/topic.md` 에 분석 생성
4. **상호참조**: 새로 만들거나 수정한 페이지들을 서로 링크로 연결
5. **index 업데이트**: `wiki/index.md` 에 새 페이지 추가 (카테고리별)
6. **log 기록**: `wiki/log.md` 맨 아래에 다음 형식으로 추가:

```
[YYYY-MM-DD HH:MM] [INGEST] 소스명
  생성: page1.md, page2.md, page3.md
  업데이트: page4.md, page5.md
  핵심 takeaway: 한 줄 요약
```

---

## Query 워크플로

**트리거**: 사용자가 질문

1. `wiki/index.md` 읽기 → 관련 카테고리 파악
2. 관련 wiki 페이지들 읽기
3. 답변 합성 + 출처 인용 (어떤 wiki 페이지를 참조했는지 명시)
4. 분석이 충분히 가치 있으면 → `wiki/syntheses/` 에 새 페이지 저장 제안

---

## Lint 워크플로

**트리거**: 사용자가 "lint 해줘" 또는 "위키 점검해줘" 요청

1. 모든 wiki 페이지 순회
2. 다음 이슈 탐지 및 보고:
   - **모순**: 두 페이지가 서로 다른 사실 주장 → 두 페이지 모두 `⚠️ 모순: [상대 페이지]` 표시
   - **고아 페이지**: 어떤 페이지에서도 링크되지 않는 페이지 목록
   - **깨진 링크**: 존재하지 않는 파일을 참조하는 링크
   - **미싱 링크**: 언급은 됐지만 링크로 연결되지 않은 개념
3. 새로운 조사 방향 제안 (갭이 큰 주제)
4. `wiki/log.md` 에 lint 결과 기록:

```
[YYYY-MM-DD HH:MM] [LINT]
  이슈: N개 발견
  - 모순: ...
  - 고아 페이지: ...
  - 제안: ...
```
```

- [ ] **Step 2: 파일이 제대로 생성됐는지 확인**

```bash
cat CLAUDE.md | head -20
```

Expected: 파일 첫 20줄 출력됨

---

## Task 3: wiki/index.md 초기화

**Files:**
- Create: `wiki/index.md`

- [ ] **Step 1: wiki/index.md 생성**

`C:/Users/etribe/Desktop/testspace/obsidian/wiki/index.md` 에 다음 내용으로 파일 생성:

```markdown
# Wiki Index

> Claude가 자동 관리하는 지식 카탈로그. 수동 편집 금지.

**마지막 업데이트**: (미초기화)  
**총 페이지**: 0

---

## Concepts (0)

_아직 없음_

---

## Entities (0)

_아직 없음_

---

## Books (0)

_아직 없음_

---

## Tech (0)

_아직 없음_

---

## Syntheses (0)

_아직 없음_
```

---

## Task 4: wiki/log.md 초기화

**Files:**
- Create: `wiki/log.md`

- [ ] **Step 1: wiki/log.md 생성**

`C:/Users/etribe/Desktop/testspace/obsidian/wiki/log.md` 에 다음 내용으로 파일 생성:

```markdown
# Activity Log

> Claude가 자동으로 관리합니다. 수동 편집 금지.  
> 모든 ingest, query, lint 작업이 여기에 기록됩니다.

---

_아직 활동 없음_
```

---

## Task 5: 샘플 소스 생성 및 ingest 테스트

**Files:**
- Create: `sources/sample-rag-vs-wiki.md`

이 태스크는 시스템이 실제로 동작하는지 검증한다.

- [ ] **Step 1: 테스트용 샘플 소스 생성**

`C:/Users/etribe/Desktop/testspace/obsidian/sources/sample-rag-vs-wiki.md` 에 다음 내용으로 파일 생성:

```markdown
# RAG vs LLM Wiki: 지식 관리의 두 가지 접근법

## RAG (Retrieval-Augmented Generation)

RAG는 쿼리 시점에 원본 문서를 검색하여 LLM에 컨텍스트로 제공하는 방식이다.
벡터 데이터베이스에 문서를 임베딩으로 저장하고, 질문과 유사한 청크를 검색한다.

**장점**: 구현이 단순하고, 원본 문서를 그대로 보존한다.  
**단점**: 크로스 문서 연결이 없고, 지식이 축적되지 않는다.

## LLM Wiki

LLM이 소스를 읽고 직접 마크다운 위키 페이지를 작성·유지한다.
새 소스가 들어올 때마다 기존 페이지들을 업데이트하고 상호참조를 추가한다.

**장점**: 지식이 복리로 축적되고, 개념들이 서로 연결된다.  
**단점**: LLM이 실수할 수 있고, 초기 설정이 필요하다.

## 핵심 인물

- **Andrej Karpathy**: LLM Wiki 개념을 제안한 AI 연구자. 전 Tesla AI 디렉터, OpenAI 공동창업자.
- **Vannevar Bush**: 1945년 Memex 개념 제안. LLM Wiki의 역사적 선례.

## 관련 기술

- **벡터 데이터베이스**: Pinecone, Weaviate, Chroma 등. RAG의 핵심 인프라.
- **Obsidian**: 마크다운 기반 개인 지식 관리 도구. LLM Wiki의 이상적인 플랫폼.
```

- [ ] **Step 2: obsidian/ 폴더에서 claude 실행**

```bash
cd C:/Users/etribe/Desktop/testspace/obsidian
claude
```

- [ ] **Step 3: ingest 명령 입력**

Claude 프롬프트에 다음 입력:

```
sources/sample-rag-vs-wiki.md 파일을 ingest 해줘
```

- [ ] **Step 4: 결과 검증 — wiki 페이지 생성 확인**

Claude 작업 완료 후 다음 확인:

```bash
ls wiki/concepts/ wiki/entities/ wiki/books/ wiki/tech/ wiki/syntheses/
```

Expected: 적어도 5개 이상의 .md 파일이 생성됨  
예시:
```
wiki/concepts/:
rag.md  llm-wiki.md  vector-database.md

wiki/entities/:
andrej-karpathy.md  vannevar-bush.md  obsidian.md

wiki/tech/:
rag-implementation.md
```

- [ ] **Step 5: index.md 업데이트 확인**

```bash
cat wiki/index.md
```

Expected: 생성된 페이지들이 카테고리별로 목록에 있음. "총 페이지: 0" 이 아닌 실제 숫자로 업데이트됨.

- [ ] **Step 6: log.md 기록 확인**

```bash
cat wiki/log.md
```

Expected: `[INGEST]` 항목이 추가되고 생성된 페이지 목록이 기록됨.

- [ ] **Step 7: 생성된 페이지 하나 읽어보기**

```bash
cat wiki/entities/andrej-karpathy.md
```

Expected: 페이지 형식(요약, 핵심 내용, 관련 페이지, 출처)이 CLAUDE.md 규칙대로 작성됨.

- [ ] **Step 8: query 테스트**

Claude 프롬프트에 다음 입력:

```
RAG와 LLM Wiki의 차이점이 뭐야?
```

Expected: Claude가 wiki 페이지를 참조하여 답변하고, 어떤 페이지를 참조했는지 명시함.

---

## 완료 기준

- [ ] `CLAUDE.md` 존재하고 내용이 정상
- [ ] `wiki/` 5개 카테고리 폴더 존재
- [ ] `wiki/index.md`, `wiki/log.md` 초기화됨
- [ ] 샘플 소스 ingest 후 5개 이상 wiki 페이지 생성됨
- [ ] index.md에 생성된 페이지들이 반영됨
- [ ] log.md에 ingest 기록이 남겨짐
- [ ] query 테스트 시 Claude가 wiki를 참조하여 답변함
