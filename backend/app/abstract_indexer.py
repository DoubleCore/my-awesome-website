"""Abstract 写入 Chroma"""

import chromadb
from pathlib import Path

from app.config import PAPER_WATCHER_CHROMA_DIR
from app.embedder import embed_texts
from app.db import (
    get_pending_papers,
    create_rag_chunk,
    delete_rag_chunks_by_paper,
    update_paper_rag_status,
    get_paper_by_id,
)
from app.events import log_event

_client: chromadb.ClientAPI | None = None
_collection: chromadb.Collection | None = None

COLLECTION_NAME = "paper_abstracts"


def get_chroma_client() -> chromadb.ClientAPI:
    global _client
    if _client is None:
        chroma_dir = Path(PAPER_WATCHER_CHROMA_DIR)
        chroma_dir.mkdir(parents=True, exist_ok=True)
        _client = chromadb.PersistentClient(path=str(chroma_dir))
    return _client


def get_collection() -> chromadb.Collection:
    global _collection
    if _collection is None:
        client = get_chroma_client()
        _collection = client.get_or_create_collection(
            name=COLLECTION_NAME,
            metadata={"hnsw:space": "cosine"}
        )
    return _collection


def make_chroma_id(paper_id: int) -> str:
    return f"paper_{paper_id}_abstract"


def index_pending_papers(limit: int = 50) -> dict:
    """索引待处理的论文 abstract"""
    papers = get_pending_papers(limit)
    if not papers:
        return {"indexed_count": 0, "failed_count": 0, "items": []}

    indexed_items = []
    failed_count = 0

    # 批量设置为 indexing
    for paper in papers:
        update_paper_rag_status(paper["id"], "indexing")

    # 批量生成 embedding
    abstracts = [p["abstract"] for p in papers]
    try:
        embeddings = embed_texts(abstracts)
    except Exception as e:
        # 全部失败
        for paper in papers:
            update_paper_rag_status(paper["id"], "failed")
            log_event("rag_failed", f"Embedding failed for paper {paper['id']}: {str(e)}",
                      {"paper_id": paper["id"]})
        return {"indexed_count": 0, "failed_count": len(papers), "items": []}

    collection = get_collection()

    for i, paper in enumerate(papers):
        chroma_id = make_chroma_id(paper["id"])
        try:
            # 先删除旧的（如果存在）
            try:
                collection.delete(ids=[chroma_id])
            except Exception:
                pass

            collection.add(
                ids=[chroma_id],
                embeddings=[embeddings[i]],
                documents=[paper["abstract"]],
                metadatas=[{
                    "paper_id": paper["id"],
                    "arxiv_id": paper["arxiv_id"],
                    "title": paper["title"],
                }]
            )

            # 删除旧 chunk 记录，创建新的
            delete_rag_chunks_by_paper(paper["id"])
            create_rag_chunk(paper["id"], paper["abstract"], chroma_id)
            update_paper_rag_status(paper["id"], "indexed")

            indexed_items.append({
                "paper_id": paper["id"],
                "arxiv_id": paper["arxiv_id"],
                "status": "indexed",
                "chroma_id": chroma_id,
            })

            log_event("rag_indexed", f"Indexed paper {paper['id']}",
                      {"paper_id": paper["id"], "chroma_id": chroma_id})

        except Exception as e:
            update_paper_rag_status(paper["id"], "failed")
            failed_count += 1
            log_event("rag_failed", f"Failed to index paper {paper['id']}: {str(e)}",
                      {"paper_id": paper["id"]})

    return {
        "indexed_count": len(indexed_items),
        "failed_count": failed_count,
        "items": indexed_items,
    }


def reindex_paper(paper_id: int) -> dict:
    """重建单篇论文的 abstract 索引"""
    paper = get_paper_by_id(paper_id)
    if not paper:
        raise ValueError(f"Paper {paper_id} not found")

    update_paper_rag_status(paper_id, "indexing")

    try:
        embedding = embed_texts([paper["abstract"]])[0]
        chroma_id = make_chroma_id(paper_id)
        collection = get_collection()

        # 删除旧的
        try:
            collection.delete(ids=[chroma_id])
        except Exception:
            pass

        collection.add(
            ids=[chroma_id],
            embeddings=[embedding],
            documents=[paper["abstract"]],
            metadatas=[{
                "paper_id": paper["id"],
                "arxiv_id": paper["arxiv_id"],
                "title": paper["title"],
            }]
        )

        delete_rag_chunks_by_paper(paper_id)
        create_rag_chunk(paper_id, paper["abstract"], chroma_id)
        update_paper_rag_status(paper_id, "indexed")

        log_event("rag_reindexed", f"Reindexed paper {paper_id}",
                  {"paper_id": paper_id, "chroma_id": chroma_id})

        return {
            "paper_id": paper_id,
            "status": "indexed",
            "chroma_id": chroma_id,
        }

    except Exception as e:
        update_paper_rag_status(paper_id, "failed")
        log_event("rag_failed", f"Failed to reindex paper {paper_id}: {str(e)}",
                  {"paper_id": paper_id})
        raise


def delete_paper_from_chroma(paper_id: int) -> None:
    """从 Chroma 中删除论文向量"""
    chroma_id = make_chroma_id(paper_id)
    try:
        collection = get_collection()
        collection.delete(ids=[chroma_id])
    except Exception:
        pass
