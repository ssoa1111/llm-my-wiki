# LLM Wiki 시스템 설계 문서

**날짜**: 2026-04-10  
**기반**: Andrej Karpathy의 LLM Wiki 개념  
**플랫폼**: Obsidian (Windows 11)  
**범위**: 핵심 (CLAUDE.md + wiki 구조)

---

## 개요

Claude가 자동으로 생성·유지하는 개인 지식 위키 시스템.  
사용자는 소스(파일 또는 텍스트)를 제공하고, Claude가 분석·요약·상호참조하여 마크다운 위키를 구축한다.

기존 RAG와의 차이점: 쿼리 시점에 원본을 검색하는 게 아니라, **이미 합성된 영구 위키**를 유지한다.  
지식이 시간이 갈수록 복리로 쌓인다.

---

## 도메인

- **개인 지식**: 책, 아이디어, 메모, 다양한 주제
- **소프트웨어/기술**: 코드, 아키텍처, 기술 스택, 문서

---

## 폴더 구조

```
obsidian/                    ← Obsidian 볼트 루트
│
├── CLAUDE.md                ← 핵심 스키마: Claude 행동 규칙
│
├── sources/                 ← 원본 소스 (읽기 전용, Claude 수정 금지)
│
└── wiki/
    ├── index.md             ← 전체 페이지 카탈로그 (Claude 관리)
    ├── log.md               ← 활동 로그 (append-only)
    ├── concepts/            ← 개념, 이론, 패턴
    ├── entities/            ← 인물, 도구, 프로젝트, 회사
    ├── books/               ← 책/논문 요약
    ├── tech/                ← 기술 노트, 코드, 아키텍처
    └── syntheses/           ← 크로스토픽 분석, 비교
```

---

## 사용 방법

```bash
# obsidian/ 폴더에서 claude 실행
cd obsidian/
claude

# 파일 ingest
"sources/article.md 파일 ingest 해줘"

# 텍스트 붙여넣기 ingest
"이 내용 ingest 해줘: [텍스트]"

# 질문
"머신러닝에서 과적합이 뭐야?"

# 위키 점검
"위키 lint 해줘"
```

---

## CLAUDE.md 역할

Claude가 위키를 유지할 때 따르는 규칙 문서. 아래를 정의한다:

- 위키 카테고리 구조 및 각 역할
- 페이지 형식 (요약 3줄, 핵심 내용, 관련 링크, 출처)
- **Ingest 워크플로**: 소스 분석 → 10-15개 페이지 생성/업데이트 → index.md 업데이트 → log.md 기록
- 링크 형식: `[페이지명](../category/page.md)` 표준 마크다운
- Log 형식: `[YYYY-MM-DD HH:MM] [INGEST] 소스명 — 업데이트된 페이지 목록`
- Lint 규칙: 모순 표시, 고아 페이지 경고, 오래된 정보 플래그

---

## 3가지 핵심 운영

### Ingest
1. 소스 전체 읽기
2. 핵심 takeaway 3-5개 추출
3. 관련 wiki 페이지 10-15개 생성 또는 업데이트
4. 표준 마크다운 링크로 상호참조 추가
5. `wiki/index.md` 업데이트
6. `wiki/log.md`에 활동 기록 추가

### Query
사용자 질문 → wiki/ 관련 페이지 검색 → 답변 합성 + 출처 인용

### Lint
- 모순 클레임 발견 및 표시
- 고아 페이지 경고
- 오래된 정보 플래그
- 누락된 상호참조 제안

---

## 구현 범위 (핵심만)

- [ ] 폴더 구조 생성
- [ ] `CLAUDE.md` 작성
- [ ] `wiki/index.md` 초기화
- [ ] `wiki/log.md` 초기화
- [ ] 동작 테스트 (샘플 소스 ingest)

## 제외 항목 (나중에 필요하면 추가)

- `watcher.py` (파일 자동 감시)
- Git + GitHub 연동
- VPS 서버 배포

---

## 성공 기준

- Claude에게 파일/텍스트를 주면 wiki 페이지가 자동 생성된다
- 생성된 페이지들이 서로 링크로 연결된다
- index.md와 log.md가 자동 업데이트된다
- Claude에게 질문하면 wiki를 참조해서 답한다
