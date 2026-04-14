# GA4 데이터 분석 — 네트워크 모니터링 연동

> Google Analytics 4 API dimensions/metrics를 네트워크 모니터링 AI와 결합할 때 필요한 데이터 중요도 분류 및 활용 전략.

## 핵심 내용

### 중요도 분류 기준

- **상(필수)**: 오류 원인(느린 로드 시간, 상태 코드)과 트래픽 분석에 직접 기여, AI가 성능 문제 진단에 핵심
- **중(있으면 좋음)**: 추가적인 통찰 제공하나 필수 아님
- **하(관련도 낮음)**: 주요 목표(네트워크 성능, 오류 분석)에 직접 영향 낮음

---

### 필수 데이터 (상)

**Dimensions**

| Dimension | 활용 |
|-----------|------|
| `deviceCategory` | 기기별 로드 시간 차이 (모바일 최적화) |
| `operatingSystem` | iOS vs Android 리소스 로드 문제 |
| `country` | 특정 국가 서버 응답 지연 |
| `sessionSource` | 트래픽 소스별 부하 분석 |
| `sessionMedium` | cpc/email 등 유형별 성능 |
| `sessionCampaignName` | 특정 캠페인 → 트래픽 급증 연관 |
| `eventName` | API 호출 실패 이벤트 연관 |
| `isConversionEvent` | 전환(구매/가입) 관련 오류 필수 |
| `pagePath` | 특정 페이지 리소스 로드 문제 |
| `landingPage` | 방문 페이지 404/500 오류 파악 |
| `transactionId` | 결제 API 실패 추적 |
| `date` | 날짜별 트래픽 패턴 |
| `hour` | 시간대별 피크 부하 |

**Metrics**

| Metric | 활용 |
|--------|------|
| `totalUsers` | 전체 트래픽 부하 |
| `newUsers` | 온보딩 페이지 로드 실패 연관 |
| `userEngagementDuration` | 네트워크 성능 상관관계 |
| `sessions` | 전체 트래픽 부하 |
| `engagedSessions` | 느린 페이지 → 참여 저하 |
| `engagementRate` | 성능 영향 분석 |
| `averageSessionDuration` | 로드 시간/오류 상관관계 |
| `eventCount` | 버튼 클릭/API 호출 부하 |
| `eventCountPerUser` | 개별 사용자 행동 분석 |
| `screenPageViews` | 트래픽 부하 상관관계 |
| `screenPageViewsPerUser` | 반복 방문 → 성능 문제 |
| `itemsPurchased` | 결제 페이지 로드 실패 |
| `itemRevenue` | 오류가 비즈니스에 미치는 영향 |

---

### 네트워크 데이터와 결합 전략

```
GA 데이터 (트래픽/사용자)
  +
네트워크 데이터 (리소스 수, 이미지 크기, 상태 코드, 로드 시간)
  ↓
AI 분석
  → 오류 원인 특정
  → 해결 방안 제안
```

**주요 결합 패턴**:

| GA Dimension/Metric | 네트워크 데이터 | 분석 목표 |
|---------------------|----------------|-----------|
| pagePath | 이미지 크기, 리소스 수 | 페이지별 이미지 최적화 |
| eventName + transactionId | 상태 코드 | API 호출 실패 원인 |
| averageSessionDuration | 로드 시간 | 성능 병목 지점 |
| sessions + hour | 서버 응답 시간 | 피크 시간대 부하 |

---

### AI 분석 추천 방법

**오류 분석**: 상태 코드(404, 500) + eventName + transactionId 결합  
→ 특정 API 호출 실패 지점 특정

**트래픽 분석**: sessions + totalUsers + sessionSource + hour  
→ 트래픽 급증 원인(캠페인, 시간대) 파악

**이상 탐지 모델**: Python scikit-learn/TensorFlow로 sessions + eventCount + 로드 시간 학습  
→ 네트워크 병목 지점 자동 감지

**데이터 수집 도구**:
- 네트워크 데이터: Puppeteer 또는 Selenium (페이지 로드 시간, 리소스 정보)
- GA 데이터: Google Analytics Data API

---

### 카테고리별 최종 요약

**상(필수)**: deviceCategory, operatingSystem, country, sessionSource, sessionMedium, sessionCampaignName, eventName, isConversionEvent, pagePath, landingPage, transactionId, date, hour + 13개 metrics

**중(있으면 좋음)**: userAgeBracket, city, languageCode, defaultChannelGroup, pageTitle, itemName, year, month, dayOfWeek + 4개 metrics

**하(낮음)**: firstUserSource, firstUserMedium, firstUserCampaignName, newVsReturning

---

### GA4 Data API 정책

**비용**: 무료 (별도 과금 없음)

**쿼터 제한**:

| 제한 | 값 |
|------|-----|
| 일일 요청 수 | 50,000 req/day |
| 시간당 요청 수 (프로퍼티당) | 3,600 req/property/hour |
| 초과 시 오류 | `429 RESOURCE_EXHAUSTED` |

**운용 팁**:
- n8n 자동화로 대량 요청 시 시간당 쿼터 주의
- 분석 주기를 1시간에 한 번으로 제한하면 쿼터 초과 가능성 낮음
- 여러 프로퍼티가 있으면 각 프로퍼티별로 별도 쿼터 적용

## 관련 페이지

- [n8n AI Agent 노드 설정](./n8n-ai-agent.md) — GA 데이터 분석 AI Agent 구성
- [RAG 문서 검색 메커니즘](../ai/rag-search-mechanism.md) — AI 분석 파이프라인
- [n8n](../../entities/n8n.md) — n8n 엔티티 개요

## 출처

- ga 데이터 분석 — 2026-04-14
- GA API 정책 — 2026-04-14
