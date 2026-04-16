# Wiki Index

> Claude가 자동 관리하는 지식 카탈로그. 수동 편집 금지.

**마지막 업데이트**: 2026-04-16  
**총 페이지**: 96

---

## Concepts (10)

- [RAG](concepts/rag.md) — 쿼리 시점에 벡터 DB에서 문서를 검색해 LLM 컨텍스트로 제공하는 방식
- [LLM Wiki](concepts/llm-wiki.md) — LLM이 직접 마크다운 위키를 작성·유지하며 지식을 복리로 축적하는 방식
- [고급 RAG 패턴](concepts/advanced-rag.md) — Adaptive/Corrective/Self-RAG로 기본 RAG의 한계(검색 실패, 환각)를 극복
- [청킹](concepts/chunking.md) — RAG 문서를 검색 단위로 분할하는 전략 (재귀적 분할, Parent-Child 등)
- [프롬프트 엔지니어링](concepts/prompt-engineering.md) — Zero-shot, CoT, ReAct 등 LLM 출력을 제어하는 기법 모음
- [클로저](concepts/closure.md) — 함수 선언 시 렉시컬 환경을 기억해 외부 스코프에 접근하는 JavaScript 핵심 메커니즘
- [이벤트 루프와 비동기](concepts/event-loop.md) — JavaScript 단일 스레드에서 비동기 작업(Macro/Microtask Queue)을 처리하는 메커니즘
- [프로토타입](concepts/prototype.md) — JavaScript 상속 메커니즘, 모든 객체는 프로토타입 체인으로 속성·메서드를 공유
- [SSR/SSG/ISR/CSR](concepts/ssr-ssg-isr-csr.md) — Next.js 4가지 렌더링 전략, 콘텐츠 특성과 성능 요구에 따라 선택
- [지연평가 (Lazy Evaluation)](concepts/lazy-evaluation.md) — Iterator Helpers API로 필요한 원소만 계산, .take()로 조기 중단

---

## Entities (6)

- [Andrej Karpathy](entities/andrej-karpathy.md) — LLM Wiki 개념 제안자, 전 Tesla AI 디렉터·OpenAI 공동창업자
- [Vannevar Bush](entities/vannevar-bush.md) — 1945년 Memex 제안, 하이퍼텍스트와 개인 지식 관리의 선구자
- [Obsidian](entities/obsidian.md) — 마크다운 기반 PKM 도구, LLM Wiki의 이상적 플랫폼
- [LangChain](entities/langchain.md) — LLM 앱 구축 프레임워크, 선형 RAG 파이프라인에 적합
- [LangGraph](entities/langgraph.md) — 그래프 기반 AI 오케스트레이션, 고급 RAG·멀티에이전트에 사용
- [n8n](entities/n8n.md) — 노코드 워크플로우 자동화 도구, AI Agent·API 연동에 활용

---

## Books (0)

_아직 없음_

---

## Tech (67)

