# Claude Code 명령어 & 워크플로우

> Claude Code CLI와 실전 개발 워크플로우 — 주요 명령어, 5단계 구현 패턴, 사용 팁.

## 핵심 내용

### 주요 명령어

**외부 CLI 명령어** (터미널에서 실행)

```bash
claude -resume          # 마지막 대화 이어서 시작
npx ccusage             # 토큰 사용량 확인 (claude-code-usage 패키지)
```

**내부 슬래시 명령어** (Claude Code 세션 내에서 실행)

```
/logout                 # 현재 계정 로그아웃
/status                 # 현재 세션 상태 확인 (모델, 사용량 등)
```

---

### 5단계 실전 구현 워크플로우

Claude Code로 기능을 구현할 때 품질과 일관성을 높이는 5단계 패턴.

```
1. Research   → 조사 결과를 research.md에 저장
2. Plan       → 구현 계획을 plan.md에 저장
3. Annotate   → plan.md 각 단계에 상세 주석 추가
4. Implement  → 주석 기반으로 단계별 구현
5. Feedback   → 결과 검토 & 개선점 반영
```

**왜 파일로 저장하는가?**
- 컨텍스트가 초기화되어도 계획이 유지됨
- 복잡한 작업에서 방향을 잃지 않음
- 단계별 진행 상황 추적 가능

**Annotate 단계 예시**

```markdown
## 구현 계획

### Step 1: DB 스키마 설계
<!-- 
  - users 테이블: id, email, created_at
  - posts 테이블: id, user_id (FK), title, content
  - RLS 정책: 본인 데이터만 접근
-->

### Step 2: API Route 구현
<!--
  - POST /api/posts → 인증 확인 → DB insert → 응답
  - 에러: 401(미인증), 400(유효성실패), 500(DB오류)
-->
```

---

### 효율적인 사용 팁

- **`claude -resume`**: 세션이 끊긴 후에도 이전 대화 맥락 유지
- **spec-kit**: 스펙 문서 작성 → Claude에게 넘기는 협업 패턴 (research/plan 단계를 미리 작성해두는 키트)
- **긴 작업**: plan.md에 체크박스(`- [ ]`) 형태로 작성 → 진행 상황 시각화

## 관련 페이지

- [Claude Code 개념](./claude-code-concepts.md) — Skill/Subagent/Command 차이
- [오케스트레이터 아키텍처](./orchestrator-architecture.md) — AI Agent 시스템 설계

## 출처

- 클로드코드 명령어 정리 — 2026-04-14
- 클로드코드 실전 바이브 — 2026-04-14
