"""Embedding 模型封装"""

from sentence_transformers import SentenceTransformer
from app.config import EMBEDDING_MODEL

_model: SentenceTransformer | None = None


def get_model() -> SentenceTransformer:
    """获取 embedding 模型（懒加载单例）"""
    global _model
    if _model is None:
        _model = SentenceTransformer(EMBEDDING_MODEL)
    return _model


def embed_texts(texts: list[str]) -> list[list[float]]:
    """对文本列表生成 embedding"""
    model = get_model()
    embeddings = model.encode(texts, normalize_embeddings=True)
    return embeddings.tolist()


def embed_text(text: str) -> list[float]:
    """对单条文本生成 embedding"""
    return embed_texts([text])[0]
