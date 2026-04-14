# 프롬프트 엔지니어링

> LLM에게 원하는 출력을 얻기 위해 입력(프롬프트)을 체계적으로 설계하는 기술

## 핵심 내용

### 1. 기본 유형 (예시 수에 따른 분류)

| 기법 | 예시 수 | 특징 |
|------|--------|------|
| **Zero-shot** | 0개 | 지시만 내림. 간단하고 빠름 |
| **One-shot** | 1개 | 예시 1개로 패턴 유도 |
| **Few-shot** | 여러 개 | 번역·분류·포맷팅 등에 효과적 |

---

### 2. 사고 유도형

**Chain-of-Thought (CoT)**
- "답을 바로 말하지 말고, 단계별로 추론 과정을 설명해줘"
- 논리·수학·추론 문제에 강력

**ReAct (Reasoning + Action)**
- 추론과 행동을 교차 실행 → 필요한 검색을 하면서 문제 해결
- [오케스트레이터 아키텍처](../tech/ai/orchestrator-architecture.md)의 핵심 패턴

**Tree of Thoughts (ToT)**
- 여러 추론 경로(가지)를 펼쳐보고 가장 좋은 것 선택
- 복잡한 계획, 창의적 발상에 유리

**Self-Consistency**
- 여러 번 답을 생성 후 다수결로 채택
- 정답 안정성 향상 → [Self-RAG](../concepts/advanced-rag.md)의 검증 원리와 유사

---

### 3. 역할/맥락 부여형

**Role Prompting**: "너는 경험 많은 데이터 분석가야"
**Persona Prompting**: "스티브 잡스처럼 직설적으로 평가해"
**Contextual Prompting**: 배경·데이터·환경을 충분히 제공

---

### 4. 출력 제어형

**Structured Output**: JSON, 마크다운, 표 형식 미리 지정
**Directive Chaining**: 분석 → 초안 → 검증 → 최종 순서로 단계별 지시
**Multi-turn Refinement**: 대화로 점진적으로 다듬기

---

### 5. 메타 프롬프트

**Prompt Chaining**: 여러 프롬프트를 순차 연결 (요약 → 분석 → 보고서)
**Reflection Prompting**: 스스로 답변을 평가하고 수정하게 함
**Auto-Prompting**: 모델이 스스로 더 좋은 프롬프트를 제안

---

### 상황별 선택 가이드

```
빠른 작업         → Zero-shot / Few-shot
복잡한 추론       → CoT / ToT / Self-Consistency
맞춤형 스타일     → Role / Persona
깔끔한 출력       → Structured Output / Chaining
품질 향상         → Reflection / Multi-turn Refinement
에이전트 시스템   → ReAct
```

---

### 프롬프트 작성 프레임워크

프롬프트를 만들기 전 7가지를 먼저 정리:

```
1. 목적 (Why)     — 보고용/분석용/자동화/창작 중 무엇?
2. 출력 형태 (What) — JSON/표/자연어/코드, 길이, 수량
3. 제약 규칙 (How) — "외부 가정 금지", "제공 데이터만 사용"
4. 톤 & 스타일 — 대상(경영진/팀원), 어조(친절/전문적)
5. 맥락 (Context) — 배경 정보, 데이터 정의
6. 우선순위 — 반드시 지켜야 할 핵심 3가지
7. 품질 검증 — 정확성/일관성/실행가능성 기준
```

**구조적 프롬프트 템플릿**:

```
### [역할]
[페르소나]: 전문가 역할 + 대상 독자 + 핵심 목표

### [입력 정보]
- [주요 입력 변수]: 데이터의 키 값
- [제약사항]: 모델이 오해할 가능성이 높은 부분
- [우선순위]:

### [절차]
- [단계 1: 입력 검증 및 초기 판단]
- [단계 2: 주요 작업 수행]
- [단계 3: 자기 검증 및 최종 결과물 형식화]

### [출력 형식 및 규칙]
- [최종 출력 형식]:
- [정보 부족 시 대처법]:
```

**아키텍처 패턴 요청 프롬프트**:

```
"[기능] 구현해줘.
아키텍처:
- Strategy 패턴 / Factory 패턴 / Plugin 패턴 사용
- 구체 클래스가 아닌 추상화에 의존
- 새 기능 추가 시 기존 코드 수정 없이 확장 가능 (Open-Closed Principle)
- 구체적 구현은 별도 파일로 분리"
```

---

### LLM 기반 지식 (Transformer + 아키텍처)

#### Transformer 핵심 구조

```
입력 → [Embedding + Positional Encoding]
      → [Multi-Head Attention] × N
      → [Feed Forward]
      → 출력
```

**Attention 메커니즘 (Q/K/V)**:
- **Query (Q)**: "무엇을 찾고 있는가" — 현재 처리 중인 토큰의 관심사
- **Key (K)**: "나는 무엇을 제공할 수 있는가" — 각 토큰의 자기소개
- **Value (V)**: "실제 내용" — Attention 가중치로 가져올 실제 정보

```
Attention(Q, K, V) = softmax(QKᵀ / √dk) × V
```

**Multi-Head Attention**: 서로 다른 관점에서 병렬로 Attention 계산 → 의미, 문법, 문맥 등 다양한 패턴 동시 포착

#### 주요 아키텍처 비교

| 모델 | 아키텍처 | 특징 |
|------|---------|------|
| **BERT** | Encoder only | 문맥 양방향 이해, 분류/NER에 강함 |
| **GPT** | Decoder only | 자기회귀 생성, 텍스트 생성에 특화 |
| **T5** | Encoder-Decoder | 모든 NLP 태스크를 텍스트→텍스트 변환으로 통일 |

---

### 출력 제어 파라미터

| 파라미터 | 범위 | 역할 |
|---------|------|------|
| **Temperature** | 0~2 | 0에 가까울수록 결정적, 높을수록 창의적 |
| **Top-k** | 정수 | 상위 k개 토큰 중에서만 샘플링 |
| **Top-p (nucleus)** | 0~1 | 누적 확률 p까지의 토큰 집합에서 샘플링 |

```
낮은 temperature + top-p 0.1 → 안정적, 일관된 출력 (코드, 데이터 추출)
높은 temperature + top-p 0.9 → 창의적, 다양한 출력 (브레인스토밍, 창작)
```

---

### AI 윤리와 한계

- **할루시네이션**: 사실과 다른 내용을 그럴듯하게 생성 → 검증 필수
- **편향 (Bias)**: 학습 데이터의 편향이 모델 출력에 반영
- **투명성**: 모델의 추론 과정은 블랙박스 → 설명 가능성 필요
- **연합 학습 (Federated Learning)**: 데이터를 중앙 서버로 보내지 않고 로컬에서 학습 → 프라이버시 보호

## 관련 페이지

- [고급 RAG 패턴](../concepts/advanced-rag.md) — CoT·Self-Consistency를 RAG에 응용
- [오케스트레이터 아키텍처](../tech/ai/orchestrator-architecture.md) — ReAct 패턴 기반 에이전트 시스템
- [임베딩 검색 정확성 향상](../tech/ai/embedding-search-accuracy.md) — 검색 쿼리 최적화에 프롬프트 적용
- [임베딩 모델](../tech/ai/embedding-models.md) — Transformer 기반 임베딩 생성

## 출처

- 주요 프롬프트 기법 모음 — 2026-04-14
- 프롬프트 기본지식 — 2026-04-14
