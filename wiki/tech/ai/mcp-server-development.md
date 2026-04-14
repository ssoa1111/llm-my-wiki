# MCP 서버 개발 — TypeScript

> Model Context Protocol(MCP) 서버를 TypeScript로 직접 만들어 AI 에이전트에 커스텀 도구를 제공하는 방법.

## 핵심 내용

MCP 서버는 AI 에이전트(Claude, GPT 등)가 외부 데이터베이스, API, 시스템에 접근할 수 있게 해주는 중간 레이어다. n8n의 "MCP Server Trigger + MCP Client"를 코드로 구현하는 방식.

```
n8n 방식:  MCP Server Trigger → MCP Client (노코드)
코드 방식: MCP 서버 프로그램 → MCP Client 코드 (코드)
```

---

### 프로젝트 구조

```
my-mcp-server/
├── index.ts          # MCP 서버 메인 (Server 초기화 + tool 등록)
├── tools/
│   └── seo-search.ts # tool 구현 (임베딩 검색 + 웹 검색 fallback)
├── tsconfig.json
└── package.json
```

### 설치

```bash
mkdir my-mcp-server && cd my-mcp-server
npm init -y
npm install @modelcontextprotocol/sdk
npm install @supabase/supabase-js openai
```

---

### index.ts — 서버 메인

```typescript
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { searchEmbedding } from "./tools/seo-search.js";

// 1. Server 초기화
const server = new Server(
  { name: "seo-mcp-server", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

// 2. Tool 목록 등록 (AI가 이 정보로 언제 tool 쓸지 판단)
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [{
    name: "seo_embedding_search",
    description: "SEO 관련 문서를 임베딩으로 검색하고, 결과가 없으면 웹 검색합니다.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "검색할 질문" },
        difficulty_level: { type: "number", enum: [1, 2, 3] },
        category: { type: "string" },
      },
      required: ["query"],
    },
  }],
}));

// 3. Tool 실행 핸들러
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  if (name === "seo_embedding_search") {
    const result = await searchEmbedding(args);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  }
  throw new Error(`Unknown tool: ${name}`);
});

// 4. stdio 통신으로 시작
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
main();
```

---

### tools/seo-search.ts — 임베딩 + 웹 검색 fallback

```typescript
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function searchEmbedding({ query, difficulty_level, category }) {
  // 1. 쿼리 → 임베딩
  const { data } = await openai.embeddings.create({
    model: "text-embedding-3-large",
    input: query,
  });
  const embedding = data[0].embedding;

  // 2. Supabase 임베딩 검색
  const params: any = {
    query_embedding: embedding,
    match_threshold: 0.7,
    match_count: 5,
  };
  if (difficulty_level || category) {
    params.metadata_filter = {};
    if (difficulty_level) params.metadata_filter.difficulty_level = difficulty_level;
    if (category) params.metadata_filter.category = category;
  }

  const { data: results } = await supabase.rpc("match_work_category_embedding", params);

  // 3. 결과 있으면 반환, 없으면 웹 검색 fallback
  if (results?.length > 0) {
    return { source: "embedding", results };
  }

  // 4. Brave Search API fallback
  const res = await fetch(
    `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}`,
    { headers: { "X-Subscription-Token": process.env.BRAVE_API_KEY! } }
  );
  const web = await res.json();
  return {
    source: "web",
    message: "문서에서 찾지 못해 웹 검색 결과를 반환합니다.",
    results: web.web?.results?.slice(0, 5),
  };
}
```

---

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "Node16",
    "moduleResolution": "Node16",
    "outDir": "./dist",
    "esModuleInterop": true,
    "strict": true
  }
}
```

### 빌드 & 실행

```bash
npm run build

# Next.js API Route에서 stdio로 연결
# MCP Client SDK: @modelcontextprotocol/sdk/client
# stdio로 `node my-mcp-server/dist/index.js` 실행
```

---

### 전체 흐름

```
유저 메시지
  ↓
OpenAI API (Function Calling)
  ↓ "SEO 질문 감지" → tool 사용 판단
MCP Client → seo_embedding_search 호출
  ↓
MCP 서버 → Supabase 임베딩 검색
  ↓ 결과 없으면
  → Brave Search API
  ↓
결과 → OpenAI 응답 생성 → 유저
```

## 관련 페이지

- [Claude Code 개념](./claude-code-concepts.md) — Skill/Subagent/Command과 MCP 차이
- [n8n Supabase 벡터 연동](../n8n/n8n-supabase-vector.md) — match_work_category_embedding RPC
- [임베딩 검색 정확성 향상](./embedding-search-accuracy.md) — confidence 레벨, 재검색 전략
- [오케스트레이터 아키텍처](./orchestrator-architecture.md) — 에이전트 도구 선택 원리

## 출처

- MCP 서버 만들기 — 2026-04-14
