# n8n 프로덕션 AI 워크플로 통합 가이드

> Docker + Cloudflare Tunnel로 로컬 n8n을 외부에 노출하고, AI Agent·Supabase 벡터 검색·챗봇 인증·이미지 처리·Google Sheets 자동화를 조합해 프로덕션 수준의 AI 파이프라인을 구성하는 통합 가이드.

## 핵심 내용

### 단계 1: 환경 설정 — Docker + Cloudflare Tunnel

모든 워크플로의 기반. n8n을 로컬에서 실행하면서 외부 Webhook을 받을 수 있도록 한다.

```
Docker (n8n, port 5678)
  ↑ WEBHOOK_URL 환경변수 주입
Cloudflare Tunnel (cloudflared)
  ← 외부 서비스 (Slack, GitHub, 프론트엔드 등)
```

**핵심 설정**:
- Docker 컨테이너 실행 시 `WEBHOOK_URL=https://your-subdomain.trycloudflare.com` 환경변수 주입
- `cloudflared tunnel --url http://localhost:5678` 로 임시 외부 URL 발급 (계정 불필요)
- 유료 호스팅으로 전환 시 이 환경변수만 교체하면 됨

**언제 Cloudflare Tunnel을 쓰는가**: 로컬 개발 단계에서 Slack·GitHub 등 외부 서비스가 Webhook을 보내야 할 때. 프로덕션에서는 Render·Railway 등 클라우드 호스팅으로 대체.

---

### 단계 2: AI Agent 설계 — System Message 원칙

환경이 준비됐다면 핵심 로직인 AI Agent 노드를 설계한다.

**System Message 5가지 원칙**:
1. **현재 날짜 주입** — `{{ $now.format('yyyy-MM-dd') }}` 포함 (날짜 관련 작업 정확성)
2. **도구 실행 순서 숫자로 명시** — "1→2→3 순서로 진행" 형태로 에이전트 행동 제어
3. **조건 분기 명확화** — "X이면 A, Y이면 B" 케이스별 동작 정의
4. **사용자 동의 체크** — 이메일 발송 등 중요 작업은 반드시 확인 절차 추가
5. **도구 역할 요약** — 마지막에 각 도구의 역할을 한 줄로 정리

**Chat Trigger에서 커스텀 헤더 전달 불가 문제**:
Chat Trigger는 HTTP 커스텀 헤더를 워크플로우로 전달하지 않는다. 대신 `metadata` 필드에 값을 담아 전달해야 한다.

```javascript
// 프론트엔드 요청 시
{
  chatInput: '메시지',
  metadata: { userId: 'user-123', accessToken: 'supabase-token' }
}

// n8n 워크플로우 내에서 접근
{{ $json.metadata.userId }}
```

---

### 단계 3: Supabase 벡터 검색 연동

AI Agent가 RAG를 수행하려면 Supabase pgvector 연동이 필요하다.

**테이블 설계 선택 기준**:

| 상황 | 권장 방식 |
|------|-----------|
| 단일 도메인 데이터 | 각 테이블에 `vector` 컬럼 추가 (방식 A) |
| 여러 테이블 통합 검색 필요 | 벡터 전용 `embeddings` 테이블 (방식 B) |

방식 A(각 테이블에 vector 컬럼)가 기본값으로 권장됨 — 조인 불필요, RLS 그대로 적용, 인덱스 효율적.

**실시간 벡터 업데이트 파이프라인**:
```
Supabase 데이터 변경 (INSERT/UPDATE)
  → pg_net으로 n8n Webhook 트리거
  → 임베딩 생성 (OpenAI 등)
  → Supabase에 vector 컬럼 업데이트
```

**유사도 낮을 때 점검 순서**:
1. 임베딩 텍스트에 ID·숫자 노이즈 있는지 확인 → `search_text` 전용 컬럼 분리
2. 저장 모델과 질의 모델이 동일한지 확인
3. 집계 질문이면 metadata filter + 벡터 하이브리드 전략으로 전환
4. topK 확대 후 유사도 가중 평균 적용

**n8n RPC 호출 시 흔한 오류**:
- `invalid json` → JSON 키 쌍따옴표 확인, embedding 이중 배열 방지
- 함수 못 찾음 → `NOTIFY pgrst, 'reload schema';` 실행, `GRANT EXECUTE` 권한 부여

---

### 단계 4: 챗봇 인증 — Next.js 프록시 패턴

n8n Chat Trigger에 Basic Auth를 설정했을 때, 클라이언트에 자격증명을 노출하지 않는 방법.

**핵심 원칙**:
- `NEXT_PUBLIC_` 접두사 없이 서버 환경변수에만 n8n Basic Auth 자격증명 저장
- 클라이언트는 우리 Next.js 프록시(`/api/n8n-chat`)만 호출
- 프록시에서 Basic Auth 헤더 + Supabase access_token 주입

**프록시 선택 기준**:

| 상황 | 패턴 |
|------|------|
| n8n 인가만 필요 | Basic Auth 헤더만 주입 |
| 개인 데이터 접근 필요 | Basic Auth + Supabase access_token 함께 주입 |

**Brotli 압축 문제**: n8n(Caddy 리버스 프록시)은 기본적으로 Brotli 응답을 반환하는데, Node.js fetch는 Brotli 해제가 불완전하다. `Accept-Encoding: gzip, deflate`를 명시해 Brotli를 제외한다.

**Supabase RLS 적용**: 주입된 access_token으로 Supabase를 호출하면 RLS 정책이 적용되어 사용자별 데이터 격리 가능. service_role 키 대신 사용자 토큰 + anon 키 조합 사용.

---

### 단계 5: 이미지 처리 파이프라인 — 압축 → 생성

