# Activity Log

> Claude가 자동으로 관리합니다. 수동 편집 금지.  
> 모든 ingest, query, lint 작업이 여기에 기록됩니다.

---

[2026-04-15 16:00] [QUERY] Next.js 보안 아키텍처 synthesis — Middleware·JWT·보안헤더·Zod·스크립트보안 계층 통합
  참조 페이지: tech/frontend/nextjs-middleware-context.md, tech/backend/jwt-auth-nextjs.md, tech/backend/security-headers.md, tech/backend/script-security.md, tech/backend/zod-validation.md
  답변 저장: syntheses/nextjs-security-architecture.md
  핵심 takeaway: Next.js 보안은 ① Middleware 진입점 제어(Edge Runtime, 쿠키 보존 패턴) → ② next.config.js 응답 헤더(CSP/HSTS/X-Frame-Options) → ③ JWT+HttpOnly 쿠키 토큰 관리(JWKS 분산 검증) → ④ Zod 서버사이드 입력 검증 → ⑤ XSS·CSRF·SRI 스크립트 보안의 5계층 방어 전략으로 통합

[2026-04-15 15:00] [QUERY] Next.js 데이터 페칭 & 캐싱 전략 통합 (4개 레이어 + fetch vs TanStack + 로딩 패턴)
  참조 페이지: tech/frontend/nextjs-caching.md, tech/frontend/nextjs-fetch-vs-tanstack.md, tech/frontend/loading-strategy.md, tech/frontend/tanstack-query-config.md
  답변 저장: syntheses/nextjs-data-fetching-caching.md
  핵심 takeaway: Request Memoization/Data Cache/Full Route Cache/Router Cache 4레이어 전체 지도; fetch=서버 캐시(유저 간 공유) vs TanStack=클라이언트 캐시(유저별 독립) 이분법; useQuery/useSuspenseQuery+Suspense/prefetch+HydrationBoundary 3가지 로딩 패턴 선택 기준 통합; staleTime=0 시 hydration 직후 즉시 refetch 주의사항 포함

[2026-04-15 14:30] [INGEST] Next.js fetch/TanStack 비교, Navigation Hooks, Zustand, Vue 3 (Google Drive: 12. Next/Next.js fetch vs TanStack Query.md, Next.js Navigation Hooks.md, Zustand 정리.md, 16. vue/Vue 3 완전 정리 가이드.md)
  생성: tech/frontend/nextjs-fetch-vs-tanstack.md, tech/frontend/nextjs-navigation-hooks.md, tech/frontend/zustand.md, tech/frontend/vue3.md
  업데이트: tech/frontend/tanstack-query-config.md (nextjs-fetch-vs-tanstack 역링크), tech/frontend/context-zustand.md (zustand 역링크)
  스킵: 05. git/깃 토큰.md (git-workflow.md에 이미 반영)
  핵심 takeaway: Next.js fetch(서버 캐시, 유저 간 공유) vs TanStack Query(브라우저 캐시, 유저별 독립) — prefetch+HydrationBoundary로 SSR+클라이언트 캐시 동시 활용; Navigation Hooks 4종(usePathname/useSearchParams/useRouter/useParams) App Router 완전 정리; Zustand subscribe 5가지 패턴(Canvas/분석/디바운싱/연쇄/애니메이션) + immer + 슬라이스 패턴; Vue 3 Composition API 전체 + Pinia + VeeValidate+Zod 폼

[2026-04-15 10:00] [INGEST] JS 지연평가 + Playwright 테스트 (Google Drive: 01. JS/2025-05-21.md, 14. 테스터기/01. Playwright/무제.md)
  생성: concepts/lazy-evaluation.md, tech/infra/playwright.md
  업데이트: concepts/event-loop.md (지연평가 역링크 추가), concepts/closure.md (지연평가 역링크 추가), tech/infra/dev-environment-errors.md (Playwright 역링크 추가)
  핵심 takeaway: JS Iterator Helpers API(.values().filter().map().take().toArray()) 지연평가 패턴 — take(n) 충족 시 즉시 중단으로 즉시평가 대비 불필요한 연산 제거; Playwright 7단계 플로우 설계(기능/시작페이지/행동순서/입력데이터/검증/예외/특수요구사항) + DB 오염 방지 beforeEach/afterEach 패턴

[2026-04-14 15:00] [INGEST] TanStack Query 설정 (Google Drive: 2. study/1. stack/12. Next)
  생성: tech/frontend/tanstack-query-config.md
  업데이트: (없음)
  핵심 takeaway: QueryClient 전역 설정(staleTime/gcTime/retry/refetchOnWindowFocus), staleTime vs gcTime 생애주기 다이어그램, enabled/select/refetchInterval 쿼리 옵션, initialData vs placeholderData 차이, Optimistic Update(cancelQueries→snapshot→setQueryData→rollback→onSettled), throwOnError vs QueryCache.onError 에러 전략, ReactQueryDevtools

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

