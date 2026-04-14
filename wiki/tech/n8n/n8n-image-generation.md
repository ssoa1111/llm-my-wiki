# n8n 이미지 생성 워크플로

> n8n에서 OpenAI gpt-image-1 또는 Gemini API로 샘플 이미지 + 프롬프트를 받아 새로운 아바타 이미지를 생성하는 방법.

## 핵심 내용

### 전체 흐름

```
Form Trigger (파일 업로드)
  → [Gemini만] Extract from File (binary → base64)
  → HTTP Request (OpenAI / Gemini API)
  → Code 노드 (결과 HTML 변환)
```

---

### 방법 1: OpenAI gpt-image-1

**API 엔드포인트**: `POST https://api.openai.com/v1/images/edits`  
이미지 + 프롬프트를 동시에 받을 수 있는 유일한 OpenAI API.

**HTTP 노드 설정**:
```bash
curl -X POST "https://api.openai.com/v1/images/edits" \
  -H "Authorization: Bearer YOUR_OPENAI_API_KEY" \
  -F "model=gpt-image-1" \
  -F "prompt=Create a minimalist cartoon avatar of the person in this photo,
      capturing the main facial features and hairstyle,
      in a simple, flat, colorful illustration style similar to Notion avatars,
      with a clean white background." \
  -F "size=1024x1024" \
  -F "image=@input.png"
```

n8n에서는:
- **Content-Type**: `multipart/form-data`
- image 파라미터 타입: **n8n binary file** 지정

**결과 처리** (Code 노드):
```javascript
const url = $input.first().json.data[0].b64_json;
return [{
  json: {
    html_preview: `<img src="data:image/png;base64,${url}" alt="AI Image" />`
  }
}];
```

**모델 비교**:
| 모델 | 품질 | 최소 사이즈 | 출력 형식 |
|------|------|-------------|-----------|
| `gpt-image-1` | ✅ 프롬프트 대로 잘 변형 | 1024x1024 | base64 |
| `dall-e-2` | ❌ 프롬프트 반영 안 됨 | 256x256 가능 | URL |

---

### 방법 2: Gemini 이미지 생성

**API 엔드포인트**: `POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent`

**전처리 필요**: Gemini는 base64 형식 요구 → `Extract from File` 노드로 변환

**요청 바디**:
```json
{
  "contents": [{
    "parts": [
      {
        "text": "Create a minimalist cartoon avatar of the person in this photo,
                 capturing the main facial features, hairstyle, skin tone,
                 in a simple, flat, colorful illustration style,
                 with a clean white background."
      },
      {
        "inline_data": {
          "mime_type": "image/png",
          "data": "{{ $json.data }}"
        }
      }
    ]
  }],
  "generationConfig": {
    "responseModalities": ["TEXT", "IMAGE"]
  }
}
```

**모델 비교**:
| 모델 | 품질 | 비용 |
|------|------|------|
| `gemini-2.0-flash-preview-image-generation` | 캐릭터 형태만, 세부 낮음 | 저렴 |
| `gemini-2.5-flash-image-preview` | 지시에 맞게 잘 나옴 | 비쌈 (~$5/이미지) |

> Gemini 2.5 flash 비용: 179kB 이미지 1장 처리에 약 **$5.17** (IMAGE 토큰 1290×$0.002)

---

### OpenAI vs Gemini 비교

| 항목 | OpenAI gpt-image-1 | Gemini 2.5 flash |
|------|--------------------|--------------------|
| 이미지 전달 방식 | binary (multipart) | base64 (JSON) |
| 아바타 품질 | 사람 형태 잘 유지 | 캐릭터로 나올 수 있음 |
| 최소 사이즈 | 1024x1024 | 1024x1024 |
| 비용 | 중간 | 고가 |

---

### 이미지 최적화 팁

AI에 전달하기 전 TinyPNG로 이미지 압축 → 처리 비용 절감.  
→ [n8n 이미지 압축](./n8n-image-compress.md) 참조

## 관련 페이지

- [n8n 이미지 압축](./n8n-image-compress.md) — TinyPNG API로 이미지 압축 전처리
- [n8n AI Agent 노드 설정](./n8n-ai-agent.md) — AI Agent 노드 시스템 메시지
- [n8n](../../entities/n8n.md) — n8n 엔티티 개요

## 출처

- 샘플이미지+프롬프트로 이미지 생성하기 — 2026-04-14
- 샘플이미지+프롬프트로 이미지 생성하기 2 — 2026-04-14
