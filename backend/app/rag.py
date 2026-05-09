"""Chroma 检索"""

from app.abstract_indexer import get_collection
from app.embedder import embed_text
from app.db import get_paper_by_id


def search_abstracts(question: str, top_k: int = 5) -> list[dict]:
    """基于问题检索最相关的 abstract"""
    collection = get_collection()

    # 检查集合是否为空
    if collection.count() == 0:
        return []

    query_embedding = embed_text(question)

    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=min(top_k, collection.count()),
        include=["documents", "metadatas", "distances"]
    )

    sources = []
    if results and results["ids"] and results["ids"][0]:
        for i, chroma_id in enumerate(results["ids"][0]):
            metadata = results["metadatas"][0][i]
            distance = results["distances"][0][i]
            # Chroma cosine distance: 0 = identical, 2 = opposite
            # Convert to similarity score: 1 - (distance / 2)
            score = round(1 - (distance / 2), 4)

            paper = get_paper_by_id(metadata["paper_id"])
            if paper:
                sources.append({
                    "paper_id": paper["id"],
                    "arxiv_id": paper["arxiv_id"],
                    "title": paper["title"],
                    "abstract": paper["abstract"],
                    "score": score,
                })

    return sources
