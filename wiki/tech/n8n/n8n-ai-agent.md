# n8n AI Agent 노드 설정

> AI Agent 노드에 System Message를 작성하고 Chat Trigger로 공개 챗봇을 만드는 방법 — 구글 캘린더 어시스턴트 예시 포함.

## 핵심 내용

### AI Agent System Message 설계 원칙

AI Agent 노드의 System Message는 에이전트의 역할과 도구 사용 순서를 명확하게 지정해야 한다.

**구글 캘린더 어시스턴트 예시**

```
너는 똑똑하고 유능한 어시스턴트야. 오늘 날짜는 {{ $now.format('yyyy-MM-dd') }}야.

🔹 1. 일정 처리 (Google Calendar)
- 사용자가 일정 관련 요청을 하면 아래 순서로 진행:
  1. "Get Contacts" 도구 → 시트에서 팀원 이메일 확인
  2. "Get Schedule" 도구 → 오늘/요청된 날짜의 일정 조회
  3. 일정 없으면 "Create Event" 도구로 새 일정 생성
  4. 기존 일정과 다른 요청이면 (일정 변경):
     - "Delete Event"로 기존 일정 삭제
     - "Create Event"로 새 일정 생성

🔹 2. 리마인더 이메일 처리
- 일정 추가/수정 후 반드시 묻기:
  "추가된 일정을 기반으로 리마인더 이메일을 보내드릴까요?"
- 긍정 답변 시: "Send Email" 도구로 발송, 일정 정보 요약 포함
- 부정 답변 시: 아무 작업 하지 않음

각 도구의 역할:
- Get Contacts: 팀원 이메일 확인
- Get Schedule: 구글 캘린더 조회
- Create Event: 새 일정 추가
- Delete Event: 기존 일정 삭제
- Send Email: 리마인더 이메일 발송

중요 원칙:
- 동의 없이 이메일 임의 발송 금지
- 일정 변경 시 반드시 Delete → Create 순서
```

---

### 시스템 메시지 작성 핵심 포인트

1. **현재 날짜 주입**: `{{ $now.format('yyyy-MM-dd') }}` — 날짜 관련 작업 정확성 향상
2. **도구 순서 명시**: "1→2→3 순서로 진행"처럼 순서를 숫자로 지정
3. **조건 분기 명확화**: "X이면 A, Y이면 B" 형식으로 케이스별 동작 정의
4. **사용자 동의 체크**: 중요 작업(이메일 발송) 전에 반드시 확인 절차 추가
5. **도구 역할 요약**: 마지막에 각 도구의 역할을 한 줄로 정리

---

### Chat Trigger → 공개 챗봇 만들기

n8n Chat Trigger를 외부에서 접근 가능한 챗봇으로 공개하는 방법:

```
chat receiver (트리거)
→ Make Chat Publicly Available 클릭
→ Mode: Hosted Chat 선택
→ Authentication: 방식 설정 (Basic Auth 등)
→ URL 복사
→ 워크플로우 상단 Active로 변경
→ URL 접속
```

---

### Chat Trigger에서 커스텀 헤더 사용 불가 — metadata 활용

Chat Trigger는 HTTP 커스텀 헤더를 워크플로우로 전달하지 않는다.  
대신 **`metadata`** 필드에 값을 담아 전달:

```javascript
// 프론트에서 요청
fetch('/api/n8n-chat', {
  method: 'POST',
  body: JSON.stringify({
    chatInput: '메시지',
    metadata: {
      userId: 'user-123',
      accessToken: 'supabase-token'
    }
  })
})

// n8n에서 사용
{{ $json.metadata.userId }}
{{ $json.metadata.accessToken }}
```

---

### Chat Trigger + Metadata 실전 패턴

| 전달 방법 | 지원 여부 | 예시 |
|-----------|-----------|------|
| HTTP 헤더 | ❌ 지원 안 함 | `Authorization: Bearer ...` |
| metadata 필드 | ✅ 지원 | `metadata.accessToken` |
| chatInput 앞에 텍스트 | ✅ (비추천) | `[token] 실제 메시지` |

## 관련 페이지

- [n8n Chatbot 인가](./n8n-chatbot-auth.md) — Basic Auth + Supabase 토큰 주입 프록시 패턴
- [n8n Supabase 벡터 연동](./n8n-supabase-vector.md) — AI Agent에서 벡터 검색 연동
- [오케스트레이터 아키텍처](../ai/orchestrator-architecture.md) — 멀티에이전트 설계
- [n8n](../../entities/n8n.md) — n8n 엔티티 개요

## 출처

- n8n 정보 조사 메모 — 2026-04-14
- n8n 이슈 정리 — 2026-04-14
