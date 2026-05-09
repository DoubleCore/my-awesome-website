"""Pydantic 请求/响应模型"""

from typing import Optional
from pydantic import BaseModel


# ========== Paper ==========

class PaperCreate(BaseModel):
    arxiv_id: str
    title: str
    abstract: str
    authors: Optional[str] = None
    pdf_url: Optional[str] = None
    source_url: Optional[str] = None
    published_at: Optional[str] = None
    source: Optional[str] = "arxiv"


class PaperBatchCreate(BaseModel):
    papers: list[PaperCreate]


class PaperUpdate(BaseModel):
    title: Optional[str] = None
    authors: Optional[str] = None
    abstract: Optional[str] = None
    pdf_url: Optional[str] = None
    source_url: Optional[str] = None
    published_at: Optional[str] = None


# ========== RAG ==========

class RagIndexRequest(BaseModel):
    limit: Optional[int] = 50


# ========== Ask ==========

class AskRequest(BaseModel):
    question: str
    top_k: Optional[int] = 5


# ========== Response Models ==========

class ErrorDetail(BaseModel):
    code: str
    message: str


class ErrorResponse(BaseModel):
    success: bool = False
    data: None = None
    error: ErrorDetail


class PaperResponse(BaseModel):
    paper_id: int
    status: str
    rag_status: str


class BatchItemResponse(BaseModel):
    arxiv_id: str
    paper_id: int
    status: str
    rag_status: str


class BatchResponse(BaseModel):
    created_count: int
    updated_count: int
    exists_count: int
    failed_count: int
    items: list[BatchItemResponse]


class SourcePaper(BaseModel):
    paper_id: int
    arxiv_id: str
    title: str
    abstract: str
    score: float


class AskResponse(BaseModel):
    answer: str
    sources: list[SourcePaper]


class RagIndexItemResponse(BaseModel):
    paper_id: int
    arxiv_id: str
    status: str
    chroma_id: str


class RagIndexResponse(BaseModel):
    indexed_count: int
    failed_count: int
    items: list[RagIndexItemResponse]


class ReindexResponse(BaseModel):
    paper_id: int
    status: str
    chroma_id: str
