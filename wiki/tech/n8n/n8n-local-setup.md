# n8n 로컬 셋팅 (Docker + Cloudflare Tunnel)

> Docker로 n8n을 로컬에서 실행하고, Cloudflare Tunnel로 외부 Webhook URL을 확보하는 방법.

## 핵심 내용

### 1. Docker로 n8n 설치 및 실행

```bash
# 1. Docker Desktop에서 n8n 이미지 검색 후 다운로드
#    (n8nio/n8n — 다운로드 수 가장 많은 것 선택)

# 2. 이미지 탭에서 n8n Run 클릭

# 3. 설정 작성
Ports: 5678  (호스트 포트 → 컨테이너 포트 5678)

# 4. Run 후 브라우저에서 접속
http://localhost:5678
```

---

### 2. Webhook을 위한 Cloudflare Tunnel 설정

**문제**: n8n을 로컬에서 실행하면 Webhook URL이 `localhost`라 외부(Slack, GitHub 등)에서 접근 불가.

**해결**: Cloudflare Tunnel로 외부 접근 가능한 임시 URL 생성 후, 이를 n8n 환경변수로 주입.

```bash
# Docker 컨테이너 생성 시 환경변수 추가
Environment Variables:
  WEBHOOK_URL=https://your-subdomain.trycloudflare.com
```

Cloudflare Tunnel 설치 및 실행:
```bash
# cloudflared 설치 (Windows)
winget install Cloudflare.cloudflared

# 임시 터널 생성 (계정 없이 사용 가능)
cloudflared tunnel --url http://localhost:5678
# → https://random-name.trycloudflare.com 같은 URL 발급
```

---

### 3. 아키텍처 흐름

```
외부 서비스 (Slack/GitHub/etc)
    ↓ HTTPS 요청
Cloudflare Tunnel
    ↓ 로컬로 포워딩
n8n 컨테이너 (port 5678)
```

---

### 로컬 vs 클라우드 Webhook URL 비교

| 상황 | Webhook URL | 외부 접근 |
|------|-------------|-----------|
| 로컬 기본 | http://localhost:5678/webhook/... | ❌ |
| Cloudflare Tunnel | https://xxx.trycloudflare.com/webhook/... | ✅ |
| 유료 호스팅 | https://your-n8n.com/webhook/... | ✅ |

---

### 무료 클라우드 호스팅 대안

n8n을 무료로 클라우드에서 호스팅하는 방법도 있다 (Render, Railway 등 사용).  
[유튜브 무료 호스팅 가이드](https://www.youtube.com/watch?v=kdt5J2bpchM) 참조.

## 관련 페이지

- [n8n Supabase 벡터 연동](./n8n-supabase-vector.md) — Supabase 연결 설정
- [n8n Chatbot 인가](./n8n-chatbot-auth.md) — Basic Auth + 프록시 패턴
- [Docker](../infra/docker.md) — 컨테이너 기본 개념
- [n8n](../../entities/n8n.md) — n8n 엔티티 개요

## 출처

- n8n 로컬 셋팅 — 2026-04-14
