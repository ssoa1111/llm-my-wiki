# 기초 CS (웹 개발자를 위한)

> 웹 프론트엔드 개발자가 알아야 할 컴퓨터 과학 기초 개념 — 네트워크, 브라우저, 메모리, 운영체제.

## 핵심 내용

### DNS 조회 과정 (URL 입력 → 화면 표시)

```
1. URL 파싱    → "https" 프로토콜, "google.com" 도메인 확인
2. DNS 조회    → 브라우저 캐시 → OS 캐시 → DNS 서버 → IP 반환
3. TCP 연결    → IP로 서버에 연결, 3-way handshake (SYN → SYN-ACK → ACK)
4. TLS 핸드셰이크 → 암호화 방식 협의, 인증서 확인 (HTTPS일 때)
5. HTTP 요청   → GET / HTTP/1.1 요청 전송
6. 서버 응답   → HTML, CSS, JS 반환
7. 브라우저 렌더링 → HTML 파싱(DOM) → CSS 파싱(CSSOM) → 렌더 트리 → 레이아웃 → 페인트
```

### HTTP & 네트워크 기초

#### HTTP 메서드
| 메서드 | 의미 | 멱등성 | 안전성 |
|--------|------|--------|--------|
| GET | 리소스 조회 | O | O |
| POST | 리소스 생성 | X | X |
| PUT | 리소스 전체 교체 | O | X |
| PATCH | 리소스 부분 수정 | X | X |
| DELETE | 리소스 삭제 | O | X |

#### HTTP 상태 코드
- **2xx**: 성공 (200 OK, 201 Created, 204 No Content)
- **3xx**: 리다이렉션 (301 Moved Permanently, 304 Not Modified)
- **4xx**: 클라이언트 오류 (400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 429 Too Many Requests)
- **5xx**: 서버 오류 (500 Internal Server Error, 502 Bad Gateway, 503 Service Unavailable)

#### HTTP/1.1 vs HTTP/2 vs HTTP/3
| | HTTP/1.1 | HTTP/2 | HTTP/3 |
|--|----------|--------|--------|
| 전송 | 텍스트 | 바이너리 프레임 | QUIC (UDP) |
| 다중화 | 불가 (HOL Blocking) | 가능 (스트림) | 가능 |
| 헤더 압축 | 없음 | HPACK | QPACK |
| 연결 | TCP | TCP | UDP |

### 브라우저 렌더링 과정 (Critical Rendering Path)
```
HTML 파싱 → DOM 트리
CSS 파싱 → CSSOM 트리
              ↓
         Render Tree (DOM + CSSOM)
              ↓
         Layout (Reflow): 위치/크기 계산
              ↓
         Paint: 픽셀 채우기
              ↓
         Composite: 레이어 합성
```

**Reflow vs Repaint:**
- **Reflow**: 레이아웃 변경 (width, height, margin, position) → 비용 높음
- **Repaint**: 시각적 변경만 (color, background) → 비용 낮음
- **Composite Only**: transform, opacity → GPU에서 처리, 가장 빠름

```css
/* Reflow 유발 (비용 높음) */
element.style.width = '100px'

/* Repaint만 유발 */
element.style.backgroundColor = 'red'

/* Composite only (가장 빠름) */
element.style.transform = 'translateX(100px)'
element.style.opacity = '0.5'
```

### 메모리 관리

#### 가비지 컬렉션 (GC)
- JavaScript는 자동 메모리 관리 (참조 카운팅 + Mark-and-Sweep)
- 도달할 수 없는(unreachable) 객체는 GC 대상
- **메모리 누수 주요 원인:**
  - 전역 변수 (window.myData = largeArray)
  - 클리어되지 않은 이벤트 리스너
  - 클리어되지 않은 타이머 (setInterval)
  - 클로저가 불필요하게 큰 객체 참조

```js
// 메모리 누수 예시
function setup() {
  const largeData = new Array(1000000).fill('data')
  document.getElementById('btn').addEventListener('click', () => {
    console.log(largeData.length) // largeData를 클로저로 참조
  })
  // 버튼이 제거되어도 largeData는 GC 불가
}

// 해결
function setup() {
  const largeData = new Array(1000000).fill('data')
  const dataLength = largeData.length // 필요한 값만 캡처
  document.getElementById('btn').addEventListener('click', () => {
    console.log(dataLength)
  })
}
```

