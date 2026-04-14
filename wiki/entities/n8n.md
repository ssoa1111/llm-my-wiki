# n8n

> 노드 기반 no-code/low-code 워크플로우 자동화 도구. 코드 없이 AI 에이전트, API 연동, 데이터 파이프라인을 구축할 수 있다.

## 핵심 내용

n8n은 시각적 플로우 편집기로 각종 서비스(Google Calendar, Sheets, Supabase, webhook 등)를 연결하는 자동화 워크플로우를 만드는 도구다. 셀프호스팅이 가능하고 오픈소스다.

**주요 기능**:
- **AI Agent 노드**: LLM(GPT, Claude 등)에 시스템 프롬프트와 도구를 연결해 에이전트 구성
- **Webhook 트리거**: 외부 HTTP 요청으로 워크플로우 시작
- **Google 연동**: Calendar, Sheets, Gmail 등
- **Supabase 연동**: DB 조회, 벡터 검색
- **이미지 처리**: TinyPNG 등으로 이미지 압축 자동화
- **Chat UI**: Make Chat Publicly Available 옵션으로 웹 챗봇 호스팅

**AI Agent 구성 예시**:
```
AI Agent 노드 시스템 프롬프트에 역할 정의
 → 도구 등록: Get Contacts, Get Schedule, Create Event, Send Email 등
 → 사용자 요청 → LLM이 도구를 순서대로 호출
```

**설정 방법**:
- 로컬 셋팅: Docker로 실행 후 localhost:5678 접속
- Supabase 벡터 검색 연동 가능 (pgvector)
- 챗봇 공개: chat receiver → Make Chat Publicly Available → Hosted Chat → URL 복사 → Active 활성화

**주요 이슈 패턴**:
- webhook 403 오류: 인증 설정 미스
- HTTP 401 오류: webhook 진입 전 인증 헤더 누락
- LoopInLoop 시 내부 루프가 돌지 않는 문제: 상태 관리 주의 필요

## 관련 페이지

- [n8n AI Agent 노드 설정](../tech/n8n/n8n-ai-agent.md) — System Message 설계, Chat Trigger 공개 설정
- [n8n 로컬 셋팅](../tech/n8n/n8n-local-setup.md) — Docker + Cloudflare Tunnel 설치
- [n8n Supabase 벡터 연동](../tech/n8n/n8n-supabase-vector.md) — pgvector 테이블 설계, RPC 호출
- [n8n 이미지 생성 워크플로](../tech/n8n/n8n-image-generation.md) — OpenAI / Gemini 이미지 생성
- [n8n 구글 시트 연동](../tech/n8n/n8n-google-sheets.md) — Service Account 방식 연동
- [n8n 이미지 압축](../tech/n8n/n8n-image-compress.md) — TinyPNG API 연동
- [n8n 트러블슈팅](../tech/n8n/n8n-troubleshooting.md) — Brotli 오류, 봇 차단, Loop 문제
- [n8n GA4 데이터 분석](../tech/n8n/n8n-ga4-analysis.md) — GA4 dimensions/metrics 중요도 분류
- [n8n Chatbot 인가](../tech/n8n/n8n-chatbot-auth.md) — Basic Auth + Supabase 토큰 주입 프록시
- [오케스트레이터 아키텍처](../tech/ai/orchestrator-architecture.md) — n8n의 AI Agent 노드가 구현하는 패턴
- [RAG](../concepts/rag.md) — n8n + Supabase로 RAG 파이프라인 구성 가능
- [벡터 데이터베이스](../tech/ai/vector-database.md) — n8n에서 Supabase pgvector 활용

## 출처

- n8n 정보 조사 메모 — 2026-04-14