- [벡터 데이터베이스](./tech/ai/vector-database.md) — RAG의 핵심 인프라, 임베딩 벡터 저장 및 유사도 검색
- [임베딩 모델](./tech/ai/embedding-models.md) — 텍스트를 벡터로 변환, OpenAI/Cohere/오픈소스 비교
- [벡터 유사도 측정](./tech/ai/vector-similarity.md) — 코사인/유클리드/내적 비교, 텍스트 검색엔 코사인이 표준
- [임베딩 검색 정확성 향상](./tech/ai/embedding-search-accuracy.md) — Multi-Step 검색, Confidence 레벨, 재검색 전략
- [Docker](./tech/infra/docker.md) — 컨테이너 기반 이식성 플랫폼, Image·Container·Volume 개념
- [중앙 집중식 에러 처리](./tech/backend/centralized-error-handling.md) — Next.js 전체 에러를 단일 핸들러로 모아 처리하는 패턴
- [오케스트레이터 아키텍처](./tech/ai/orchestrator-architecture.md) — LLM이 서브에이전트·스킬·도구를 조율하는 멀티에이전트 설계
- [Claude Code 개념](./tech/ai/claude-code-concepts.md) — Skill(가이드)/Subagent(독립 에이전트)/Command(단축 명령) 차이
- [React 렌더링 최적화](./tech/frontend/react-rendering-optimization.md) — 불필요한 리렌더링을 방지하는 React.memo/useMemo/useCallback 패턴
- [useMemo vs useCallback vs React.memo](./tech/frontend/usememo-usecallback-reactmemo.md) — 세 메모이제이션 API의 차이, 동작 원리, 올바른 사용 기준
- [useEffect](./tech/frontend/use-effect.md) — 컴포넌트를 외부 시스템과 동기화하는 React 훅, 사이드 이펙트 선언적 관리
- [useTransition](./tech/frontend/use-transition.md) — React 18+ Concurrent 렌더링에서 비긴급 업데이트를 낮은 우선순위로 처리
- [프론트엔드 상태 관리](./tech/frontend/state-management.md) — Context/Zustand/TanStack Query 등 React 상태 관리 패턴 비교
- [Node Runtime & Edge Runtime](./tech/frontend/node-edge-runtime.md) — Node.js 완전 지원 vs 초경량 엣지 런타임, 선택 기준
- [Next.js Image·Metadata·SEO](./tech/frontend/nextjs-image-metadata-seo.md) — 이미지 최적화, 메타데이터 관리, SEO 내장 API
- [성능 측정 및 개선](./tech/frontend/performance-measurement.md) — Core Web Vitals(LCP/CLS/INP) 중심 성능 측정과 개선 방법론
- [성능 개선 체크리스트](./tech/frontend/performance-checklist.md) — 로딩·렌더링·네트워크 관점 프론트엔드 성능 체크리스트
- [Context와 Zustand](./tech/frontend/context-zustand.md) — React Context API vs Zustand 심층 비교, App Router에서 올바른 사용 시나리오
- [TypeScript](tech/typescript.md) — 정적 타입 시스템, 제네릭·유틸리티 타입·타입 가드·React 패턴
- [스크립트 태그 보안](./tech/backend/script-security.md) — XSS·CSRF·CSP·SRI 등 script 태그 관련 웹 보안 위협과 방어 기법
- [웹뷰 기본 지식](./tech/frontend/webview-basics.md) — 모바일 앱 WebView 개념, 브릿지 통신, iOS 이슈
- [기초 CS](tech/cs-fundamentals.md) — 웹 개발자를 위한 네트워크·브라우저·메모리·운영체제 기초
- [JWT 인증 — Next.js 구현](./tech/backend/jwt-auth-nextjs.md) — JWKS 흐름, HttpOnly 쿠키, Access+Refresh 토큰 패턴
- [보안 헤더](./tech/backend/security-headers.md) — CSP, HSTS, X-Frame-Options 등 HTTP 보안 헤더 종류와 Next.js 설정
- [Open Redirect 취약점](./tech/backend/open-redirect.md) — 공격 시나리오와 상대 경로·화이트리스트·URL 파싱 방어법
- [HTTP 상태 코드](./tech/backend/http-status-codes.md) — 1xx~5xx 전 범주 분류 및 실무 빠른 참조 테이블
- [Next.js Middleware vs Context](./tech/frontend/nextjs-middleware-context.md) — Middleware와 Context 선택 기준, NextResponse.redirect 쿠키 보존
- [Supabase — Next.js 연동](./tech/backend/supabase-nextjs.md) — TypeScript 타입 자동 생성, CRUD, RLS, Server Component 사용법
- [SQL CRUD와 고급 쿼리](./tech/backend/sql-crud.md) — INSERT/SELECT/UPDATE/DELETE, JOIN, 집계 함수 실무 패턴
- [Zod — 스키마 유효성 검증](./tech/backend/zod-validation.md) — 런타임 검증 + TypeScript 타입 추론, React Hook Form 연동
- [Next.js 캐싱 전략](./tech/frontend/nextjs-caching.md) — 4가지 캐싱 레이어(Request Memoization/Data/Full Route/Router Cache)
- [RAG 문서 검색 메커니즘](./tech/ai/rag-search-mechanism.md) — 청킹→임베딩→벡터 저장→유사도 검색, 하이브리드 전략
- [벡터 DB 검색속도 비교](./tech/ai/vector-db-comparison.md) — pgvector vs Qdrant vs Pinecone 속도/비용/선택 가이드
- [RAG 속도 개선](./tech/ai/rag-speed-optimization.md) — 병렬처리·캐싱·빠른 모델로 Ultra-RAG를 60% 단축
- [할루시네이션 방지](./tech/ai/hallucination-prevention.md) — 프롬프트 설계, 단계 분리, 출력 검증으로 LLM 환각 감소
- [SQL 테이블 설계](./tech/backend/sql-table-design.md) — CREATE TABLE, 제약조건, 외래키, RLS, 인덱스
- [Claude Skill 만들기 팁](./tech/ai/claude-skill-creation.md) — 8단계 프롬프트로 스킬 문서 점진적 고도화
- [모노레포 — Turborepo 기초](./tech/infra/monorepo-turborepo.md) — pnpm workspace + tsconfig 경로 별칭 설정
- [결제 시스템](./tech/backend/payment-system.md) — PG사 SDK 결제창, 서버 금액 검증, 중복 결제 방지
- [n8n Chatbot 인가](./tech/n8n/n8n-chatbot-auth.md) — Basic Auth + Supabase 토큰 주입 Next.js 프록시 패턴
- [Git 워크플로우](./tech/infra/git-workflow.md) — git stash로 작업 임시 저장·복원
- [Next.js 환경변수 관리](./tech/frontend/nextjs-env-vars.md) — NEXT_PUBLIC_ 규칙, .env 우선순위, 민감 정보 분류
- [REST API 규약](./tech/backend/rest-api-conventions.md) — URL 명사화·복수형·하이픈, HTTP 메서드, 버전 관리
- [React Query 로딩 전략](./tech/frontend/loading-strategy.md) — useQuery vs Suspense vs 서버 프리패칭+HydrationBoundary
- [TanStack Query 설정 & 고급 패턴](./tech/frontend/tanstack-query-config.md) — staleTime/gcTime, Optimistic Update, Mutation 패턴, 에러 핸들링
- [LangGraph 아키텍처 핵심 개념](./tech/ai/langgraph-architecture.md) — Node/Edge/State/순환 구조/비동기 처리
- [Next.js 국제화 (next-intl)](./tech/frontend/nextjs-i18n.md) — [locale] 라우팅, 번역 JSON, Middleware 언어 감지
- [n8n AI Agent 노드 설정](./tech/n8n/n8n-ai-agent.md) — System Message 설계, Chat Trigger 공개, metadata 전달 방법
- [n8n 로컬 셋팅](./tech/n8n/n8n-local-setup.md) — Docker 설치 + Cloudflare Tunnel로 Webhook URL 확보
- [n8n Supabase 벡터 연동](./tech/n8n/n8n-supabase-vector.md) — pgvector 테이블/함수 설계, RPC 호출 오류 처리
- [n8n 이미지 생성 워크플로](./tech/n8n/n8n-image-generation.md) — OpenAI gpt-image-1 / Gemini API 비교 및 구현
- [n8n 구글 시트 연동](./tech/n8n/n8n-google-sheets.md) — Service Account 방식 단계별 설정
- [n8n 이미지 압축](./tech/n8n/n8n-image-compress.md) — TinyPNG API HTTP 노드로 이미지 압축 전처리
- [n8n 트러블슈팅](./tech/n8n/n8n-troubleshooting.md) — Brotli 오류, 봇 차단 403, Loop 미작동, Vercel 환경변수
- [n8n GA4 데이터 분석](./tech/n8n/n8n-ga4-analysis.md) — 네트워크 모니터링용 GA4 dimensions/metrics 중요도 분류
- [Claude Code 명령어 & 워크플로우](./tech/ai/claude-code-commands.md) — claude -resume, /logout, /status, 5단계 구현 패턴
- [Python RAG 구현](./tech/ai/rag-python-implementation.md) — LangChain+FAISS 기본 RAG, LangGraph 멀티에이전트 구조
- [Codex 에이전트 우선 개발](./tech/ai/codex-harness-engineering.md) — 코드 직접 작성 없이 AI가 100만 라인 생성한 Harness Engineering 방법론
- [프론트엔드 실전 에러 패턴](./tech/frontend/frontend-error-patterns.md) — React Hook Form 리렌더링, searchParam 인코딩, Zustand 초기화, recharts/shadcn
- [MCP 서버 개발](./tech/ai/mcp-server-development.md) — TypeScript MCP 서버 구현, 임베딩+웹 검색 fallback 패턴
- [spec-kit — SDD 도구](./tech/infra/spec-kit.md) — GitHub의 의도 중심 개발 도구, 7단계 워크플로우
- [개발 환경 에러 패턴](./tech/infra/dev-environment-errors.md) — CORS(file:// fetch), EPERM(.next 파일 잠금) 해결
- [Playwright E2E 테스트](./tech/infra/playwright.md) — 설치, 테스트 플로우 7단계 체크리스트, DB 오염 방지 패턴
- [Next.js fetch vs TanStack Query](./tech/frontend/nextjs-fetch-vs-tanstack.md) — 서버/클라이언트 캐시 차이, prefetch+HydrationBoundary, React.cache()
- [Next.js Navigation Hooks](./tech/frontend/nextjs-navigation-hooks.md) — usePathname/useSearchParams/useRouter/useParams, 서버 컴포넌트 접근
- [Zustand 완전 정리](./tech/frontend/zustand.md) — subscribe, persist/immer 미들웨어, 슬라이스 패턴
- [Vue 3 완전 정리](./tech/frontend/vue3.md) — Composition API, Pinia, Vue Router, VeeValidate+Zod, TanStack Vue Query

---

## Syntheses (13)

- [RAG vs LLM Wiki 비교](syntheses/rag-vs-llm-wiki.md) — 검색 중심 vs. 축적 중심 지식 관리 패러다임 상세 비교
- [멀티에이전트 구조에서 고급 RAG 패턴 적용](syntheses/multi-agent-rag.md) — Main Agent = Adaptive RAG 라우터, Sub Agent = Corrective+Self-RAG 아키텍처
- [DeepAgent vs LangChain vs LangGraph](syntheses/deepagent-langchain-langgraph.md) — 세 프레임워크의 계층 구조와 선택 기준
- [Next.js 데이터 페칭 & 캐싱 전략 통합 가이드](syntheses/nextjs-data-fetching-caching.md) — 4개 캐싱 레이어·fetch vs TanStack Query·로딩 패턴을 하나의 의사결정 로드맵으로 통합
- [신뢰할 수 있는 AI 에이전트 개발](syntheses/ai-agent-development.md) — 프롬프트 설계→고급 RAG→환각 방지→Skill 고도화의 4레이어 신뢰성 전략
- [프론트엔드 상태 관리 계층화](syntheses/frontend-state-management.md) — Context(정적 전역) / Zustand(동적 전역) / TanStack Query(서버) 3계층 의사결정 가이드
- [Next.js 보안 아키텍처](syntheses/nextjs-security-architecture.md) — Middleware 진입점 제어부터 JWT·Zod·XSS 방어까지 계층형 방어 전략 통합
- [인증 & 권한 관리 통합](syntheses/auth-authorization.md) — JWT+HttpOnly 쿠키 세션 관리, Supabase RLS DB 권한, n8n 프록시 토큰 주입을 하나의 인증 아키텍처로 통합
- [React 성능 최적화 — 메모이제이션부터 Core Web Vitals까지](syntheses/react-performance-memoization.md) — 리렌더링 진단·메모이제이션 의사결정·Core Web Vitals 측정을 진단→최적화→검증 사이클로 통합
- [n8n 프로덕션 AI 워크플로 통합 가이드](syntheses/n8n-workflow-integration.md) — Docker+Cloudflare Tunnel 설정부터 AI Agent·벡터 검색·챗봇 인증·이미지 처리·Google Sheets를 조합하는 프로덕션 파이프라인 가이드
- [RAG 품질 & 성능 최적화 실전 가이드](syntheses/rag-quality-performance.md) — 벡터 DB 선택·유사도 측정·검색 정확성·속도 최적화를 단계별로 연결하는 실전 RAG 구축 가이드
- [JavaScript 동작 원리 3대 핵심](syntheses/javascript-core-concepts.md) — 클로저(렉시컬 스코프)·프로토타입(상속)·이벤트 루프(비동기)가 실제 코드에서 어떻게 함께 작동하는지 통합 분석
- [Next.js 렌더링 전략과 SEO](syntheses/rendering-strategy-seo.md) — 콘텐츠 특성에 따른 SSG/ISR/SSR/CSR 선택, 캐싱 연동, generateMetadata, Core Web Vitals 통합 의사결정 가이드
