# n8n 구글 시트 연동 (Service Account)

> n8n에서 구글 시트를 연동하는 두 가지 방법 — 사용자 동의 없는 서비스 계정 방식 단계별 가이드.

## 핵심 내용

### 연동 방식 비교

| 방식 | 특징 | 단점 |
|------|------|------|
| **서비스 계정** | 로그인 동의 불필요, 서버-서버 인증 | JSON 키 관리 필요 |
| **OAuth2** | 사용자 권한 기반 | n8n 업데이트 시 Refresh Token 재발급 필요 |

> n8n 업데이트 시 OAuth2 방식은 Refresh Token이 무효화될 수 있어 서비스 계정 방식 권장.

---

### 서비스 계정 방식 단계별 설정

**1단계: Google Cloud Console에서 프로젝트 및 서비스 계정 생성**

```
https://console.cloud.google.com
→ IAM 및 관리자 > 서비스 계정
→ Create Service Account 클릭
→ 계정 이름, ID 입력 후 생성
```

**2단계: JSON 키 발급**

```
서비스 계정 클릭 > 키 탭 > 키 추가 > JSON 선택
→ 자동으로 key.json 다운로드
```

발급되는 JSON 형식:
```json
{
  "type": "service_account",
  "project_id": "my-project",
  "private_key_id": "a1b2c3...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "my-account@my-project.iam.gserviceaccount.com",
  "client_id": "123456789"
}
```

**3단계: n8n Credential 설정**

```
n8n > Credentials > New > Google Sheets
→ Credential Type: Service Account
→ 다운로드한 JSON 내용 붙여넣기
```

**4단계: 구글 시트에 서비스 계정 이메일 추가**

```
구글 시트 > 공유 버튼
→ 서비스 계정 이메일 추가 (client_email 값)
→ 권한: 편집자 또는 뷰어
```

---

### OAuth2 방식 (참고)

```
Google Cloud Console에서 OAuth2 Client ID/Secret 발급
→ n8n Credential에 Client ID + Secret 저장
→ "Sign in with Google" → 사용자 로그인 동의
→ Refresh Token 발급
→ 이후 자동으로 Access Token 재발급
```

---

### 구글 시트 노드 사용 예시

**시트에서 데이터 읽기**:
```
Google Sheets 노드
→ Operation: Read Rows
→ Spreadsheet ID: [시트 URL에서 추출]
→ Sheet Name: Sheet1
```

**데이터 추가**:
```
Google Sheets 노드
→ Operation: Append Row
→ Columns: { name: "{{ $json.name }}", email: "{{ $json.email }}" }
```

## 관련 페이지

- [n8n AI Agent 노드 설정](./n8n-ai-agent.md) — Get Contacts 도구로 시트 데이터 활용 예시
- [n8n Supabase 벡터 연동](./n8n-supabase-vector.md) — 다른 n8n 연동 방식
- [REST API 규약](../backend/rest-api-conventions.md) — API 인증 패턴
- [n8n](../../entities/n8n.md) — n8n 엔티티 개요

## 출처

- 구글시트 연동하기 — 2026-04-14
