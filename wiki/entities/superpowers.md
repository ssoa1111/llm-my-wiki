# Superpowers

> AI 코딩 에이전트가 단순 코드 생성기가 아닌 훈련된 소프트웨어 엔지니어처럼 체계적으로 개발하도록 만드는 오픈소스 플러그인

## 핵심 내용

Jesse가 제작한 오픈소스 프로젝트 (GitHub 30k★). Claude Code 플러그인 마켓플레이스를 통해 설치하며, AI에게 완전한 소프트웨어 개발 워크플로우를 부여하는 **스킬들의 모음**이다.

### 핵심 철학

| 원칙 | 설명 |
|---|---|
| **Test-Driven Development** | 테스트 먼저, 코드 나중 |
| **Systematic over Ad-hoc** | 추측 대신 체계적 프로세스 |
| **Complexity Reduction** | 단순함 최우선 |
| **Evidence over Claims** | 실제로 동작하는지 검증 후 완료 선언 |

---

### 설치 방법

```bash
# 1. 마켓플레이스 등록
/plugin marketplace add obra/superpowers-marketplace

# 2. 플러그인 설치
/plugin install superpowers@superpowers-marketplace

# 3. 업데이트
/plugin update superpowers
```

설치 후 `/help`에서 `/superpowers:brainstorm`, `/superpowers:write-plan`, `/superpowers:execute-plan` 등이 보이면 성공.

---

### 7단계 기본 워크플로우

```
1. Brainstorming       — 소크라테스식 질문으로 요구사항 정교화, 설계 검증
2. Git Worktree        — 독립된 작업 공간(새 브랜치) 생성, 깨끗한 테스트 기준선 확인
3. Writing Plans       — 2~5분 단위 작업으로 분해, 파일 경로·코드·검증 단계 포함
4. Subagent 실행       — 서브에이전트가 각 작업 병렬 처리 (또는 체크포인트 배치 실행)
5. TDD                 — RED(실패 테스트) → GREEN(최소 코드) → REFACTOR 사이클 강제
6. Code Review         — 계획 대비 구현 리뷰, 심각도별 보고 (치명적 이슈는 진행 차단)
7. Branch 마무리       — 테스트 검증 후 병합/PR/유지/폐기 옵션 제시, 워크트리 정리
```

---

### 스킬 라이브러리

**테스팅**
- `test-driven-development` — RED-GREEN-REFACTOR 강제, 테스트 안티패턴 포함

**디버깅**
- `systematic-debugging` — 4단계 근본 원인 분석
- `verification-before-completion` — 완료 전 실제 동작 검증

**협업 & 계획**
- `brainstorming` — 소크라테스식 디자인 정교화
- `writing-plans` — 상세 구현 계획 작성
- `executing-plans` — 체크포인트와 함께 배치 실행
- `dispatching-parallel-agents` — 서브에이전트 동시 실행 관리
- `requesting-code-review` — 사전 리뷰 체크리스트
- `receiving-code-review` — 피드백 대응 가이드
- `using-git-worktrees` — 병렬 개발 브랜치 관리
- `finishing-a-development-branch` — 병합/PR 결정 워크플로우
- `subagent-driven-development` — 사양 준수 + 코드 품질 2단계 리뷰

**메타**
- `writing-skills` — 새 스킬 생성 베스트 프랙티스
- `using-superpowers` — 스킬 시스템 소개

---

### 사용 적합성

**잘 맞는 경우**
- 여러 모듈·복잡한 의존성의 대규모 프로젝트
- 팀 협업 환경, 철저한 테스트·리뷰가 필요한 프로젝트
- 장기간 유지보수할 코드베이스

**과도한 경우**
- 빠른 프로토타이핑, 한 번 쓰고 마는 유틸리티
- 학습·연습용 개인 프로젝트
- 혼자 빠르게 개발할 때

## 관련 페이지

- [Claude Code 개념](../tech/ai/claude-code-concepts.md) — Skill/Subagent/Command 구조
- [Claude Skill 만들기 팁](../tech/ai/claude-skill-creation.md) — Superpowers와 같은 스킬 문서 작성법
- [Claude Code 명령어 & 워크플로우](../tech/ai/claude-code-commands.md) — Claude Code CLI 사용법

## 출처

- 💪⚡초보자를 위한 Superpowers 사용법 & Claude Code 코딩 자동화 가이드.md — 2026-04-17
