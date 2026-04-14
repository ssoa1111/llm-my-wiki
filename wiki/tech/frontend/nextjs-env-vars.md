# Next.js 환경변수 관리

> NEXT_PUBLIC_ 접두사로 클라이언트 노출 여부를 제어하고, .env 파일 우선순위와 민감 정보 분류 기준.

## 핵심 내용

### NEXT_PUBLIC_ 접두사 규칙

```typescript
// 서버 컴포넌트 / API 라우트 — 둘 다 접근 가능
const dbUrl = process.env.DATABASE_URL;          // ✅
const apiUrl = process.env.NEXT_PUBLIC_API_URL;  // ✅

// 클라이언트 컴포넌트 — NEXT_PUBLIC_만 접근 가능
'use client'
console.log(process.env.DATABASE_URL);           // undefined ❌
console.log(process.env.NEXT_PUBLIC_API_URL);    // ✅
```

**원칙**: 서버에서만 사용하는 민감 정보(DB URL, API Secret, JWT Secret)는 절대 `NEXT_PUBLIC_` 금지.

---

### .env 파일 우선순위 (높은 순)

1. `.env.local` — 로컬 개발용, **Git에 절대 올리면 안 됨** (`.gitignore`에 추가)
2. `.env.development` / `.env.production` — 환경별
3. `.env` — 기본값, Git에 올려도 됨

```bash
# .env.local (Git 제외 — 민감 정보)
DATABASE_URL=postgresql://localhost:5432/mydb
NEXTAUTH_SECRET=generate-with-openssl

# .env (Git 포함 — 공개 가능)
NEXT_PUBLIC_APP_NAME=My App

# .env.development
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# .env.production
NEXT_PUBLIC_API_URL=https://api.myapp.com
```

---

### 환경변수 분류

**서버 전용 (비공개, NEXT_PUBLIC_ 금지)**
```bash
DATABASE_URL=postgresql://...
JWT_SECRET=your-super-secret-key-min-32-chars
OPENAI_API_KEY=sk-xxx
STRIPE_SECRET_KEY=sk_test_xxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxx
GOOGLE_CLIENT_SECRET=xxx
```

**클라이언트 공개 가능 (NEXT_PUBLIC_ 사용)**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_API_URL=https://api.myapp.com
```

---

### 환경 구분

```bash
NODE_ENV=development          # Next.js 자동 설정 (development | production | test)
NEXT_PUBLIC_ENV=local         # 커스텀 환경 구분 (local | dev | staging | production)
```

---

### 자주 쓰는 환경변수 목록

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx
SUPABASE_SERVICE_ROLE_KEY=eyJxxx   # 서버 전용

# OAuth
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxx
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=xxx

# 이메일
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=email@gmail.com
SMTP_PASS=app-password

# AWS S3
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
AWS_REGION=ap-northeast-2
S3_BUCKET_NAME=my-bucket
```

## 관련 페이지

- [JWT 인증 — Next.js 구현](../backend/jwt-auth-nextjs.md) — JWT_SECRET 등 인증 환경변수
- [Supabase — Next.js 연동](../backend/supabase-nextjs.md) — Supabase 환경변수 설정
- [Next.js 캐싱 전략](./nextjs-caching.md) — Next.js 앱 설정 패턴

## 출처

- 환경변수 — 2026-04-14