[2026-04-15 00:00] [LINT]
  이슈: 9개 발견
  - 깨진 링크 9개:
    - 7개 페이지의 ## 출처에 sources/sample-rag-vs-wiki.md 링크 (파일 없음)
      → concepts/rag.md, concepts/llm-wiki.md, entities/andrej-karpathy.md, entities/obsidian.md, entities/vannevar-bush.md, syntheses/rag-vs-llm-wiki.md, tech/ai/vector-database.md
    - tech/backend/http-status-codes.md → ../rest-api.md (존재하지 않는 경로, 실제 파일: tech/backend/rest-api-conventions.md)
    - tech/frontend/tanstack-query-config.md → sources/from-obsidian/.../TanStack Query 설정.md (파일 없음)
  - 고아 페이지: 0개
  - 누락 인덱스: 0개
  수정된 페이지: concepts/rag.md, concepts/llm-wiki.md, entities/andrej-karpathy.md, entities/obsidian.md, entities/vannevar-bush.md, syntheses/rag-vs-llm-wiki.md, tech/ai/vector-database.md, tech/backend/http-status-codes.md, tech/frontend/tanstack-query-config.md
  조치: 소스 링크 7개 → 텍스트로 변환, REST API 링크 경로 수정, TanStack 소스 링크 → 텍스트로 변환

[2026-04-15 16:00] [QUERY] 신뢰할 수 있는 AI 에이전트 개발 — 프롬프트·RAG·환각 방지·Skill 4레이어 통합 전략
  참조 페이지: concepts/prompt-engineering.md, tech/ai/hallucination-prevention.md, concepts/advanced-rag.md, tech/ai/claude-skill-creation.md
  답변 저장: syntheses/ai-agent-development.md

[2026-04-15 17:00] [QUERY] 프론트엔드 상태 관리 3계층 패턴 — Context / Zustand / TanStack Query 의사결정 가이드
  참조 페이지: tech/frontend/state-management.md, tech/frontend/context-zustand.md, tech/frontend/zustand.md, tech/frontend/tanstack-query-config.md
  답변 저장: syntheses/frontend-state-management.md
  핵심 takeaway: CoT/ReAct 프롬프트로 사고 구조 강제 → Adaptive/Corrective/Self-RAG로 검색 정확도 향상 → 생성 단계 분리+출력 검증으로 환각률 20-30%→<5% 감소 → Claude Skill 8단계로 에이전트 시스템 수준 신뢰성 확보

[2026-04-15 18:00] [QUERY] 인증 & 권한 관리 통합 — JWT, Supabase RLS, n8n 프록시 패턴 크로스토픽 synthesis
  참조 페이지: tech/backend/jwt-auth-nextjs.md, tech/backend/supabase-nextjs.md, tech/n8n/n8n-chatbot-auth.md
  답변 저장: syntheses/auth-authorization.md
  핵심 takeaway: HttpOnly 쿠키 기반 JWT+Refresh 토큰 세션 관리 → Supabase RLS로 DB 행 단위 권한 제어 → n8n 같은 외부 서비스에 Next.js API Route 프록시로 Basic Auth + supabaseAccessToken 주입 — 세 레이어가 하나의 일관된 권한 모델로 통합됨. 어떤 상황에서 어떤 인증 패턴을 쓰는가 의사결정 표 포함.

[2026-04-10 00:00] [INGEST] RAG vs LLM Wiki: 지식 관리의 두 가지 접근법 (sources/sample-rag-vs-wiki.md)
  생성: concepts/rag.md, concepts/llm-wiki.md, entities/andrej-karpathy.md, entities/vannevar-bush.md, entities/obsidian.md, tech/vector-database.md, syntheses/rag-vs-llm-wiki.md
  업데이트: (없음)
  핵심 takeaway: RAG는 원본 문서를 벡터 DB로 검색하는 방식, LLM Wiki는 LLM이 직접 지식을 합성·축적하는 방식으로 서로 보완적 패러다임이며, Karpathy가 제안한 LLM Wiki는 Vannevar Bush의 Memex 비전을 AI로 구현한 것

[2026-04-15 17:00] [QUERY] React 성능 최적화 — 메모이제이션부터 Core Web Vitals까지
  참조 페이지: tech/frontend/react-rendering-optimization.md, tech/frontend/usememo-usecallback-reactmemo.md, tech/frontend/performance-measurement.md, tech/frontend/performance-checklist.md
  답변 저장: syntheses/react-performance-memoization.md
  핵심 takeaway: 메모이제이션(useMemo/useCallback/React.memo) 의사결정 흐름도 포함; Profiler 기반 진단→구조개선+메모이제이션→LCP/CLS/INP 최적화→검증 사이클 통합; React 19 Compiler 방향성 및 남용 금지 기준 정리

[2026-04-15 19:00] [QUERY] JavaScript 3대 핵심 개념 통합 — 클로저·프로토타입·이벤트 루프
  참조 페이지: concepts/closure.md, concepts/prototype.md, concepts/event-loop.md
  답변 저장: syntheses/javascript-core-concepts.md
  핵심 takeaway: 렉시컬 스코프(클로저) + [[Prototype]] 체인(상속) + Call Stack/Task Queue(비동기) 세 개념이 하나의 실행 모델에서 맞물림; 비동기 콜백에서의 Stale Closure, 프로토타입 메서드의 this 바인딩 소실, 반복문+setTimeout 함정이 세 개념의 교차점에서 발생하는 버그임을 통합 예제로 설명