이미지를 다루는 워크플로는 **압축(전처리) → 생성** 순서로 구성하면 비용을 크게 절감할 수 있다.

**압축 단계 (TinyPNG API)**:
```
이미지 (binary)
  → HTTP POST https://api.tinify.com/shrink   ← Basic Auth (username 비워두고 password=API키)
  → 응답에서 output.url 추출
  → HTTP GET {output.url}  ← Response Format: File
  → 압축된 binary 이미지 (평균 60-70% 용량 감소)
```

월 500회 무료. AI에 전달하기 전 반드시 압축을 거치면 토큰 비용이 크게 줄어든다.

**이미지 생성 모델 선택 기준**:

| 상황 | 권장 모델 | 이미지 전달 방식 |
|------|-----------|-----------------|
| 프롬프트 정밀 반영 필요 | OpenAI `gpt-image-1` | binary (multipart/form-data) |
| 저비용 실험 | Gemini 2.0 flash | base64 (JSON, Extract from File 노드 필요) |
| 고품질 (비용 감수) | Gemini 2.5 flash | base64 (~$5/이미지) |

**n8n 노드 차이점**: OpenAI는 Content-Type을 `multipart/form-data`로 설정하고 image 파라미터를 n8n binary file로 지정. Gemini는 `Extract from File` 노드로 binary를 base64로 변환한 뒤 JSON body에 `inline_data`로 포함.

---

### 단계 6: Google Sheets 자동화

n8n AI Agent의 "Get Contacts" 도구처럼 시트를 데이터 소스로 쓰거나, 결과를 시트에 저장할 때 사용.

**연동 방식 선택 기준**:

| 상황 | 권장 방식 |
|------|-----------|
| 자동화 파이프라인, 서버-서버 | 서비스 계정 방식 |
| n8n 업데이트가 잦은 환경 | 서비스 계정 방식 (OAuth2는 Refresh Token 재발급 필요) |
| 사용자 본인 시트 접근 | OAuth2 방식 |

**서비스 계정 설정 핵심**: Google Cloud Console에서 서비스 계정 생성 → JSON 키 발급 → n8n Credential에 붙여넣기 → 구글 시트 공유에 `client_email` 추가.

---

### 프로덕션 AI 파이프라인 조합 패턴

위 단계들을 조합한 실전 파이프라인 예시:

**RAG 챗봇 파이프라인**:
```
Next.js 클라이언트
  → /api/n8n-chat 프록시 (Basic Auth + Supabase token 주입)
  → n8n Chat Trigger
  → AI Agent (System Message: 도구 순서 명시)
     → Supabase 벡터 검색 도구 (pgvector + metadata filter)
     → Google Sheets 도구 (연락처/데이터 조회)
  → 응답 반환
```

**이미지 처리 + AI 생성 파이프라인**:
```
Form Trigger (이미지 업로드)
  → HTTP Request (TinyPNG 압축, 60-70% 용량 감소)
  → HTTP Request (OpenAI gpt-image-1 또는 Gemini)
  → Code 노드 (base64 → HTML img 태그 변환)
  → Respond to Webhook
```

**데이터 변경 → 벡터 자동 업데이트 파이프라인**:
```
Supabase DB 변경
  → pg_net → n8n Webhook
  → 임베딩 생성 (OpenAI Embeddings)
  → Supabase UPDATE (vector 컬럼 업데이트)
```

---

### 워크플로 구성 시 공통 주의사항

1. **환경변수 분리**: API 키·Basic Auth 자격증명은 모두 n8n 환경변수 또는 Credential로 관리, 하드코딩 금지
2. **Chat Trigger 제약**: 커스텀 HTTP 헤더 전달 불가 → metadata 필드 활용
3. **Brotli 압축**: n8n 응답을 Node.js fetch로 받을 때 `Accept-Encoding: gzip, deflate` 명시
4. **벡터 검색 함수**: JSON 키와 PostgreSQL 함수 파라미터명 반드시 일치, 스키마 리로드 확인
5. **이미지 AI 비용**: Gemini 2.5 flash는 이미지 크기 비례 과금 (~$5/이미지) → TinyPNG 압축 선행 필수
6. **Google Sheets 인증**: n8n 업데이트 환경에서는 OAuth2 대신 서비스 계정 방식 사용

## 관련 페이지

- [n8n 로컬 셋팅](../tech/n8n/n8n-local-setup.md) — Docker + Cloudflare Tunnel 환경 설정
- [n8n AI Agent 노드 설정](../tech/n8n/n8n-ai-agent.md) — System Message 설계 및 Chat Trigger 공개
- [n8n Supabase 벡터 연동](../tech/n8n/n8n-supabase-vector.md) — pgvector 테이블 설계 및 RPC 호출
- [n8n Chatbot 인가](../tech/n8n/n8n-chatbot-auth.md) — Next.js 서버 프록시 + Basic Auth 패턴
- [n8n 이미지 압축](../tech/n8n/n8n-image-compress.md) — TinyPNG API 전처리
- [n8n 이미지 생성 워크플로](../tech/n8n/n8n-image-generation.md) — OpenAI gpt-image-1 / Gemini 이미지 생성
- [n8n 구글 시트 연동](../tech/n8n/n8n-google-sheets.md) — 서비스 계정 방식 설정

## 출처

- n8n 로컬 셋팅 — 2026-04-15
- n8n와 supabase 연결 — 2026-04-15
- chatbot에 인가 부여하기 — 2026-04-15
- n8n 정보 조사 메모 — 2026-04-15
- 이미지 압축하기 with.pinyPNG — 2026-04-15
- 샘플이미지+프롬프트로 이미지 생성하기 — 2026-04-15
- 구글시트 연동하기 — 2026-04-15
