# n8n Chatbot 인가 — Next.js 프록시 패턴

> n8n chat에 Basic Auth와 Supabase 사용자 토큰을 주입하는 Next.js 서버 프록시 패턴. 자격증명은 서버에서만 처리하고 클라이언트에 노출하지 않는다.

## 핵심 내용

### 핵심 원칙

- **n8n Basic Auth** 자격증명은 `NEXT_PUBLIC_` 접두사 없이 서버 환경변수에만 저장
- **클라이언트**는 우리 Next.js 프록시 URL만 호출
- 프록시에서 Basic Auth 헤더와 Supabase access_token을 주입해 n8n으로 전달

---

### 비밀번호 생성 (PowerShell)

n8n Basic Auth용 랜덤 비밀번호 생성 (최소 32바이트, base64url 권장):

```powershell
# PowerShell 7+
[Convert]::ToBase64String(
  [System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32)
).TrimEnd('=').Replace('+','-').Replace('/','_')
```

---

### 환경변수 설정

```bash
# .env.local (서버 전용, NEXT_PUBLIC_ 금지)
N8N_CHAT_URL=https://your-n8n.com/webhook/chat-trigger
N8N_BASIC_USER=your-username
N8N_BASIC_PASS=your-generated-password
```

---

### Next.js 서버 프록시

**n8n 인가만 필요한 경우**:

```ts
// app/api/n8n-chat/route.ts
export const runtime = 'nodejs';

export async function POST(req: Request) {
  const body = await req.json();

  const auth = Buffer
    .from(`${process.env.N8N_BASIC_USER}:${process.env.N8N_BASIC_PASS}`)
    .toString('base64');

  const res = await fetch(process.env.N8N_CHAT_URL!, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${auth}`,
      'Accept-Encoding': 'gzip, deflate',  // Brotli 압축 방지
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  return new Response(text, {
    status: res.status,
    headers: { 'Content-Type': res.headers.get('Content-Type') ?? 'application/json' },
  });
}
```

**Supabase 사용자 토큰까지 주입하는 경우** (채팅으로 개인 데이터 접근 시):

```ts
// app/api/n8n-chat/route.ts
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const body = await req.json();

  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();

  const payload = {
    ...body,
    metadata: {
      ...(body.metadata ?? {}),
      userId: session?.user.id ?? null,
      supabaseAccessToken: session?.access_token ?? null,
    },
  };

  const auth = Buffer.from(
    `${process.env.N8N_BASIC_USER}:${process.env.N8N_BASIC_PASS}`
  ).toString('base64');

  const r = await fetch(process.env.N8N_CHAT_URL!, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${auth}`,
      'Accept-Encoding': 'gzip, deflate',
    },
    body: JSON.stringify(payload),
  });

  const text = await r.text();
  return new Response(text, {
    status: r.status,
    headers: { 'Content-Type': r.headers.get('Content-Type') ?? 'application/json' },
  });
}
```

---

### 클라이언트 코드

```ts
// 클라이언트에서는 프록시 URL만 호출
createChat({
  webhookUrl: '/api/n8n-chat',
  webhookConfig: { method: 'POST' },
});
```

---

### Brotli 압축 문제

n8n(Caddy 리버스 프록시)은 응답을 기본적으로 Brotli(`content-encoding: br`)로 압축한다. Node.js fetch API는 Brotli 해제가 불완전해 JSON 파싱 오류가 발생할 수 있다.

**해결**: `Accept-Encoding: gzip, deflate`를 명시해 Brotli를 제외한다.

---

### Supabase RLS 적용

n8n이 주입된 access_token으로 Supabase를 호출할 때 RLS 정책이 적용된다:

```sql
-- 자신의 데이터만 접근 가능
CREATE POLICY "Own data only" ON user_data
  FOR SELECT USING (auth.uid() = user_id);
```

최소권한 원칙: service_role 키는 사용하지 않고 사용자 토큰 + anon 키 조합으로 RLS를 통해 데이터 접근을 제한한다.

## 관련 페이지

- [n8n](../../entities/n8n.md) — n8n 워크플로우 자동화 도구
- [Supabase — Next.js 연동](../backend/supabase-nextjs.md) — RLS, Server Component에서 Supabase 사용
- [JWT 인증 — Next.js 구현](../backend/jwt-auth-nextjs.md) — access_token 발급과 관리

## 출처

- chatbot에 인가 부여하기 — 2026-04-14
- n8n chat stream — 2026-04-14