### OSI 7계층

| 계층 | 이름 | 담당 | 대표 기술 |
|---|---|---|---|
| 1 | **물리** (Physical) | 비트를 전기신호로 전송 | 케이블, 허브 |
| 2 | **데이터링크** (Data Link) | 같은 네트워크 내 노드 간 전송 | MAC주소, 이더넷 |
| 3 | **네트워크** (Network) | 다른 네트워크 간 경로 결정 | IP, 라우터 |
| 4 | **전송** (Transport) | 데이터 신뢰성 / 흐름 제어 | TCP, UDP |
| 5 | **세션** (Session) | 연결 수립/유지/종료 | |
| 6 | **표현** (Presentation) | 데이터 형식 변환, 암호화 | SSL/TLS |
| 7 | **응용** (Application) | 사용자와 직접 맞닿는 계층 | HTTP, DNS |

### TCP vs UDP

| | TCP | UDP |
|---|---|---|
| 신뢰성 | ✅ 높음 (데이터 보장) | ❌ 낮음 (손실 가능) |
| 속도 | 느림 | **빠름** |
| 연결 방식 | 3-way handshake | 연결 없이 바로 전송 |
| 순서 보장 | ✅ | ❌ |
| 사용 예 | HTTP, 파일전송, 이메일 | 영상 스트리밍, 게임, DNS |

> TCP = "확실하게" 보내야 할 때 / UDP = "빠르게" 보내야 할 때

### 운영체제 개념

#### 프로세스 vs 스레드
| | 프로세스 | 스레드 |
|--|---------|--------|
| 메모리 | 독립된 주소 공간 | 공유 주소 공간 |
| 통신 | IPC (느림) | 직접 메모리 접근 (빠름) |
| 오버헤드 | 높음 | 낮음 |
| 안전성 | 독립 (하나 죽어도 영향 없음) | 공유 (하나 오류 시 전체 위험) |

브라우저의 탭은 별도 **프로세스** (Chrome의 다중 프로세스 아키텍처)

#### JavaScript의 단일 스레드
- JS 엔진은 단일 스레드 (Call Stack 하나)
- 동시성은 이벤트 루프로 달성 (실제 병렬 X)
- Web Workers로 백그라운드 스레드 실행 가능

### 캐싱 전략

#### HTTP 캐싱
```
Cache-Control: max-age=31536000, immutable    # 1년, 변경 없음 (CSS/JS 해시 파일)
Cache-Control: no-cache                        # 항상 서버에 검증 요청
Cache-Control: no-store                        # 캐시 저장 금지
Cache-Control: stale-while-revalidate=60       # 60초간 stale 허용하며 백그라운드 갱신
```

#### ETag & Last-Modified
- 서버에서 리소스 버전 식별자 발급
- 클라이언트가 `If-None-Match` / `If-Modified-Since` 헤더로 검증
- 변경 없으면 `304 Not Modified` 반환 (바디 없음)

### 보안 기초

#### HTTPS & TLS
- TLS(Transport Layer Security) 핸드셰이크로 암호화 키 교환
- 인증서로 서버 신원 검증
- 개인정보, 토큰 등 민감 데이터 전송 필수

#### 동일 출처 정책 (Same-Origin Policy)
- 프로토콜 + 호스트 + 포트가 모두 같아야 동일 출처
- 브라우저가 다른 출처 리소스 접근 제한
- **CORS**: 서버가 허용한 출처에서의 요청은 예외

## 관련 페이지

- [이벤트 루프와 비동기](../concepts/event-loop.md) — JavaScript 단일 스레드 비동기 처리
- [스크립트 태그 보안](./backend/script-security.md) — 브라우저 보안 위협
- [성능 측정 및 개선](./frontend/performance-measurement.md) — Reflow/Repaint 최적화

## 출처

- 기초 CS — 2026-04-10
- 기초 CS (2. study/3. cs/기초 CS.md) — 2026-04-16
