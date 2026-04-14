# n8n 이미지 압축 (TinyPNG API)

> n8n에서 TinyPNG API를 HTTP 노드로 호출해 이미지를 압축하는 방법 — AI 입력 전 전처리 단계로 사용.

## 핵심 내용

### TinyPNG 압축 워크플로

```
이미지 (binary)
  → HTTP Request (POST https://api.tinify.com/shrink)
  → HTTP Request (GET 압축된 URL → binary 다운로드)
  → 압축된 binary 이미지 사용
```

---

### 1단계: TinyPNG API 키 발급

```
https://tinypng.com/developers
→ 이름 + 이메일로 API 키 발급
→ 처음에는 disabled 상태 → Active로 전환
→ 월 500회 무료
```

---

### 2단계: HTTP 노드 설정 (압축 요청)

```
HTTP Request 노드
- Method: POST
- URL: https://api.tinify.com/shrink
- Authentication: Basic Auth
  - Username: (비워둠)
  - Password: YOUR_API_KEY
- Body Content Type: Binary Data
- Input Data Field: file (업로드된 이미지 필드명)
```

**응답 결과**:
```json
{
  "input": { "size": 179333, "type": "image/png" },
  "output": {
    "size": 59225,
    "type": "image/png",
    "width": 500,
    "height": 372,
    "ratio": 0.3303,
    "url": "https://api.tinify.com/output/hwjvrr4..."
  }
}
```

압축률 예시: 179kB → 59kB (67% 감소, ratio: 0.33)

---

### 3단계: HTTP 노드 (압축 파일 다운로드)

```
HTTP Request 노드
- Method: GET
- URL: {{ $json["output"]["url"] }}
- Response Format: File
- Output Property Name: file
```

결과로 압축된 binary 이미지가 `file` 필드에 저장됨.

---

### 전체 n8n 노드 플로우

```json
HTTP Request (POST tinify.com/shrink)
  ↓ output.url
HTTP Request (GET 압축된 이미지)
  ↓ binary file
다음 노드 (AI API, 저장 등)
```

---

### AI 입력 전 압축이 유용한 이유

| 상황 | 효과 |
|------|------|
| OpenAI gpt-image-1 | 이미지 토큰 수 감소 → 비용 절감 |
| Gemini 2.5 flash | 이미지 크기 비례 과금이므로 중요 |
| 저장/전송 | 대역폭, 스토리지 절감 |

## 관련 페이지

- [n8n 이미지 생성 워크플로](./n8n-image-generation.md) — 압축 후 AI 이미지 생성
- [n8n](../../entities/n8n.md) — n8n 엔티티 개요

## 출처

- 이미지 압축하기 with.pinyPNG — 2026-04-14
