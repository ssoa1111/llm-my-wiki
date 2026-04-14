# Python RAG 구현 — LangChain + LangGraph

> LangChain으로 기본 RAG 시스템을 구축하고, LangGraph로 멀티에이전트 구조로 확장하는 단계별 구현 패턴.

## 핵심 내용

### Phase 0: 프로젝트 설계

**5단계 로드맵**

```
Phase 1: Python 환경 세팅
Phase 2: 기본 RAG 구현 (LangChain + FAISS)
Phase 3: 멀티에이전트 구조 (LangGraph)
Phase 4: 고급 RAG 패턴 (Adaptive/Corrective/Self-RAG)
Phase 5: FastAPI 서버화
```

**기술 스택**

| 역할 | 라이브러리 |
|------|-----------|
| 오케스트레이션 | LangGraph 0.2.60 |
| RAG 파이프라인 | LangChain 0.3.13 |
| 벡터 DB | FAISS (로컬), Supabase pgvector (서버) |
| 임베딩 | OpenAI text-embedding-3-small |
| LLM | OpenAI GPT-4o-mini |
| API 서버 | FastAPI |

**프로젝트 구조**

```
rag-project/
├── main.py
├── agents/
│   ├── main_agent.py
│   └── pdf_agent.py
├── tools/
│   └── pdf_tools.py
├── data/
│   └── pdfs/
└── requirements.txt
```

---

### Phase 1: 환경 세팅

```bash
# 가상환경 생성 & 활성화
python -m venv venv
source venv/bin/activate       # Mac/Linux
venv\Scripts\activate          # Windows

# requirements.txt
langchain==0.3.13
langchain-openai==0.2.14
langchain-community==0.3.13
langgraph==0.2.60
faiss-cpu==1.9.0
pypdf==5.1.0
python-dotenv==1.0.1
fastapi==0.115.6
uvicorn==0.32.1

pip install -r requirements.txt
```

**OpenAI 연결 테스트**

```python
from langchain_openai import ChatOpenAI

llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)
response = llm.invoke("테스트 메시지")
print(response.content)
```

---

### Phase 2: 기본 RAG (SimpleRAG)

```python
from langchain_community.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain.chains import RetrievalQA

def load_pdf(file_path: str):
    """PDF 로드 → 청킹 → 벡터 저장"""
    loader = PyPDFLoader(file_path)
    documents = loader.load()
    
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50
    )
    chunks = splitter.split_documents(documents)
    
    embeddings = OpenAIEmbeddings()
    vectorstore = FAISS.from_documents(chunks, embeddings)
    return vectorstore

class SimpleRAG:
    def __init__(self, pdf_path: str):
        vectorstore = load_pdf(pdf_path)
        self.qa_chain = RetrievalQA.from_chain_type(
            llm=ChatOpenAI(model="gpt-4o-mini"),
            chain_type="stuff",
            retriever=vectorstore.as_retriever(search_kwargs={"k": 3})
        )
    
    def answer(self, question: str) -> str:
        result = self.qa_chain.invoke({"query": question})
        return result["result"]

# 실행
if __name__ == "__main__":
    rag = SimpleRAG("data/pdfs/document.pdf")
    while True:
        q = input("질문: ")
        print(rag.answer(q))
```

---

### Phase 3: 멀티에이전트 구조 (LangGraph)

**아키텍처**: MainAgent(라우터) → PDFAgent(검색+답변)

```python
from typing import TypedDict
from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI

# 1. 공유 상태 정의
class AgentState(TypedDict):
    query: str
    agent_type: str    # "pdf" | "general"
    answer: str

# 2. PDF 전문 에이전트
class PDFAgent:
    def __init__(self, vectorstore):
        self.retriever = vectorstore.as_retriever(search_kwargs={"k": 3})
        self.llm = ChatOpenAI(model="gpt-4o-mini")
    
    def generate_answer(self, state: AgentState) -> AgentState:
        docs = self.retriever.invoke(state["query"])
        context = "\n".join([d.page_content for d in docs])
        
        response = self.llm.invoke(
            f"컨텍스트:\n{context}\n\n질문: {state['query']}"
        )
        return {**state, "answer": response.content}

# 3. 메인 에이전트 (라우터)
class MainAgent:
    def __init__(self):
        self.llm = ChatOpenAI(model="gpt-4o-mini")
    
    def route(self, state: AgentState) -> AgentState:
        prompt = f"""다음 질문을 분류하세요:
질문: {state['query']}

PDF 문서 관련이면 'pdf', 일반 질문이면 'general' 중 하나만 답하세요."""
        
        result = self.llm.invoke(prompt)
        agent_type = "pdf" if "pdf" in result.content.lower() else "general"
        return {**state, "agent_type": agent_type}

# 4. LangGraph 워크플로우 조립
def create_workflow(vectorstore):
    main_agent = MainAgent()
    pdf_agent = PDFAgent(vectorstore)
    
    workflow = StateGraph(AgentState)
    
    # 노드 추가
    workflow.add_node("router", main_agent.route)
    workflow.add_node("pdf_agent", pdf_agent.generate_answer)
    workflow.add_node("general", lambda s: {**s, "answer": "일반 질문입니다."})
    
    # 엣지 정의
    workflow.set_entry_point("router")
    workflow.add_conditional_edges(
        "router",
        lambda s: s["agent_type"],        # 라우팅 함수
        {"pdf": "pdf_agent", "general": "general"}
    )
    workflow.add_edge("pdf_agent", END)
    workflow.add_edge("general", END)
    
    return workflow.compile()
```

**StateGraph 핵심 개념**

| 메서드 | 역할 |
|--------|------|
| `add_node(name, fn)` | 상태를 받아 상태를 반환하는 노드 등록 |
| `set_entry_point(name)` | 시작 노드 지정 |
| `add_edge(a, b)` | a → b 고정 연결 |
| `add_conditional_edges(node, fn, mapping)` | 함수 반환값에 따라 분기 |
| `compile()` | 실행 가능한 체인으로 변환 |

## 관련 페이지

- [RAG 문서 검색 메커니즘](./rag-search-mechanism.md) — 청킹→임베딩→검색 파이프라인
- [LangGraph 아키텍처 핵심 개념](./langgraph-architecture.md) — Node/Edge/State 개념
- [멀티에이전트 구조에서 고급 RAG 패턴 적용](../../syntheses/multi-agent-rag.md) — 실전 아키텍처
- [벡터 데이터베이스](./vector-database.md) — FAISS vs Supabase pgvector

## 출처

- Phase 0 RAG 시스템 구축 계획서 — 2026-04-14
- Phase 1 Python 환경 세팅 — 2026-04-14
- Phase 2 RAG 만들기 — 2026-04-14
- Phase 3 멀티 에이전트 구조 구축 — 2026-04-14
