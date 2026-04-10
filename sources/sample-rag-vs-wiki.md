# RAG vs LLM Wiki: 지식 관리의 두 가지 접근법

## RAG (Retrieval-Augmented Generation)

RAG는 쿼리 시점에 원본 문서를 검색하여 LLM에 컨텍스트로 제공하는 방식이다.
벡터 데이터베이스에 문서를 임베딩으로 저장하고, 질문과 유사한 청크를 검색한다.

**장점**: 구현이 단순하고, 원본 문서를 그대로 보존한다.  
**단점**: 크로스 문서 연결이 없고, 지식이 축적되지 않는다.

## LLM Wiki

LLM이 소스를 읽고 직접 마크다운 위키 페이지를 작성·유지한다.
새 소스가 들어올 때마다 기존 페이지들을 업데이트하고 상호참조를 추가한다.

**장점**: 지식이 복리로 축적되고, 개념들이 서로 연결된다.  
**단점**: LLM이 실수할 수 있고, 초기 설정이 필요하다.

## 핵심 인물

- **Andrej Karpathy**: LLM Wiki 개념을 제안한 AI 연구자. 전 Tesla AI 디렉터, OpenAI 공동창업자.
- **Vannevar Bush**: 1945년 Memex 개념 제안. LLM Wiki의 역사적 선례.

## 관련 기술

- **벡터 데이터베이스**: Pinecone, Weaviate, Chroma 등. RAG의 핵심 인프라.
- **Obsidian**: 마크다운 기반 개인 지식 관리 도구. LLM Wiki의 이상적인 플랫폼.
