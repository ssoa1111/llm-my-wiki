# Playwright E2E 테스트

> Chromium·Firefox·WebKit을 지원하는 E2E 테스트 프레임워크 — 설치부터 테스트 플로우 설계까지 실무 워크플로 가이드.

## 핵심 내용

### 설치

```bash
npm init playwright@latest
# 또는
pnpm create playwright
```

설치 시 선택 사항:
- TypeScript / JavaScript (기본: TypeScript)
- 테스트 폴더명 (기본: `tests`, 기존 `e2e` 폴더가 있으면 `tests` 권장)
- GitHub Actions 워크플로 추가 (CI 환경 권장)
- Playwright 브라우저 설치

### 기본 실행

```bash
pnpm exec playwright test          # 전체 테스트 실행
npx playwright show-report         # 결과 대시보드 열기 (통과/실패/건너뜀/불안정 필터)
```

---

### 테스트 플로우 설계 — 7단계 체크리스트

Claude에게 Playwright 테스트를 요청하기 전에 이 7가지를 먼저 정리하면 정확한 코드를 얻을 수 있다.

**1. 테스트할 기능**
```
"로그인 플로우 테스트하고 싶어"
"프로젝트 생성 플로우"
"업무 등록부터 완료까지"
```

**2. 시작 페이지**
```
"/auth/sign-in 페이지에서 시작"
"메인 페이지에서 시작해서 특정 메뉴 클릭"
"이미 로그인된 상태에서 시작"
```

**3. 사용자 행동 순서 (스텝별)**
```
1. 이메일 입력
2. 비밀번호 입력
3. 로그인 버튼 클릭
4. 대시보드로 이동 확인
```

**4. 입력할 데이터**
```
"이메일은 test@example.com, 비밀번호는 Test1234"
"프로젝트명은 '테스트프로젝트', 설명은 '테스트용'"
"드롭다운에서 '개발팀' 선택"
```

**5. 검증 항목**
```
"로그인 후 '환영합니다' 메시지가 보여야 함"
"프로젝트 목록에 추가된 항목이 보여야 함"
"변경된 정보가 DB와 일치하는지 확인"
"에러 메시지 '비밀번호가 틀렸습니다'가 표시되어야 함"
```

**6. 예외 케이스**
```
"잘못된 비밀번호 입력했을 때"
"필수 입력 안했을 때"
"중복된 이름 입력했을 때"
```

**7. 특별한 요구사항**
```
"실제 DB에 데이터 저장 안되게 해줘"       → mock/fixture 사용
"여러 번 실행해도 문제 없게 만들어줘"     → idempotent 설계
"드래그 앤 드롭이 있어"                    → dragAndDrop API
"파일 업로드가 필요해"                     → setInputFiles
```

---

### 테스트 코드 기본 구조

```typescript
import { test, expect } from '@playwright/test'

test('로그인 플로우', async ({ page }) => {
  await page.goto('/auth/sign-in')
  
  await page.fill('[data-testid="email"]', 'test@example.com')
  await page.fill('[data-testid="password"]', 'Test1234')
  await page.click('[data-testid="login-btn"]')
  
  await expect(page).toHaveURL('/dashboard')
  await expect(page.locator('text=환영합니다')).toBeVisible()
})
```

### DB 오염 방지 패턴

```typescript
test.beforeEach(async ({ request }) => {
  // API로 테스트 데이터 초기화
  await request.post('/api/test/reset')
})

test.afterEach(async ({ request }) => {
  await request.delete('/api/test/cleanup')
})
```

## 관련 페이지

- [개발 환경 에러 패턴](./dev-environment-errors.md) — 테스트 환경 CORS, 파일 잠금 이슈
- [REST API 규약](../backend/rest-api-conventions.md) — API 엔드포인트 설계 기준

## 출처

- Playwright 테스트 플로우 가이드 — 2026-04-15
