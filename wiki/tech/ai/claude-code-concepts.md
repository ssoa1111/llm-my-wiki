# Claude Code — Skill, Subagent, Command 개념

> Claude Code에서 md 파일로 만드는 세 가지 확장 단위의 역할과 차이

## 핵심 내용

Claude Code는 Subagent 인프라를 내장하고 있어, 사용자는 복잡한 인프라 구현 없이 **md 파일만 작성**하면 에이전트·명령어·가이드를 정의할 수 있다.

```
레스토랑 비유:
- 일반 구현: 주방·조리도구·레시피·서빙 시스템 모두 직접 구축
- Claude Code: 주방은 완비, 사용자는 레시피(md) 파일만 작성
```

### 세 가지 확장 단위

**1. Skill** (`.md`)
- **위치**: `/mnt/skills/user/your-skill/SKILL.md`
- **역할**: 가이드 문서 — 실행되지 않고 Main Claude가 참고만 함
- **용도**: "이런 상황에서 이렇게 해라" 참고용 (e.g., docx 파일 처리 베스트 프랙티스)
- 비유: **매뉴얼(📖)** — 읽기만 함

**2. Subagent** (`.md`)
- **위치**: `.claude/subagents/your-agent.md`
- **역할**: 독립 실행 에이전트 — 새 Claude 인스턴스 생성
- **용도**: 전문화된 작업을 독립적으로 처리 (e.g., 데이터베이스 전문가, 테스트 작성 전문가)
- 비유: **전문 직원(👤)** — 독립적 판단

**3. Command** (`.md`)
- **위치**: `.claude/commands/your-command.md`
- **역할**: 재사용 가능한 단축 명령어 — Main Claude가 실행
- **용도**: 자주 쓰는 작업을 명령어로 저장 (e.g., "fix-types" → TypeScript 타입 에러 자동 수정)
- 비유: **키보드 매크로(⌨️)** — 빠른 실행

### 비교 요약

| 구분 | Skill | Subagent | Command |
|------|-------|----------|---------|
| 실행 방식 | 참조만 | 독립 실행 | Main Claude 실행 |
| 새 인스턴스 | ❌ | ✅ | ❌ |
| 용도 | 가이드 | 전문 에이전트 | 단축 명령어 |

### 주요 CLI 명령어

```bash
claude -resume          # 이전 대화 가져오기 (외부에서)
/logout                 # 로그아웃 (내부에서)
/status                 # 로그인 상태 확인 (내부에서)
npx ccusage             # 사용량 확인
```

## 관련 페이지

- [오케스트레이터 아키텍처](./orchestrator-architecture.md) — Claude Code Subagent가 구현하는 패턴과 연관

## 출처

- Subagent, skill, command 차이 — 2026-04-14
- 클로드코드 명령어 정리 — 2026-04-14
