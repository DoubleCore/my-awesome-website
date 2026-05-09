# CLAUDE.md — Backend

This file provides guidance when working with code in the backend directory.

## Overview

Paper Watcher Backend — 论文数据库与 Abstract RAG 后端服务。

基于 FastAPI + SQLite + ChromaDB + sentence-transformers 构建。

## Tech Stack

- **Framework**: FastAPI
- **Database**: SQLite (WAL mode)
- **Vector Store**: ChromaDB (persistent)
- **Embedding**: sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2
- **LLM**: OpenAI-compatible API (gpt-4o-mini)

## Project Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── server.py           # FastAPI 路由
│   ├── config.py           # 环境变量配置
│   ├── schemas.py          # Pydantic 请求/响应模型
│   ├── db.py               # SQLite 初始化和 CRUD
│   ├── abstract_indexer.py # abstract 写入 Chroma
│   ├── rag.py              # Chroma 检索
│   ├── embedder.py         # embedding 模型封装
│   ├── llm.py              # LLM 回答生成
│   └── events.py           # system_events 写入工具
├── run.py                  # 启动入口
├── requirements.txt
├── .env.example
└── backend_readme.md       # API 接口文档
```

## Commands

```bash
# 安装依赖
pip install -r requirements.txt

# 启动开发服务器
python run.py

# 或者直接用 uvicorn
uvicorn app.server:app --host 127.0.0.1 --port 8010 --reload
```

## API Base URL

```
http://127.0.0.1:8010/api/paper
```

## Environment Variables

Copy `.env.example` to `.env` and fill in values. Key variables:

- `PAPER_WATCHER_DB` — SQLite 数据库路径
- `PAPER_WATCHER_CHROMA_DIR` — ChromaDB 持久化目录
- `EMBEDDING_MODEL` — sentence-transformers 模型名
- `OPENAI_API_KEY` — OpenAI API Key
- `OPENAI_BASE_URL` — OpenAI 兼容 API 地址
- `OPENAI_MODEL` — 使用的 LLM 模型
