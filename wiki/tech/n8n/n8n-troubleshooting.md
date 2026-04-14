# n8n 트러블슈팅 모음

> n8n 개발 중 자주 발생하는 오류와 해결 방법 — Brotli 압축, 봇 차단, Loop 문제, 환경변수 분기, 스트리밍 감지.

## 핵심 내용

### 1. Brotli 압축 오류 (n8n → Next.js)

**증상**: `SyntaxError: Unexpected non-whitespace character after JSON at position 153`

**원인**: n8n(Caddy 서버)이 응답을 Brotli(`br`)로 압축. Node.js fetch API는 Brotli 자동 해제를 지원하지 않음.

```
n8n 서버 (Caddy)
  ↓ content-encoding: br (Brotli 압축)
Next.js API Route fetch()
  ↓ 압축 해제 실패
SyntaxError: JSON 파싱 오류
```

**해결**: 요청 헤더에 `Accept-Encoding`을 명시해 Brotli 제외:

```typescript
// ❌ 헤더 없음 → 서버가 Brotli로 압축
fetch(n8nUrl, { method: 'POST', body: JSON.stringify(payload) })

// ✅ gzip/deflate만 허용
fetch(n8nUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept-Encoding': 'gzip, deflate'  // br 제외
  },
  body: JSON.stringify(payload)
})
```

| 압축 방식 | Node.js 지원 | 결과 |
|-----------|-------------|------|
| Brotli (br) | ❌ 불완전 | JSON 파싱 오류 |
| gzip | ✅ 완전 | 정상 동작 |
| deflate | ✅ 완전 | 정상 동작 |

---

### 2. 스트리밍 여부 판별

n8n 응답이 스트리밍인지 일반 응답인지 확인하는 방법:

```typescript
const contentType = response.headers.get('content-type');
const transferEncoding = response.headers.get('transfer-encoding');

const isStream =
  contentType?.includes('text/event-stream') ||  // SSE
  contentType?.includes('stream') ||
  transferEncoding === 'chunked' ||               // n8n은 이 방식
  response.body !== null;
```

| 헤더 | 값 | 스트리밍 여부 |
|------|----|---------------|
| Transfer-Encoding | chunked | ✅ 스트리밍 |
| Content-Type | text/event-stream | ✅ SSE |
| Content-Type | application/json | ❌ 일반 응답 |
| Content-Length | 숫자 | ❌ 일반 응답 |

---

### 3. Webhook 403 오류 — 봇 차단

**증상**: `POST /api/n8n-chat 403`

**원인**: n8n Webhook의 "Ignore Bots" 기능 활성화 시, User-Agent 없는 요청을 봇으로 차단.

**해결**: 요청 헤더에 브라우저 User-Agent 추가:

```typescript
headers: {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  'Authorization': `Basic ${auth}`
}
```

**봇으로 판별되는 User-Agent**:
- 없음 (null)
- `curl/7.68.0`, `wget/1.20.3`
- `python-requests/2.25.1`, `axios/0.27.2`
- `PostmanRuntime/7.29.0`, `node-fetch/2.6.7`

---

### 4. Webhook 401 오류 — 환경변수 분기 실수

**증상**: dev 배포에서 401 오류, 로컬에서는 정상

**원인**: `NODE_ENV`를 환경 분기에 사용 → Vercel에서는 모든 브랜치가 `NODE_ENV=production`

```typescript
// ❌ Vercel에서 브랜치 구분 불가
const urlPrefix = process.env.NODE_ENV === 'production' ? 'prd' : 'dev';
// dev 브랜치 배포 → NODE_ENV="production" → 'prd' 선택 (잘못됨!)

// ✅ VERCEL_ENV 사용
const urlPrefix = process.env.VERCEL_ENV === 'production' ? 'prd' : 'dev';
// dev 브랜치 배포 → VERCEL_ENV="preview" → 'dev' 선택 (정상!)
```

| 환경 | NODE_ENV | VERCEL_ENV |
|------|----------|------------|
| 로컬 (pnpm dev) | development | undefined |
| Vercel dev 브랜치 | production | preview |
| Vercel main 브랜치 | production | production |

---

### 5. Loop-in-Loop 내부 루프 미작동

**증상**: 외부 루프의 첫 번째 set에 대한 items만 내부 루프를 돌고, 이후 items는 내부 루프를 건너뜀.

**원인**: 외부 루프가 반복될 때 내부 루프의 상태가 초기화되지 않음.

**해결**: 외부/내부 루프 사이에 Code 노드 추가:

```javascript
// 외부 Loop와 내부 Loop 사이에 Code 노드
const innerLoopNode = '내부루프노드이름';
if ($node[innerLoopNode]?.clearContext) {
  await $node[innerLoopNode].clearContext();
}
return items;
```

내부 루프의 reset 옵션을 표현식으로 변경:
```javascript
{{ $prevNode.name === '이전코드노드이름(Code)' }}
```

> ⚠️ reset 옵션을 단순 활성화하면 무한루프 발생.

## 관련 페이지

- [n8n Chatbot 인가](./n8n-chatbot-auth.md) — Basic Auth + 프록시 패턴 상세
- [n8n 로컬 셋팅](./n8n-local-setup.md) — 로컬 환경 구성
- [n8n Supabase 벡터 연동](./n8n-supabase-vector.md) — RPC 호출 오류 처리
- [Next.js 환경변수 관리](../frontend/nextjs-env-vars.md) — NODE_ENV vs VERCEL_ENV

## 출처

- n8n chat stream — 2026-04-14
- n8n에서 webhook요청 시 403오류 — 2026-04-14
- n8n webhook진입 전 http401에러 — 2026-04-14
- n8n에서 LoopInLoop시 내부 Loop가 돌지 않는 문제 — 2026-04-14
