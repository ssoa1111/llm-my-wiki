# LLM Wiki — 운영 규칙

이 파일은 Claude가 이 Obsidian 볼트를 위키로 유지·관리하기 위한 규칙을 정의합니다.
**이 볼트에서 어떤 작업을 하든 이 파일을 먼저 읽고 규칙을 따르세요.**

---

## 위키 구조

| 폴더                  | 담당 내용                                           |
| --------------------- | --------------------------------------------------- |
| `wiki/concepts/`      | 개념, 이론, 알고리즘, 패턴, 프레임워크              |
| `wiki/entities/`      | 인물, 도구, 라이브러리, 프로젝트, 회사              |
| `wiki/books/`         | 책, 논문, 아티클 요약                               |
| `wiki/tech/n8n/`      | n8n 워크플로우, 노드 설정, 연동 패턴                |
| `wiki/tech/ai/`       | LLM, RAG, 임베딩, LangGraph, MCP, Claude            |
| `wiki/tech/frontend/` | React, Next.js, 상태관리, 렌더링, 성능              |
| `wiki/tech/backend/`  | API, DB, SQL, 인증, 보안, 결제                      |
| `wiki/tech/infra/`    | Docker, Git, 모노레포, 개발환경                     |
| `wiki/tech/` (루트)   | CS 기초, TypeScript 등 범용 기술 개념               |
| `wiki/syntheses/`     | 여러 개념을 연결하는 비교 분석, 크로스토픽 인사이트 |

---

## 절대 규칙

1. 소스 파일(구글 드라이브 원본)은 **절대 수정하지 말 것** — wiki 페이지만 편집
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

- 소스명 (구글 드라이브 원본 파일명) — YYYY-MM-DD
```

---

## 증분 Ingest 워크플로 (권장)

**트리거**: 사용자가 "CHANGES.md 보고 ingest 해줘" 요청

1. `sources/CHANGES.md` 읽기 → 추가/수정/삭제된 파일 목록 확인
2. **추가/수정된 파일만** ingest (아래 Ingest 워크플로 적용)
3. **삭제된 파일**이 있으면 → 아래 삭제 처리 규칙 적용
4. 완료 후 `sources/CHANGES.md` 삭제

### 삭제 처리 규칙

삭제된 소스 파일명으로 wiki 전체를 검색해서 해당 파일을 출처로 참조하는 페이지를 찾는다.

**출처가 여러 개인 페이지** → 해당 출처 항목만 `## 출처`에서 제거. 페이지는 유지.

**출처가 하나뿐인 페이지** → 다음 기준으로 판단:

- 페이지 내용이 다른 wiki 페이지에서 이미 링크되거나 참조되고 있으면 → 페이지 유지, 출처만 제거
- 어디서도 참조되지 않는 고아 페이지면 → 페이지 삭제 + `wiki/index.md`에서 항목 제거

> 변경되지 않은 파일은 절대 재처리하지 말 것 — 시간 낭비이고 wiki가 오염됨

---

## Ingest 워크플로

**트리거**: 사용자가 파일 경로 또는 텍스트를 ingest 요청

반드시 이 순서로 실행:

1. **읽기**: 소스 전체를 읽고 핵심 takeaway 3-5개 식별
   > ⚠️ **보안 체크**: API 키, 비밀번호, 토큰처럼 보이는 문자열이 있으면 즉시 중단하고 사용자에게 알릴 것. 해당 파일은 ingest하지 말 것. (패턴: `sk-`, `Bearer `, `-----BEGIN`, 40자 이상 랜덤 문자열 등)
2. **분류**: 어떤 카테고리의 페이지가 필요한지 판단
3. **페이지 생성/업데이트** (목표: 10-15개):
   - 새 개념 등장 → `wiki/concepts/concept-name.md` 생성
   - 언급된 인물/도구/라이브러리 → `wiki/entities/name.md` 생성 또는 업데이트
   - 책/논문/아티클이면 → `wiki/books/title.md` 에 요약 생성
   - 기술적 내용이면 → 아래 기준으로 서브폴더 선택:
     - n8n 관련 → `wiki/tech/n8n/topic.md`
     - LLM/AI/RAG/MCP 관련 → `wiki/tech/ai/topic.md`
     - React/Next.js/프론트엔드 → `wiki/tech/frontend/topic.md`
     - API/DB/인증/보안/결제 → `wiki/tech/backend/topic.md`
     - Docker/Git/인프라/개발환경 → `wiki/tech/infra/topic.md`
     - CS 기초, TypeScript 등 범용 → `wiki/tech/topic.md`
   - 여러 개념이 연결되면 → `wiki/syntheses/topic.md` 에 분석 생성
     > **기존 페이지 업데이트 시**: 기존 내용을 보존하고 새 정보를 추가하거나 수정할 것. 기존 내용을 삭제하지 말 것.
4. **상호참조**: 새로 만들거나 수정한 페이지들을 서로 링크로 연결
5. **index 업데이트**: `wiki/index.md` 에 새 페이지를 카테고리별로 다음 형식으로 추가:
   `- [페이지 제목](category/filename.md) — 한 줄 요약`
   예시: `- [RAG](concepts/rag.md) — 검색 기반 지식 증강 방식`
   카운트도 업데이트: `## Concepts (2)` 형식으로
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
4. 답변이 3개 이상의 wiki 페이지를 연결하면 → `wiki/syntheses/` 에 새 크로스토픽 페이지 생성
5. **log 기록**: `wiki/log.md` 맨 아래에 다음 형식으로 추가:

```
[YYYY-MM-DD HH:MM] [QUERY] 질문 요약 한 줄
  참조 페이지: page1.md, page2.md
  답변 저장: syntheses/topic.md (저장한 경우만)
```

---

## Lint 워크플로

**트리거**: 사용자가 "lint 해줘" 또는 "위키 점검해줘" 요청

1. 모든 wiki 페이지 순회
2. 다음 이슈 탐지 및 보고:
   - **모순**: 두 페이지가 서로 다른 사실 주장 → 두 페이지 모두 한 줄 요약(blockquote) 바로 아래에 다음 줄 삽입: `⚠️ 모순: [상대 페이지 링크] 참조`
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
  - 깨진 링크: ...
  수정된 페이지: page1.md, page2.md (모순 태그 추가 등)
  - 제안: ...
```

/test
