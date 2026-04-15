# Garage

Obsidian 노트를 Claude가 자동으로 위키로 변환·관리하는 개인 지식 베이스.  
Google Drive → 마크다운 위키 → React 뷰어 → GitHub Pages 배포까지 자동화된 파이프라인.

**라이브**: [ssoa1111.github.io/llm-my-wiki](https://ssoa1111.github.io/llm-my-wiki/)

---

## 개요

직접 글을 쓰는 대신, Obsidian에서 작성한 노트를 Claude에게 넘기면 위키 페이지로 가공·분류·상호참조해준다.

```
Google Drive (Obsidian 노트)
    ↓  sync-from-drive.ps1 (변경 감지)
CHANGES.md
    ↓  Claude ingest (자동 분류 및 요약)
wiki/**/*.md (구조화된 위키 페이지)
    ↓  Vite + React 빌드
GitHub Pages (정적 사이트)
```

## 기술 스택

| 역할            | 기술                                         |
| --------------- | -------------------------------------------- |
| 프론트엔드      | React 18, React Router v6                    |
| 마크다운 렌더링 | react-markdown, remark-gfm, rehype-highlight |
| 지식 그래프     | D3.js                                        |
| 코드 하이라이팅 | highlight.js (자동 언어 감지)                |
| 빌드            | Vite                                         |
| 배포            | GitHub Pages (GitHub Actions)                |
| 동기화 스크립트 | PowerShell 5                                 |

## 프로젝트 구조

```
├── wiki/                   # 위키 마크다운 페이지
│   ├── concepts/           # 개념, 이론, 알고리즘, 패턴
│   ├── entities/           # 인물, 도구, 라이브러리
│   ├── books/              # 책·논문 요약
│   ├── tech/
│   │   ├── ai/             # LLM, RAG, 임베딩, MCP
│   │   ├── frontend/       # React, Next.js, 상태관리
│   │   ├── backend/        # API, DB, 인증, 보안
│   │   ├── infra/          # Docker, Git, 개발환경
│   │   └── n8n/            # n8n 워크플로우
│   ├── syntheses/          # 크로스토픽 분석·비교
│   ├── index.md            # 전체 페이지 카탈로그 (자동 관리)
│   └── log.md              # ingest/query 작업 이력 (자동 관리)
├── src/                    # React 뷰어
│   ├── components/
│   │   ├── Layout.jsx      # 헤더, 검색, 사이드바 레이아웃
│   │   ├── Sidebar.jsx     # 카테고리별 접이식 네비게이션
│   │   ├── WikiPage.jsx    # 마크다운 렌더링 + 코드 하이라이팅
│   │   ├── GraphPage.jsx   # D3 지식 그래프
│   │   └── SearchPage.jsx  # 전문 검색
│   ├── useWiki.js          # 마크다운 파싱, 링크·백링크 추출
│   └── wiki.css            # Wikipedia 스타일 UI
├── scripts/
│   ├── sync-from-drive.ps1 # Google Drive 변경 감지 → CHANGES.md
│   └── migrate-wiki.ps1    # wiki 폴더 구조 마이그레이션 (일회성)
├── .env.example            # 환경변수 템플릿
├── .syncignore             # 동기화 제외 패턴
└── CLAUDE.md               # Claude 운영 규칙 (ingest/query/lint 워크플로)
```

## 시작하기

### 사전 요구사항

- Node.js 22+
- PowerShell 5 (Windows 기본 내장)
- Google Drive 마운트 (로컬 드라이브로 접근 가능해야 함)

### 환경변수 설정

```bash
cp .env.example .env
```

`.env` 파일을 열어 아래 값을 설정:

| 키             | 설명                            |
| -------------- | ------------------------------- |
| `DRIVE_VAULT`  | Google Drive Obsidian 볼트 경로 |
| `OBSIDIAN_DIR` | 이 프로젝트의 로컬 경로         |

### 개발 서버 실행

```bash
npm run dev
```

## 사용 방법

### 1. Google Drive 변경 감지

Obsidian에서 노트를 작성·수정한 뒤:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/sync-from-drive.ps1
```

`sources/CHANGES.md`가 생성되며 추가/수정/삭제된 파일 목록을 담고 있다.

### 2. Claude에게 ingest 요청

Claude Code에서:

```
CHANGES.md 보고 ingest 해줘
```

Claude가 자동으로:

- 변경된 파일만 읽고 분류
- `wiki/` 하위 적절한 카테고리에 페이지 생성·업데이트
- 페이지 간 상호 링크 연결
- `wiki/index.md`, `wiki/log.md` 업데이트

### 3. 동기화 제외 설정

`.syncignore` 파일에 제외할 폴더/파일 패턴 추가:

```
# .syncignore 예시
3. TODO
4. 회의록
6. 기획
```

## 뷰어 기능

| 기능            | 설명                                      |
| --------------- | ----------------------------------------- |
| 사이드바        | 카테고리별 페이지 목록, 접기/펼치기 지원  |
| 검색            | 제목·요약·본문 전문 검색                  |
| 코드 하이라이팅 | 언어 자동 감지, GitHub 스타일             |
| 지식 그래프     | 페이지 연결 관계 D3 시각화, 클릭으로 이동 |
| 백링크          | 현재 페이지를 참조하는 페이지 목록        |
| 카테고리 뱃지   | 페이지 상단에 소속 카테고리 표시          |

## 배포

`master` 브랜치에 push하면 GitHub Actions가 자동으로 빌드·배포한다.

```bash
git push origin master
```

수동 빌드:

```bash
npm run build   # dist/ 생성
npm run preview # 빌드 결과물 로컬 미리보기
```

## Claude 운영 규칙

위키 운영에 관한 Claude의 행동 규칙은 `CLAUDE.md`에 정의되어 있다.  
주요 워크플로:

- **Ingest**: 소스 읽기 → 분류 → 페이지 생성/업데이트 → 상호참조 → index/log 업데이트
- **Query**: index 읽기 → 관련 페이지 검색 → 답변 합성 → syntheses 저장
- **Lint**: 모순 감지, 고아 페이지, 깨진 링크 점검
