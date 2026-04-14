# Activity Log

> Claude가 자동으로 관리합니다. 수동 편집 금지.  
> 모든 ingest, query, lint 작업이 여기에 기록됩니다.

---

[2026-04-14 14:00] [INGEST] 미싱 파일 배치 (Google Drive: Docker/Supabase/Claude Code/RAG/에러일기/AI/spec-kit)
  생성: tech/claude-code-commands.md, tech/rag-python-implementation.md, tech/frontend-error-patterns.md, tech/mcp-server-development.md, tech/spec-kit.md, tech/dev-environment-errors.md
  업데이트: tech/docker.md (CLI+Volume+Dockerfile+Compose+EC2 전면 확장), tech/n8n-supabase-vector.md (metadata filter 섹션 추가), tech/n8n-ga4-analysis.md (GA4 API 쿼터 추가), tech/orchestrator-architecture.md (스킬 체이닝+HITL+에이전트 tool 선택 기준 추가), tech/zod-validation.md (배열+useFieldArray+enum주의 추가), tech/monorepo-turborepo.md (pnpm catalog+Tailwind 경로 추가), concepts/prompt-engineering.md (Transformer/BERT/GPT/T5/temperature/프롬프트 템플릿 추가), tech/vector-database.md (임베딩 벡터 개념+FAISS/pgvector 추가), tech/git-workflow.md (토큰 갱신 추가), tech/use-effect.md (AbortController+Promise.all vs allSettled 추가)
  핵심 takeaway: Docker CLI 전체(create/start/run/stop/kill/rm/exec/logs), Windows 볼륨 경로(\\→//), Dockerfile 멀티스테이지 빌드, Compose depends_on+healthcheck, EC2 개념; Python RAG Phase1-3(FAISS→LangGraph StateGraph/AgentState); React Hook Form(useFormContext+useWatch), searchParam encodeURIComponent, Zustand clearAllStores 타이밍, recharts v3 shadcn 호환; MCP 서버 TypeScript SDK(ListTools/CallTool/StdioTransport+Brave Search fallback); spec-kit 7단계(SDD); Transformer Q/K/V 구조+프롬프트 7단계 프레임워크; pnpm catalog vs workspace:*; 스킬 체이닝 HITL(LangGraph interrupt)

[2026-04-14 10:00] [INGEST] n8n 심화 배치 (Google Drive: 2. study/1. stack/07. n8n + 2. 에러일기)
  생성: tech/n8n-ai-agent.md, tech/n8n-local-setup.md, tech/n8n-supabase-vector.md, tech/n8n-image-generation.md, tech/n8n-google-sheets.md, tech/n8n-image-compress.md, tech/n8n-troubleshooting.md, tech/n8n-ga4-analysis.md
  업데이트: entities/n8n.md (관련 페이지 링크 보강)
  핵심 takeaway: AI Agent System Message 설계(도구 순서/분기/동의 체크), Docker+Cloudflare Tunnel 셋팅, Supabase pgvector RPC 호출 패턴, OpenAI gpt-image-1 vs Gemini 이미지 생성 비교, Service Account 구글시트 연동, TinyPNG 압축 전처리, Brotli 오류/봇 차단/Loop-in-Loop/Vercel 환경변수 트러블슈팅, GA4 dimensions/metrics 중요도 분류

[2026-04-14 08:00] [INGEST] 국제화(next-intl) (Google Drive: boilerplate)
  생성: tech/nextjs-i18n.md
  업데이트: (없음)
  핵심 takeaway: next-intl로 [locale] 동적 라우팅, Middleware 언어 감지, 번역 JSON 변수 삽입 구현

[2026-04-14 07:00] [INGEST] LangGraph/로딩전략/멀티에이전트DB 배치 (Google Drive)
  생성: tech/langgraph-architecture.md, tech/loading-strategy.md
  업데이트: syntheses/multi-agent-rag.md (Sub Agent별 DB 관리 섹션 추가)
  핵심 takeaway: LangGraph Node/Edge/State/순환구조/비동기 핵심 개념, React Query 3가지 로딩 전략(useQuery/Suspense/서버프리패칭) 페이지별 선택 가이드, 멀티에이전트 벡터DB는 단일DB+메타데이터 분리 권장

[2026-04-14 06:00] [INGEST] AI/RAG/Claude/결제/n8n/Git/모노레포/보일러플레이트 배치 (Google Drive)
  생성: tech/rag-search-mechanism.md, tech/vector-db-comparison.md, tech/rag-speed-optimization.md, tech/hallucination-prevention.md, tech/sql-table-design.md, tech/claude-skill-creation.md, tech/monorepo-turborepo.md, tech/payment-system.md, tech/n8n-chatbot-auth.md, tech/git-workflow.md, tech/nextjs-env-vars.md, tech/rest-api-conventions.md, syntheses/deepagent-langchain-langgraph.md
  업데이트: (없음)
  핵심 takeaway: RAG 검색 메커니즘(청킹→임베딩→유사도), 벡터DB 속도 비교(pgvector vs Qdrant vs Pinecone), RAG 속도 60% 개선, 할루시네이션 단계 분리 방지, SQL 테이블 설계 제약조건, Claude Skill 8단계 고도화, Turborepo 모노레포 설정, PG사 결제 검증, n8n chatbot 인가 프록시, DeepAgent/LangChain/LangGraph 계층 비교 체계화

[2026-04-14 04:00] [INGEST] 인증/보안/DB/유효성검증/캐싱/멀티에이전트 배치 (Google Drive: study/stack)
  생성: tech/jwt-auth-nextjs.md, tech/security-headers.md, tech/open-redirect.md, tech/http-status-codes.md, tech/nextjs-middleware-context.md, tech/supabase-nextjs.md, tech/sql-crud.md, tech/zod-validation.md, tech/nextjs-caching.md, syntheses/multi-agent-rag.md
  업데이트: (없음)
  핵심 takeaway: JWT+JWKS 인증 흐름, HTTP 보안 헤더(CSP/HSTS), Open Redirect 방어, Supabase CRUD+RLS, SQL 실무 패턴, Zod 스키마 검증+Hook Form, Next.js 4계층 캐싱, 멀티에이전트 RAG 아키텍처(Adaptive+Corrective+Self-RAG) 체계화

[2026-04-14 02:00] [INGEST] JS/React/Next.js 추가 배치 (파일명 기반 생성)
  생성: tech/context-zustand.md, tech/typescript.md, tech/script-security.md, tech/webview-basics.md, tech/cs-fundamentals.md
  업데이트: (없음)
  핵심 takeaway: Context vs Zustand 심층 비교, TypeScript 실전 패턴, 웹 보안(XSS/CSP/CSRF), WebView, 웹 개발 기초 CS 체계화

[2026-04-14 01:00] [INGEST] JS/React/Next.js 배치 (Google Drive: 2. study/1. stack/01. JS + 12. Next)
  생성: concepts/closure.md, concepts/event-loop.md, concepts/prototype.md, concepts/ssr-ssg-isr-csr.md, tech/react-rendering-optimization.md, tech/usememo-usecallback-reactmemo.md, tech/use-effect.md, tech/use-transition.md, tech/state-management.md, tech/node-edge-runtime.md, tech/nextjs-image-metadata-seo.md, tech/performance-measurement.md, tech/performance-checklist.md
  업데이트: (없음)
  핵심 takeaway: JavaScript 핵심 개념(클로저, 이벤트 루프, 프로토타입)과 Next.js 렌더링 전략(SSR/SSG/ISR/CSR), React 성능 최적화(useMemo/useCallback/React.memo/useTransition), 상태 관리(Zustand/TanStack Query), Next.js 성능/SEO/런타임 체계화

[2026-04-14 00:00] [INGEST] sources/CHANGES.md — 증분 ingest (150개 파일, 핵심 12개 주제 선별)
  생성: concepts/advanced-rag.md, concepts/chunking.md, concepts/prompt-engineering.md, entities/langgraph.md, entities/langchain.md, entities/n8n.md, tech/embedding-models.md, tech/vector-similarity.md, tech/docker.md, tech/centralized-error-handling.md, tech/orchestrator-architecture.md, tech/claude-code-concepts.md, tech/embedding-search-accuracy.md
  업데이트: concepts/rag.md (고급 RAG 링크 추가), tech/vector-database.md (관련 페이지 보강)
  핵심 takeaway: AI/RAG 심화 지식(고급 RAG 패턴 3종, 청킹, 임베딩, LangGraph/LangChain 비교, 오케스트레이터 아키텍처)과 실무 패턴(Next.js 중앙 에러 처리, Docker, n8n, Claude Code Skill/Subagent/Command)을 체계화
  스킵한 카테고리: TODO 목록, 회의록, 기획 문서, Obsidian 플러그인 README (위키 가치 낮음)

[2026-04-10 00:00] [INGEST] RAG vs LLM Wiki: 지식 관리의 두 가지 접근법 (sources/sample-rag-vs-wiki.md)
  생성: concepts/rag.md, concepts/llm-wiki.md, entities/andrej-karpathy.md, entities/vannevar-bush.md, entities/obsidian.md, tech/vector-database.md, syntheses/rag-vs-llm-wiki.md
  업데이트: (없음)
  핵심 takeaway: RAG는 원본 문서를 벡터 DB로 검색하는 방식, LLM Wiki는 LLM이 직접 지식을 합성·축적하는 방식으로 서로 보완적 패러다임이며, Karpathy가 제안한 LLM Wiki는 Vannevar Bush의 Memex 비전을 AI로 구현한 것
