# RAG 속도 개선

> Ultra-RAG의 10-15초를 4-6초로 줄이는 6가지 최적화 기법 — 병렬 처리, 캐싱, 빠른 모델, 검증 통합, 스트리밍, 재시도 제한.

## 핵심 내용

### 6가지 최적화 기법

**1. 병렬 처리** — 가장 효과적. 50% 시간 단축.

```python
# 느림 (순차): 6초
docs = await search_db(query)    # 3초
score = await grade(docs)        # 3초

# 빠름 (병렬): 3초
docs, web_results = await asyncio.gather(
    search_db(query),
    search_web(query)
)
```

**2. 캐싱** — 재방문 시 즉시 응답(0.1초)

```python
@cache(ttl=3600)  # 1시간 캐싱
async def search_documents(query):
    return await vectorstore.search(query)
```

**3. 빠른 모델 전략** — 단순 작업은 저렴하고 빠른 모델로

```python
# 라우팅, 관련성 평가 → GPT-3.5 (1초)
# 최종 답변 생성 → GPT-4 (5초)
router_llm = ChatOpenAI(model="gpt-3.5-turbo")
generate_llm = ChatOpenAI(model="gpt-4")
```

**4. 검증 단계 통합** — 3번 개별 호출 → 1번에 처리

```python
# 느림: 3가지 검증을 각각 (6초)
check_support()        # 2초
check_hallucination()  # 2초
check_relevance()      # 2초

# 빠름: 1번에 다 물어보기 (2초)
check_all_at_once()
```

**5. 스트리밍** — 체감 대기 시간 0초

```python
# 느림: 전부 생성 후 반환 (10초 대기)
answer = await llm.invoke(prompt)

# 빠름: 생성하면서 실시간 전송
async for chunk in llm.astream(prompt):
    yield chunk
```

**6. 재시도 횟수 제한**

```python
# 느림: 최대 3회 재시도 (12초)
max_retries = 3

# 빠름: 1회만 (4초)
max_retries = 1
```

---

### 개선 효과

```
기존 Ultra-RAG: 10-15초

적용 후:
✅ 병렬 처리: -4초
✅ 빠른 모델:  -2초
✅ 캐싱:       -3초 (재방문)
✅ 스트리밍:   체감 즉시

최종: 4-6초 (60% 단축)
```

---

### 실무 적용 패턴

대부분 프로젝트는 3가지 고급 패턴을 모두 사용하지 않는다 (오버엔지니어링):

```
80% 케이스: 기본 RAG만 (3초, $0.01/회)
15% 케이스: Adaptive RAG 추가 (4초, $0.015/회)
5% 케이스: Adaptive + Self-RAG (의료/법률/금융)
```

**DevFlow 같은 개인 프로젝트 권장 전략**:
```
시작: 기본 RAG
↓ 문제 생기면: Adaptive 추가
↓ 환각 심하면: Self-RAG 고려
```

---

### 캐싱 전략 상세

```python
# 1. 질문 캐싱 (임베딩 캐싱)
embedding_cache = {}
def get_embedding(text):
    if text not in embedding_cache:
        embedding_cache[text] = embed(text)
    return embedding_cache[text]

# 2. 검색 결과 캐싱
@cache(ttl=1800)  # 30분
async def cached_search(query_hash):
    return await vectorstore.search(query_hash)
```

## 관련 페이지

- [고급 RAG 패턴](../../concepts/advanced-rag.md) — Adaptive/Corrective/Self-RAG 개념
- [RAG 문서 검색 메커니즘](./rag-search-mechanism.md) — 검색 동작 원리
- [벡터 DB 검색속도 비교](./vector-db-comparison.md) — DB 선택이 속도에 미치는 영향

## 출처

- 속도 개선 방향 — 2026-04-14