[2026-04-15 20:00] [QUERY] n8n 프로덕션 AI 워크플로 통합 가이드 synthesis — 7개 n8n 페이지 크로스토픽 통합
  참조 페이지: tech/n8n/n8n-local-setup.md, tech/n8n/n8n-supabase-vector.md, tech/n8n/n8n-chatbot-auth.md, tech/n8n/n8n-ai-agent.md, tech/n8n/n8n-image-compress.md, tech/n8n/n8n-image-generation.md, tech/n8n/n8n-google-sheets.md
  답변 저장: syntheses/n8n-workflow-integration.md
  핵심 takeaway: Docker+Cloudflare Tunnel 환경 → AI Agent System Message 5원칙(날짜 주입/도구순서/분기/동의/역할 요약) → Supabase pgvector 연동(방식 A 권장, RPC JSON 형식 주의) → Next.js 프록시로 Basic Auth+Supabase token 주입(NEXT_PUBLIC_ 금지, Brotli 차단) → TinyPNG 압축(평균 60-70% 감소)→OpenAI/Gemini 이미지 생성 파이프라인 → Google Sheets 서비스 계정 방식(n8n 업데이트 환경에서 OAuth2 대신) — 6단계를 조합하면 RAG 챗봇·이미지 처리·데이터 자동화 파이프라인 구성 가능

[2026-04-15 21:00] [QUERY] RAG 품질 & 성능 최적화 실전 가이드 synthesis — 벡터 DB·유사도·검색 정확성·속도 5개 페이지 통합
  참조 페이지: tech/ai/rag-search-mechanism.md, tech/ai/vector-db-comparison.md, tech/ai/embedding-search-accuracy.md, tech/ai/rag-speed-optimization.md, tech/ai/vector-similarity.md
  답변 저장: syntheses/rag-quality-performance.md
  핵심 takeaway: pgvector(무료·<10만 문서)→Qdrant(10-100만)→Pinecone(100만+) 규모별 선택; 코사인 유사도 90% 표준(텍스트 검색에서 방향=의미 비교); Confidence 레벨(≥0.7/0.5/0.3/<0.3) 기반 Multi-Step 재검색 전략으로 False Negative 방지; 병렬처리+캐싱+경량모델로 10-15초→4-6초(60%) 단축; 4단계 진화 경로(pgvector+기본→하이브리드→병렬최적화→Qdrant/Pinecone)로 오버엔지니어링 없는 점진적 고도화

[2026-04-16 10:47] [INGEST] 하네스 엔지니어링 Codex 아티클 + TanStack Query gcTime 보완 (sources/CHANGES.md 증분 ingest)
  생성: tech/ai/codex-harness-engineering.md
  업데이트: tech/frontend/tanstack-query-config.md (gcTime/staleTime 시나리오 요약표 + "gcTime ≥ staleTime" 설정 원칙 추가)
  스킵: Zustand·Vue3·NavHooks·fetch vs TanStack·깃토큰 (2026-04-15 이미 ingest됨, 변경 없음)
  스킵: 3. TODO/* 삭제 파일 18개 (wiki 어디에도 출처로 참조 없음)
  핵심 takeaway: OpenAI Harness 팀이 5개월간 수동 코드 작성 없이 ~100만 라인 구축 — AGENTS.md=목차(~100줄)+docs/ 깊은 지식, Chrome DevTools MCP+LogQL/PromQL 관측 가능성으로 에이전트 자율 디버깅, 커스텀 린터로 아키텍처 불변 조건 강제, 황금 원칙 인코딩+doc-gardening 에이전트로 엔트로피 관리; gcTime 진행 중 재방문 시 staleTime 초과 여부로 refetch 결정 — gcTime은 항상 staleTime보다 길게 설정

[2026-04-15 22:00] [QUERY] Next.js 렌더링 전략과 SEO — 렌더링·캐싱·메타데이터·Core Web Vitals 통합 의사결정 가이드
  참조 페이지: concepts/ssr-ssg-isr-csr.md, tech/frontend/nextjs-image-metadata-seo.md, tech/frontend/nextjs-caching.md, tech/frontend/performance-measurement.md
  답변 저장: syntheses/rendering-strategy-seo.md
  핵심 takeaway: 페이지 콘텐츠 특성(정적/주기적 변경/요청마다 다름/인증)에 따라 SSG→ISR→SSR→CSR 순서로 전략 선택; 각 렌더링 전략이 Full Route Cache/Data Cache/Request Memoization/Router Cache 4레이어와 1:1 대응; generateMetadata의 fetch는 Request Memoization으로 페이지 본문 fetch와 공유되어 추가 비용 없음; LCP≤2.5s는 SSG/ISR CDN+Image priority, CLS≤0.1은 width/height 명시+blur placeholder, INP≤200ms는 번들 스플리팅+Long Task 분리로 달성
