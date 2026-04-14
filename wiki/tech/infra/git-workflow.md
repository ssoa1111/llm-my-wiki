# Git 워크플로우 — 기본 명령어와 Stash

> Git 기본 명령어와 stash를 활용한 작업 임시 저장 워크플로우.

## 핵심 내용

### 저장소 연결 관리

```bash
# 기존 저장소와 로컬 연결 끊기 (PowerShell)
rm -Recurse -Force .git

# 파일/폴더 이동 (git 히스토리 보존)
git mv 기존경로 이동경로
```

---

### Git 토큰 갱신 (GitLab/GitHub)

토큰 만료 시 remote URL에 새 토큰으로 업데이트:

```bash
# 1. 현재 remote URL 확인
git remote -v
# origin  https://token:기존토큰@gitlab.com/경로/프로젝트.git (fetch)

# 2. 새 토큰으로 URL 업데이트
git remote set-url origin https://token:새로운토큰@gitlab.com/경로/프로젝트.git

# 3. 변경 확인
git remote -v
# origin  https://token:새로운토큰@gitlab.com/경로/프로젝트.git (fetch)
```

---

### Git Stash — 작업 임시 저장

커밋 없이 현재 작업을 임시 보관했다가 꺼내 쓸 수 있다. 브랜치 전환 전 작업을 저장할 때 유용하다.

**저장**

```bash
git stash                        # 수정된 파일만 저장
git stash -u                     # 새로 생성한 파일까지 포함
git stash save "작업 A 임시 저장"  # 이름 붙여서 저장
```

**꺼내기**

```bash
git stash pop    # 꺼내고 보관 기록 삭제
git stash apply  # 꺼내지만 보관 기록 유지
```

**관리**

```bash
git stash list           # 전체 stash 목록 확인
git stash drop stash@{0} # 특정 stash 삭제
git stash clear          # 모든 stash 삭제
```

---

### 자주 쓰는 워크플로우

**브랜치 전환 시**:
```bash
git stash           # 현재 작업 임시 저장
git checkout main   # 브랜치 전환
# ... 다른 작업 ...
git checkout feature/my-branch
git stash pop       # 작업 복원
```

**pull 충돌 방지**:
```bash
git stash           # 작업 저장
git pull            # 최신 코드 받기
git stash pop       # 작업 복원 (충돌 시 수동 해결)
```

## 관련 페이지

- [Docker](./docker.md) — Git과 함께 사용하는 컨테이너 기반 개발 환경

## 출처

- 기본 명령어 — 2026-04-14
- stash 임시저장하기 — 2026-04-14
