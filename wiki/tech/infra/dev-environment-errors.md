# 개발 환경 에러 패턴

> CORS, EPERM 등 로컬 개발 환경에서 자주 만나는 에러와 빠른 해결법.

## 핵심 내용

### 1. CORS 에러 — file:// 에서 fetch 불가

**증상**: 빌드된 HTML 파일을 직접 열면 fetch/CSV 로드 시 CORS 오류

**원인**: 브라우저에서 `file://` 프로토콜로 파일을 열면 HTTP가 아니므로 fetch 차단. `<script type="module">`도 동일한 이유로 차단.

```
file://path/to/index.html
  → fetch('./data.csv')  ← CORS 오류
  → <script type="module">  ← 차단
```

**해결**: 런타임 fetch 대신 빌드타임에 데이터를 JS 변수로 인라인화

```javascript
// Gulp 빌드 스크립트에서 실행 (Node.js, CORS 없음)
const csv = fs.readFileSync('cl.csv', 'utf-8')
const json = parseCSV(csv)
fs.writeFileSync('inline-data.js', `window.DATA = ${JSON.stringify(json)};`)

// HTML에서 fetch 대신
<script src="inline-data.js"></script>  <!-- window.DATA 로드 -->
<script src="main.js"></script>          <!-- window.DATA 사용 -->
```

| | 기존 방식 | 새 방식 |
|---|-----------|---------|
| 데이터 읽는 시점 | 브라우저 실행 시 (런타임) | gulp build 시 (빌드타임) |
| 읽는 주체 | 브라우저 (CORS 제약) | Node.js (CORS 없음) |
| file:// 대응 | ❌ CORS 오류 | ✅ 이미 변수에 있음 |

> **교훈**: 정적 데이터는 fetch로 불러올 필요 없음 — 빌드타임에 변수로 변환하면 CORS 걱정 없음

---

### 2. EPERM — 파일 잠금으로 서버 시작 불가

**증상**: `pnpm dev` 실행 시 `Starting...` 이후 멈춤, 페이지 로딩 안 됨

**에러 메시지**:
```
Error: EPERM: operation not permitted, open '경로\.next\trace'
  code: 'EPERM',
  syscall: 'open',
  path: '경로\\.next\\trace'
```

**원인**: Windows에서 여러 IDE(VSCode + Windsurf 등)를 동시에 사용하다가 Node.js 프로세스가 30개 이상 남아 포트와 `.next` 폴더를 잠금

**해결**:

```powershell
# 1. 남아있는 Node 프로세스 확인
Get-Process -Name node

# 2. 강제 종료 (PowerShell)
Stop-Process -Name node -Force

# 3. (필요시) .next 폴더 삭제
Remove-Item -LiteralPath ".next" -Recurse -Force -Verbose
```

> **예방**: IDE를 전환할 때 이전 IDE의 터미널 서버를 먼저 완전히 종료하고 전환

## 관련 페이지

- [Docker](./docker.md) — 로컬 개발 환경 컨테이너화로 프로세스 충돌 방지
- [n8n 트러블슈팅](../n8n/n8n-troubleshooting.md) — 개발 환경 에러 패턴
- [Playwright E2E 테스트](./playwright.md) — 테스트 환경 CORS, DB 오염 방지 패턴

## 출처

- build파일에서 html 열었을 때 csv fetch cors 오류 — 2026-04-14
- EPERM - operation not permitted — 2026-04-14
