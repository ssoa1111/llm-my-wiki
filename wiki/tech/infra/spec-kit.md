# spec-kit — 의도 중심 개발(SDD) 도구

> GitHub이 2025년 9월 공개한 스펙 기반 AI 코딩 도구. 요구사항 누락과 반복 오류를 방지하기 위해 의도 중심 개발(SDD) 방법론을 체계화했다.

## 핵심 내용

### 등장 배경

AI 자동 코드 생성이 보편화되면서:
- 요구사항 누락 → 반복적인 버그 수정
- 무엇을 만들어야 하는지 불명확한 상태로 구현 시작

spec-kit은 **충실한 사양 작성 → AI 구현** 순서를 강제해 이 문제를 해결한다.

### 7단계 워크플로우

```
1. /speckit.constitution  규칙 작성  → 프로젝트 기본 원칙 (최초 1회)
2. /speckit.specify       기능 설명  → 비즈니스 요구사항 정리 (여러 md 생성)
3. /speckit.clarify       사양 검토  → 불명확한 부분 확인 + 방안 제시
4. /speckit.plan          기술 스택  → 기술 기반 구현 계획 수립
5. /speckit.tasks         작업 리스트 → Phase 형식으로 구현 항목 리스트업
6. /speckit.analyze       일관성 검증  → 2~5 내용 일관성 확인 (토큰 많이 사용)
7. /speckit.implement     구현       → Phase 순서대로 구현
```

**각 단계 상세**:

| 단계 | 입력 | 출력 | 특징 |
|------|------|------|------|
| constitution | 프로젝트 규칙 설명 | 규칙 문서 | 최초 1회, 변경 시 업데이트 |
| specify | 기능 설명 | 비즈니스 요구사항 md 파일들 | 경영진/PM 관점으로 작성 |
| clarify | 이전 사양 | 보완 방안 제시 | 반복 가능 |
| plan | 기술 스택 | 기술 구현 계획 | 사용자가 검토+수정 후 clarify 반복 |
| tasks | 전체 계획 | Phase별 Task 목록 | Phase 순서 중요 |
| analyze | 2~5 전체 | 일관성 보고서 + 개선 제안 | 토큰 많이 소모 (≈112K) |
| implement | tasks | 실제 코드 | 모든 작업 한 번에 X → Phase별 순차 권장 |

> **주의**: `/speckit.implement` 시 모든 작업을 한 번에 하면 버그 대응이 어려움 → **Phase 순으로 나눠서 실행** 권장

### 핵심 가치

- **의도 중심**: 무엇을(WHAT)을 만들지 먼저 명확히 → AI가 어떻게(HOW) 결정
- **충실한 사양**: 불명확한 요구사항을 clarify로 반복 정제
- **Claude Code와 조합**: plan.md + annotate 패턴과 시너지

## 관련 페이지

- [Claude Code 명령어 & 워크플로우](../ai/claude-code-commands.md) — 5단계 구현 패턴 (research → plan → annotate → implement → feedback)
- [Claude Code 개념](../ai/claude-code-concepts.md) — Skill/Subagent/Command 개념

## 출처

- spec-kit — 2026-04-14
- [GitHub spec-kit](https://github.com/github/spec-kit) — 원본 프로젝트
