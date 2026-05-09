"""SQLite 初始化和 CRUD"""

import sqlite3
from pathlib import Path
from datetime import datetime, date

from app.config import PAPER_WATCHER_DB

_connection: sqlite3.Connection | None = None


def get_db() -> sqlite3.Connection:
    """获取数据库连接（单例）"""
    global _connection
    if _connection is None:
        db_path = Path(PAPER_WATCHER_DB)
        db_path.parent.mkdir(parents=True, exist_ok=True)
        _connection = sqlite3.connect(str(db_path), check_same_thread=False)
        _connection.row_factory = sqlite3.Row
        _connection.execute("PRAGMA journal_mode=WAL")
        _connection.execute("PRAGMA foreign_keys=ON")
    return _connection


def init_db():
    """初始化数据库表"""
    conn = get_db()
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS papers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            arxiv_id TEXT UNIQUE,
            title TEXT NOT NULL,
            authors TEXT,
            abstract TEXT,
            pdf_url TEXT,
            source_url TEXT,
            published_at TEXT,
            source TEXT DEFAULT 'arxiv',
            rag_status TEXT DEFAULT 'pending',
            summary_status TEXT DEFAULT 'pending',
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS rag_chunks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            paper_id INTEGER NOT NULL,
            chunk_type TEXT DEFAULT 'abstract',
            chunk_text TEXT NOT NULL,
            chroma_id TEXT UNIQUE,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (paper_id) REFERENCES papers(id)
        );

        CREATE TABLE IF NOT EXISTS qa_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            question TEXT NOT NULL,
            answer TEXT,
            source_paper_ids TEXT,
            asked_by TEXT DEFAULT 'api',
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS system_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            event_type TEXT NOT NULL,
            message TEXT,
            payload_json TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
    """)
    conn.commit()


# ========== Papers CRUD ==========

def get_paper_by_arxiv_id(arxiv_id: str) -> dict | None:
    conn = get_db()
    row = conn.execute("SELECT * FROM papers WHERE arxiv_id = ?", (arxiv_id,)).fetchone()
    return dict(row) if row else None


def get_paper_by_id(paper_id: int) -> dict | None:
    conn = get_db()
    row = conn.execute("SELECT * FROM papers WHERE id = ?", (paper_id,)).fetchone()
    return dict(row) if row else None


def create_paper(data: dict) -> int:
    conn = get_db()
    now = datetime.utcnow().isoformat(timespec="seconds")
    cursor = conn.execute(
        """INSERT INTO papers (arxiv_id, title, authors, abstract, pdf_url, source_url, published_at, source, rag_status, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)""",
        (
            data["arxiv_id"], data["title"], data.get("authors"),
            data["abstract"], data.get("pdf_url"), data.get("source_url"),
            data.get("published_at"), data.get("source", "arxiv"),
            now, now
        )
    )
    conn.commit()
    return cursor.lastrowid


def update_paper(paper_id: int, data: dict) -> None:
    conn = get_db()
    now = datetime.utcnow().isoformat(timespec="seconds")
    fields = []
    values = []
    for key in ["title", "authors", "abstract", "pdf_url", "source_url", "published_at"]:
        if key in data and data[key] is not None:
            fields.append(f"{key} = ?")
            values.append(data[key])

    # 如果 abstract 更新了，重置 rag_status
    if "abstract" in data and data["abstract"] is not None:
        fields.append("rag_status = ?")
        values.append("pending")

    fields.append("updated_at = ?")
    values.append(now)
    values.append(paper_id)

    conn.execute(f"UPDATE papers SET {', '.join(fields)} WHERE id = ?", values)
    conn.commit()


def update_paper_rag_status(paper_id: int, status: str) -> None:
    conn = get_db()
    now = datetime.utcnow().isoformat(timespec="seconds")
    conn.execute("UPDATE papers SET rag_status = ?, updated_at = ? WHERE id = ?", (status, now, paper_id))
    conn.commit()


def delete_paper(paper_id: int) -> None:
    conn = get_db()
    conn.execute("DELETE FROM rag_chunks WHERE paper_id = ?", (paper_id,))
    conn.execute("DELETE FROM papers WHERE id = ?", (paper_id,))
    conn.commit()


def list_papers(limit: int = 20, offset: int = 0, keyword: str = "",
                rag_status: str = "", source: str = "",
                start_date: str = "", end_date: str = "") -> tuple[list[dict], int]:
    conn = get_db()
    conditions = []
    params = []

    if keyword:
        conditions.append("(title LIKE ? OR authors LIKE ? OR abstract LIKE ?)")
        kw = f"%{keyword}%"
        params.extend([kw, kw, kw])
    if rag_status:
        conditions.append("rag_status = ?")
        params.append(rag_status)
    if source:
        conditions.append("source = ?")
        params.append(source)
    if start_date:
        conditions.append("published_at >= ?")
        params.append(start_date)
    if end_date:
        conditions.append("published_at <= ?")
        params.append(end_date)

    where_clause = f"WHERE {' AND '.join(conditions)}" if conditions else ""

    count_row = conn.execute(f"SELECT COUNT(*) as cnt FROM papers {where_clause}", params).fetchone()
    total = count_row["cnt"]

    rows = conn.execute(
        f"SELECT * FROM papers {where_clause} ORDER BY created_at DESC LIMIT ? OFFSET ?",
        params + [limit, offset]
    ).fetchall()

    return [dict(r) for r in rows], total


def get_pending_papers(limit: int = 50) -> list[dict]:
    conn = get_db()
    rows = conn.execute(
        "SELECT * FROM papers WHERE rag_status = 'pending' LIMIT ?", (limit,)
    ).fetchall()
    return [dict(r) for r in rows]


# ========== RAG Chunks ==========

def create_rag_chunk(paper_id: int, chunk_text: str, chroma_id: str) -> int:
    conn = get_db()
    cursor = conn.execute(
        "INSERT INTO rag_chunks (paper_id, chunk_type, chunk_text, chroma_id) VALUES (?, 'abstract', ?, ?)",
        (paper_id, chunk_text, chroma_id)
    )
    conn.commit()
    return cursor.lastrowid


def delete_rag_chunks_by_paper(paper_id: int) -> list[str]:
    """删除论文的 rag_chunks 并返回 chroma_ids"""
    conn = get_db()
    rows = conn.execute("SELECT chroma_id FROM rag_chunks WHERE paper_id = ?", (paper_id,)).fetchall()
    chroma_ids = [r["chroma_id"] for r in rows if r["chroma_id"]]
    conn.execute("DELETE FROM rag_chunks WHERE paper_id = ?", (paper_id,))
    conn.commit()
    return chroma_ids


# ========== QA Logs ==========

def create_qa_log(question: str, answer: str, source_paper_ids: str, asked_by: str = "api") -> int:
    conn = get_db()
    cursor = conn.execute(
        "INSERT INTO qa_logs (question, answer, source_paper_ids, asked_by) VALUES (?, ?, ?, ?)",
        (question, answer, source_paper_ids, asked_by)
    )
    conn.commit()
    return cursor.lastrowid


def list_qa_logs(limit: int = 50, offset: int = 0) -> tuple[list[dict], int]:
    conn = get_db()
    count_row = conn.execute("SELECT COUNT(*) as cnt FROM qa_logs").fetchone()
    total = count_row["cnt"]
    rows = conn.execute(
        "SELECT * FROM qa_logs ORDER BY created_at DESC LIMIT ? OFFSET ?", (limit, offset)
    ).fetchall()
    return [dict(r) for r in rows], total


# ========== System Events ==========

def create_event(event_type: str, message: str, payload_json: str = None) -> int:
    conn = get_db()
    cursor = conn.execute(
        "INSERT INTO system_events (event_type, message, payload_json) VALUES (?, ?, ?)",
        (event_type, message, payload_json)
    )
    conn.commit()
    return cursor.lastrowid


def list_events(limit: int = 50, offset: int = 0, event_type: str = "") -> tuple[list[dict], int]:
    conn = get_db()
    conditions = []
    params = []
    if event_type:
        conditions.append("event_type = ?")
        params.append(event_type)

    where_clause = f"WHERE {' AND '.join(conditions)}" if conditions else ""
    count_row = conn.execute(f"SELECT COUNT(*) as cnt FROM system_events {where_clause}", params).fetchone()
    total = count_row["cnt"]

    rows = conn.execute(
        f"SELECT * FROM system_events {where_clause} ORDER BY created_at DESC LIMIT ? OFFSET ?",
        params + [limit, offset]
    ).fetchall()
    return [dict(r) for r in rows], total


# ========== Dashboard ==========

def get_dashboard_stats() -> dict:
    conn = get_db()
    paper_count = conn.execute("SELECT COUNT(*) as cnt FROM papers").fetchone()["cnt"]
    indexed_count = conn.execute("SELECT COUNT(*) as cnt FROM papers WHERE rag_status = 'indexed'").fetchone()["cnt"]
    pending_count = conn.execute("SELECT COUNT(*) as cnt FROM papers WHERE rag_status = 'pending'").fetchone()["cnt"]
    failed_count = conn.execute("SELECT COUNT(*) as cnt FROM papers WHERE rag_status = 'failed'").fetchone()["cnt"]

    today = date.today().isoformat()
    today_new = conn.execute(
        "SELECT COUNT(*) as cnt FROM papers WHERE DATE(created_at) = ?", (today,)
    ).fetchone()["cnt"]

    latest_papers = conn.execute(
        "SELECT id, arxiv_id, title, published_at, rag_status FROM papers ORDER BY created_at DESC LIMIT 10"
    ).fetchall()

    latest_events = conn.execute(
        "SELECT id, event_type, message, created_at FROM system_events ORDER BY created_at DESC LIMIT 10"
    ).fetchall()

    return {
        "paper_count": paper_count,
        "indexed_count": indexed_count,
        "pending_index_count": pending_count,
        "failed_index_count": failed_count,
        "today_new_count": today_new,
        "latest_papers": [dict(r) for r in latest_papers],
        "latest_events": [dict(r) for r in latest_events],
    }
