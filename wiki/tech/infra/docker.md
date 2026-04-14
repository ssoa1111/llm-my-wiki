# Docker

> 컨테이너 기반 가상화 플랫폼. 이식성 덕분에 환경 무관하게 동일하게 프로그램을 설치·실행할 수 있다.

## 핵심 내용

Docker는 애플리케이션을 독립된 **컨테이너**로 패키징하여 어떤 환경에서도 동일하게 실행되도록 한다.

### 핵심 개념 3가지

**이미지 (Image)**
- 특정 프로그램의 설치 방법, 실행 방식, 환경·버전 정보를 담은 패키지
- 비유: 닌텐도 게임칩 (칩 자체는 변하지 않음)
- Docker Hub에서 공개 이미지 검색 가능

**컨테이너 (Container)**
- 이미지를 실행한 독립적 공간
- 각 컨테이너는 독립된 환경·파일시스템·IP를 가짐
- 다른 컨테이너의 저장소에 접근 불가
- 비유: 컴퓨터에서 사용자 계정을 전환한 것처럼 독립적

**볼륨 (Volume)**
- 컨테이너 외부에 데이터를 영구 저장하는 방법
- 컨테이너가 삭제되어도 데이터 유지
- Windows 주의: 경로 구분자 `\` → `//` 변환 필요

---

### CLI 명령어

**이미지 관리**

```bash
docker pull <image>          # 이미지 다운로드 (Docker Hub)
docker image ls              # 다운로드된 이미지 목록
docker image rm <image>      # 이미지 삭제
```

**컨테이너 생명주기**

```bash
docker container create <image>          # 컨테이너 생성 (실행 X)
docker container start <container_id>    # 생성된 컨테이너 실행
docker run <image>                       # create + start 통합 명령
docker container stop <container_id>    # 정상 종료 (SIGTERM → 10s → SIGKILL)
docker container kill <container_id>    # 강제 종료 (SIGKILL 즉시)
docker container rm <container_id>      # 컨테이너 삭제
docker ps                               # 실행 중 컨테이너 목록
docker ps -a                            # 전체 컨테이너 목록
```

**포트 매핑 & 접속**

```bash
# -p [호스트포트]:[컨테이너포트]
docker run -p 3000:3000 my-app

# 실행 중인 컨테이너 터미널 접속
docker exec -it <container_id> bash

# 로그 확인
docker logs <container_id>              # 전체 로그
docker logs -f <container_id>           # 실시간 스트리밍
docker logs --tail 100 <container_id>   # 마지막 100줄
```

---

### 볼륨 마운트 (데이터 영속화)

```bash
# 기본 볼륨 마운트
docker run -v <host_path>:<container_path> <image>

# MySQL 데이터 영속화 예시
docker run -v /home/user/mysql_data:/var/lib/mysql mysql

# ⚠️ Windows 경로 주의: 백슬래시 \ → 슬래시 // 변환 필수
docker run -v "//c/Users/username/mysql_data:/var/lib/mysql" mysql
#                ↑ 앞에 // 추가, 백슬래시 없이
```

> **Windows 볼륨 오류 패턴**: 경로를 `C:\Users\...` 그대로 쓰면 컨테이너 재시작 시 DB 데이터가 사라짐. 반드시 `//c/Users/...` 형태로 변환.

---

### Dockerfile — 이미지 직접 만들기

```dockerfile
# 베이스 이미지 선택
FROM node:18-alpine

# 작업 디렉토리 설정
WORKDIR /app

# 의존성 파일 복사 & 설치
COPY package*.json ./
RUN npm install

# 소스 코드 복사
COPY . .

# 빌드
RUN npm run build

# 포트 노출
EXPOSE 3000

# 컨테이너 시작 명령
ENTRYPOINT ["npm", "start"]
```

**Next.js 프로덕션 Dockerfile 패턴**

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
EXPOSE 3000
CMD ["npm", "start"]
```

**nginx 정적 파일 서빙**

```dockerfile
FROM nginx:alpine
COPY dist/ /usr/share/nginx/html
EXPOSE 80
```

**이미지 빌드 & 실행**

```bash
docker build -t my-app .          # 현재 디렉토리 Dockerfile로 빌드
docker run -p 3000:3000 my-app    # 이미지 실행
```

---

### Docker Compose — 다중 컨테이너 관리

```yaml
# docker-compose.yml
version: '3'
services:
  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: password
      MYSQL_DATABASE: mydb
    volumes:
      - mysql_data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5

  app:
    build: .
    ports:
      - "3000:3000"
    depends_on:
      db:
        condition: service_healthy   # db가 healthy 상태일 때만 시작
    environment:
      DB_HOST: db    # ⚠️ localhost가 아닌 컨테이너 서비스명 사용!

volumes:
  mysql_data:
```

**Compose 명령어**

```bash
docker compose up -d      # 백그라운드 실행
docker compose down       # 컨테이너 중지 & 삭제
docker compose pull       # 이미지 최신화
docker compose ps         # 실행 중인 서비스 목록
docker compose logs -f    # 전체 로그 스트리밍
```

> **컨테이너 간 통신**: 같은 Compose 네트워크 내에서는 `localhost` 대신 **서비스명** 사용. 예: `DB_HOST=db`

**depends_on + healthcheck 패턴**
- `depends_on: service_healthy` → 헬스체크 통과 후 다음 서비스 시작
- `depends_on: service_started` → 단순 시작 확인 (DB 초기화 전에 앱이 연결 시도할 수 있음)

---

### EC2 배포 개념

AWS EC2에 Docker를 설치해 컨테이너를 프로덕션 배포하는 패턴.

| 개념 | 설명 |
|------|------|
| **리전 (Region)** | 서버가 위치한 지역 (ap-northeast-2 = 서울) |
| **인스턴스** | EC2 가상 서버 1대 |
| **인스턴스 타입** | CPU/메모리 사양 (t2.micro, t3.medium 등) |
| **키페어** | SSH 접속 인증 키 (.pem 파일) |
| **보안 그룹** | 방화벽 규칙 (포트 허용/차단) |
| **EBS** | EC2에 연결된 영구 스토리지 (볼륨) |
| **탄력적 IP** | 재시작해도 변하지 않는 고정 공인 IP |

**이식성이 핵심**: 로컬에서 동작하면 EC2에서도 동작한다.

## 관련 페이지

- [n8n 로컬 셋팅](../n8n/n8n-local-setup.md) — Docker로 n8n 로컬 설치
- [n8n](../../entities/n8n.md) — Docker로 로컬 설치하는 대표 도구

## 출처

- Docker의 기본 개념 — 2026-04-14
- Docker cli — 2026-04-14
- Docker volume — 2026-04-14
- Dockerfile로 이미지 생성하기 — 2026-04-14
- Docker compose로 컨테이너 관리하기 — 2026-04-14
- 컨테이너 여러 개 실행시키기 — 2026-04-14
- EC2란 — 2026-04-14
- docker 볼륨 파일의 db가 유지되지 않음 — 2026-04-14
