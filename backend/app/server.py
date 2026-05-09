"""FastAPI 路由"""

import json
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from app.config import EMBEDDING_MODEL
from app.db import (
    init_db,
    get_paper_by_arxiv_id,
    get_paper_by_id,
    create_paper,
    update_paper,
    update_paper_rag_status,
    delete_paper as db_delete_paper,
    list_papers,
    get_dashboard_stats,
    create_qa_log,
    list_qa_logs,
    list_events,
    delete_rag_chunks_by_paper,
)
from app.schemas import (
    PaperCreate,
    PaperBatchCreate,
    PaperUpdate,
    RagIndexRequest,
    AskRequest,
)
from app.abstract_indexer import (
    index_pending_papers,
    reindex_paper,
    delete_paper_from_chroma,
)
from app.rag import search_abstracts
from app.llm import generate_answer
from app.events import log_event


@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用启动时初始化数据库"""
    init_db()
    log_event("server_started", "Paper Watcher Backend started")
    yield


app = FastAPI(title="Paper Watcher Backend", version="0.1.0", lifespan=lifespan)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 所有路由挂载在 /api/paper 前缀下
API_PREFIX = "/api/paper"


# ========== Health ==========

@app.get(f"{API_PREFIX}/health")
def health_check():
    from app.db import get_db
    try:
        get_db().execute("SELECT 1")
        db_status = "ok"
    except Exception:
        db_status = "error"

    try:
        from app.abstract_indexer import get_collection
        get_collection()
        rag_status = "ok"
    except Exception:
        rag_status = "error"

    return {
        "status": "ok" if db_status == "ok" and rag_status == "ok" else "degraded",
        "db": db_status,
        "rag": rag_status,
        "embedding_model": EMBEDDING_MODEL,
    }


# ========== Dashboard ==========

@app.get(f"{API_PREFIX}/dashboard")
def dashboard():
    return get_dashboard_stats()


# ========== Papers ==========

@app.post(f"{API_PREFIX}/papers", status_code=201)
def create_or_update_paper(paper: PaperCreate):
    existing = get_paper_by_arxiv_id(paper.arxiv_id)

    if existing is None:
        # 创建新论文
        paper_id = create_paper(paper.model_dump())
        log_event("paper_created", f"Created paper {paper_id}: {paper.title}",
                  {"paper_id": paper_id, "arxiv_id": paper.arxiv_id})
        return {"paper_id": paper_id, "status": "created", "rag_status": "pending"}

    # 已存在，检查是否需要更新
    changes = {}
    for field in ["title", "authors", "abstract", "pdf_url", "source_url", "published_at"]:
        new_val = getattr(paper, field)
        if new_val is not None and new_val != existing.get(field):
            changes[field] = new_val

    if not changes:
        return {"paper_id": existing["id"], "status": "exists", "rag_status": existing["rag_status"]}

    update_paper(existing["id"], changes)
    new_rag_status = "pending" if "abstract" in changes else existing["rag_status"]
    log_event("paper_updated", f"Updated paper {existing['id']}: {paper.title}",
              {"paper_id": existing["id"], "arxiv_id": paper.arxiv_id, "changes": list(changes.keys())})
    return {"paper_id": existing["id"], "status": "updated", "rag_status": new_rag_status}


@app.post(f"{API_PREFIX}/papers/batch", status_code=201)
def batch_create_or_update_papers(batch: PaperBatchCreate):
    created_count = 0
    updated_count = 0
    exists_count = 0
    failed_count = 0
    items = []

    for paper in batch.papers:
        try:
            existing = get_paper_by_arxiv_id(paper.arxiv_id)

            if existing is None:
                paper_id = create_paper(paper.model_dump())
                created_count += 1
                items.append({
                    "arxiv_id": paper.arxiv_id,
                    "paper_id": paper_id,
                    "status": "created",
                    "rag_status": "pending",
                })
            else:
                changes = {}
                for field in ["title", "authors", "abstract", "pdf_url", "source_url", "published_at"]:
                    new_val = getattr(paper, field)
                    if new_val is not None and new_val != existing.get(field):
                        changes[field] = new_val

                if not changes:
                    exists_count += 1
                    items.append({
                        "arxiv_id": paper.arxiv_id,
                        "paper_id": existing["id"],
                        "status": "exists",
                        "rag_status": existing["rag_status"],
                    })
                else:
                    update_paper(existing["id"], changes)
                    new_rag_status = "pending" if "abstract" in changes else existing["rag_status"]
                    updated_count += 1
                    items.append({
                        "arxiv_id": paper.arxiv_id,
                        "paper_id": existing["id"],
                        "status": "updated",
                        "rag_status": new_rag_status,
                    })
        except Exception:
            failed_count += 1
            items.append({
                "arxiv_id": paper.arxiv_id,
                "paper_id": 0,
                "status": "failed",
                "rag_status": "pending",
            })

    log_event("papers_batch", f"Batch: created={created_count}, updated={updated_count}, exists={exists_count}",
              {"created": created_count, "updated": updated_count, "exists": exists_count, "failed": failed_count})

    return {
        "created_count": created_count,
        "updated_count": updated_count,
        "exists_count": exists_count,
        "failed_count": failed_count,
        "items": items,
    }


@app.get(f"{API_PREFIX}/papers")
def get_papers(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    keyword: str = Query(default=""),
    rag_status: str = Query(default=""),
    source: str = Query(default=""),
    start_date: str = Query(default=""),
    end_date: str = Query(default=""),
):
    items, total = list_papers(limit, offset, keyword, rag_status, source, start_date, end_date)
    # 列表接口不返回 abstract 全文
    for item in items:
        item.pop("abstract", None)
        item.pop("summary_status", None)
    return {"items": items, "total": total, "limit": limit, "offset": offset}


@app.get(f"{API_PREFIX}/papers/{{paper_id}}")
def get_paper_detail(paper_id: int):
    paper = get_paper_by_id(paper_id)
    if not paper:
        raise HTTPException(status_code=404, detail={
            "success": False,
            "data": None,
            "error": {"code": "PAPER_NOT_FOUND", "message": "Paper not found"}
        })
    return paper


@app.patch(f"{API_PREFIX}/papers/{{paper_id}}")
def patch_paper(paper_id: int, data: PaperUpdate):
    paper = get_paper_by_id(paper_id)
    if not paper:
        raise HTTPException(status_code=404, detail={
            "success": False,
            "data": None,
            "error": {"code": "PAPER_NOT_FOUND", "message": "Paper not found"}
        })

    changes = {k: v for k, v in data.model_dump().items() if v is not None}
    if not changes:
        return {"paper_id": paper_id, "status": "unchanged", "rag_status": paper["rag_status"]}

    update_paper(paper_id, changes)
    new_rag_status = "pending" if "abstract" in changes else paper["rag_status"]
    log_event("paper_updated", f"Patched paper {paper_id}",
              {"paper_id": paper_id, "changes": list(changes.keys())})
    return {"paper_id": paper_id, "status": "updated", "rag_status": new_rag_status}


@app.delete(f"{API_PREFIX}/papers/{{paper_id}}")
def delete_paper_endpoint(paper_id: int):
    paper = get_paper_by_id(paper_id)
    if not paper:
        raise HTTPException(status_code=404, detail={
            "success": False,
            "data": None,
            "error": {"code": "PAPER_NOT_FOUND", "message": "Paper not found"}
        })

    # 删除 Chroma 向量
    delete_paper_from_chroma(paper_id)
    # 删除数据库记录（包括 rag_chunks）
    db_delete_paper(paper_id)

    log_event("paper_deleted", f"Deleted paper {paper_id}",
              {"paper_id": paper_id, "arxiv_id": paper["arxiv_id"]})
    return {"paper_id": paper_id, "status": "deleted"}


# ========== RAG ==========

@app.post(f"{API_PREFIX}/rag/index")
def rag_index(req: RagIndexRequest):
    result = index_pending_papers(req.limit)
    return result


@app.post(f"{API_PREFIX}/rag/reindex/{{paper_id}}")
def rag_reindex(paper_id: int):
    paper = get_paper_by_id(paper_id)
    if not paper:
        raise HTTPException(status_code=404, detail={
            "success": False,
            "data": None,
            "error": {"code": "PAPER_NOT_FOUND", "message": "Paper not found"}
        })

    try:
        result = reindex_paper(paper_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail={
            "success": False,
            "data": None,
            "error": {"code": "REINDEX_FAILED", "message": str(e)}
        })


# ========== Ask ==========

@app.post(f"{API_PREFIX}/ask")
def ask_question(req: AskRequest):
    # 检索相关 abstract
    sources = search_abstracts(req.question, req.top_k)

    # 生成回答
    answer = generate_answer(req.question, sources)

    # 记录 QA 日志
    source_ids = json.dumps([s["paper_id"] for s in sources])
    create_qa_log(req.question, answer, source_ids)

    return {"answer": answer, "sources": sources}


# ========== Events ==========

@app.get(f"{API_PREFIX}/events")
def get_events(
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
    event_type: str = Query(default=""),
):
    items, total = list_events(limit, offset, event_type)
    return {"items": items, "total": total, "limit": limit, "offset": offset}


# ========== QA Logs ==========

@app.get(f"{API_PREFIX}/qa-logs")
def get_qa_logs(
    limit: int = Query(default=50, ge=1, le=200),
    offset: int = Query(default=0, ge=0),
):
    items, total = list_qa_logs(limit, offset)
    return {"items": items, "total": total, "limit": limit, "offset": offset}
