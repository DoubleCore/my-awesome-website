# Paper Watcher Backend API 接口文档

版本：v0.1  
目标：实现一个最小可用的论文数据库与 Abstract RAG 后端服务。  
范围：本文档只定义后端接口，不包含前端页面、调度系统、Hermes、OpenClaw、飞书或其他外部编排逻辑。

---

## 1. 服务定位

Paper Watcher Backend 只负责三类能力：

1. 论文元数据入库与查询
2. 论文 abstract 向量化索引
3. 基于 abstract 的 RAG 问答

第一版不处理 PDF 全文，不解析图表，不生成复现代码，不做定时任务。

---

## 2. 基础约定

### 2.1 Base URL

本地服务建议：

```http
http://127.0.0.1:8010/api/paper
```

对外由 Nginx 反代后可保持同一路径：

```http
/api/paper
```

---

### 2.2 数据格式

所有接口统一使用 JSON。

请求头：

```http
Content-Type: application/json
```

---

### 2.3 通用成功响应

简单接口可以直接返回业务 JSON。  
如果需要统一格式，可以使用：

```json
{
  "success": true,
  "data": {},
  "error": null
}
```

---

### 2.4 通用错误响应

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "PAPER_NOT_FOUND",
    "message": "Paper not found"
  }
}
```

---

### 2.5 推荐 HTTP 状态码

| 状态码 | 含义 |
|---|---|
| 200 | 请求成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 404 | 资源不存在 |
| 409 | 资源冲突，例如 arxiv_id 已存在 |
| 500 | 服务内部错误 |

---

## 3. 核心数据对象

### 3.1 Paper

```json
{
  "id": 1,
  "arxiv_id": "2501.12345",
  "title": "Example Paper Title",
  "authors": "Alice, Bob",
  "abstract": "This paper proposes...",
  "pdf_url": "https://arxiv.org/pdf/2501.12345",
  "source_url": "https://arxiv.org/abs/2501.12345",
  "published_at": "2026-05-09",
  "source": "arxiv",
  "rag_status": "indexed",
  "summary_status": "pending",
  "created_at": "2026-05-09T10:00:00",
  "updated_at": "2026-05-09T10:00:00"
}
```

---

### 3.2 RAG 状态

`rag_status` 允许值：

| 值 | 含义 |
|---|---|
| pending | 已入库，尚未向量化 |
| indexing | 正在向量化 |
| indexed | 已完成向量化 |
| failed | 向量化失败 |

---

### 3.3 Summary 状态

`summary_status` 第一版可以保留字段但不强制实现。

| 值 | 含义 |
|---|---|
| pending | 未生成 |
| generated | 已生成 |
| failed | 生成失败 |

---

### 3.4 Source

问答接口返回的来源论文对象。

```json
{
  "paper_id": 1,
  "arxiv_id": "2501.12345",
  "title": "Example Paper Title",
  "abstract": "This paper proposes...",
  "score": 0.87
}
```

---

## 4. 数据库最小表结构

### 4.1 papers

```sql
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
```

---

### 4.2 rag_chunks

第一版只索引 abstract，因此一篇论文通常只有一条 rag_chunks 记录。

```sql
CREATE TABLE IF NOT EXISTS rag_chunks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    paper_id INTEGER NOT NULL,
    chunk_type TEXT DEFAULT 'abstract',
    chunk_text TEXT NOT NULL,
    chroma_id TEXT UNIQUE,

    created_at TEXT DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (paper_id) REFERENCES papers(id)
);
```

---

### 4.3 qa_logs

```sql
CREATE TABLE IF NOT EXISTS qa_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    question TEXT NOT NULL,
    answer TEXT,
    source_paper_ids TEXT,

    asked_by TEXT DEFAULT 'api',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

---

### 4.4 system_events

```sql
CREATE TABLE IF NOT EXISTS system_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    event_type TEXT NOT NULL,
    message TEXT,
    payload_json TEXT,

    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

---

## 5. 接口列表

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/health` | 服务健康检查 |
| GET | `/dashboard` | 获取统计数据 |
| POST | `/papers` | 创建或更新论文 |
| POST | `/papers/batch` | 批量创建或更新论文 |
| GET | `/papers` | 获取论文列表 |
| GET | `/papers/{paper_id}` | 获取论文详情 |
| PATCH | `/papers/{paper_id}` | 更新论文元数据 |
| DELETE | `/papers/{paper_id}` | 删除论文 |
| POST | `/rag/index` | 索引待处理 abstract |
| POST | `/rag/reindex/{paper_id}` | 重建单篇论文 abstract 索引 |
| POST | `/ask` | 基于 abstract RAG 问答 |
| GET | `/events` | 查询系统事件 |
| GET | `/qa-logs` | 查询问答日志 |

---

# 6. 健康检查接口

## 6.1 GET `/health`

### 说明

检查后端服务、数据库和向量库是否可用。

### 请求

无请求体。

### 响应示例

```json
{
  "status": "ok",
  "db": "ok",
  "rag": "ok",
  "embedding_model": "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
}
```

---

# 7. Dashboard 统计接口

## 7.1 GET `/dashboard`

### 说明

返回数据库与 RAG 索引的基础统计数据。

### 请求

无请求体。

### 响应示例

```json
{
  "paper_count": 120,
  "indexed_count": 93,
  "pending_index_count": 27,
  "failed_index_count": 0,
  "today_new_count": 6,
  "latest_papers": [
    {
      "id": 1,
      "arxiv_id": "2501.12345",
      "title": "Example Paper Title",
      "published_at": "2026-05-09",
      "rag_status": "indexed"
    }
  ],
  "latest_events": [
    {
      "id": 1,
      "event_type": "rag_indexed",
      "message": "Indexed paper 1",
      "created_at": "2026-05-09T10:00:00"
    }
  ]
}
```

---

# 8. 论文接口

## 8.1 POST `/papers`

### 说明

创建或更新一篇论文。

推荐逻辑：

- 如果 `arxiv_id` 不存在，则创建新记录
- 如果 `arxiv_id` 已存在，则更新 title、authors、abstract、pdf_url、source_url、published_at 等字段
- 如果 abstract 发生变化，应将 `rag_status` 重置为 `pending`

### 请求体

```json
{
  "arxiv_id": "2501.12345",
  "title": "Example Paper Title",
  "authors": "Alice, Bob",
  "abstract": "This paper proposes...",
  "pdf_url": "https://arxiv.org/pdf/2501.12345",
  "source_url": "https://arxiv.org/abs/2501.12345",
  "published_at": "2026-05-09",
  "source": "arxiv"
}
```

### 必填字段

| 字段 | 必填 |
|---|---|
| arxiv_id | 是 |
| title | 是 |
| abstract | 是 |
| authors | 否 |
| pdf_url | 否 |
| source_url | 否 |
| published_at | 否 |
| source | 否，默认 arxiv |

### 响应示例：新建

```json
{
  "paper_id": 1,
  "status": "created",
  "rag_status": "pending"
}
```

### 响应示例：已存在并更新

```json
{
  "paper_id": 1,
  "status": "updated",
  "rag_status": "pending"
}
```

### 响应示例：已存在且无变化

```json
{
  "paper_id": 1,
  "status": "exists",
  "rag_status": "indexed"
}
```

---

## 8.2 POST `/papers/batch`

### 说明

批量创建或更新论文。

### 请求体

```json
{
  "papers": [
    {
      "arxiv_id": "2501.12345",
      "title": "Example Paper Title",
      "authors": "Alice, Bob",
      "abstract": "This paper proposes...",
      "pdf_url": "https://arxiv.org/pdf/2501.12345",
      "source_url": "https://arxiv.org/abs/2501.12345",
      "published_at": "2026-05-09",
      "source": "arxiv"
    }
  ]
}
```

### 响应示例

```json
{
  "created_count": 3,
  "updated_count": 2,
  "exists_count": 5,
  "failed_count": 0,
  "items": [
    {
      "arxiv_id": "2501.12345",
      "paper_id": 1,
      "status": "created",
      "rag_status": "pending"
    }
  ]
}
```

---

## 8.3 GET `/papers`

### 说明

获取论文列表。

### Query 参数

| 参数 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| limit | int | 20 | 每页数量 |
| offset | int | 0 | 偏移量 |
| keyword | string | 空 | 按标题、作者、abstract 模糊搜索 |
| rag_status | string | 空 | pending / indexing / indexed / failed |
| source | string | 空 | arxiv 等 |
| start_date | string | 空 | published_at 起始日期 |
| end_date | string | 空 | published_at 结束日期 |

### 请求示例

```http
GET /api/paper/papers?limit=20&offset=0&rag_status=indexed
```

### 响应示例

```json
{
  "items": [
    {
      "id": 1,
      "arxiv_id": "2501.12345",
      "title": "Example Paper Title",
      "authors": "Alice, Bob",
      "published_at": "2026-05-09",
      "source": "arxiv",
      "rag_status": "indexed",
      "created_at": "2026-05-09T10:00:00"
    }
  ],
  "total": 120,
  "limit": 20,
  "offset": 0
}
```

---

## 8.4 GET `/papers/{paper_id}`

### 说明

获取单篇论文详情。

### 响应示例

```json
{
  "id": 1,
  "arxiv_id": "2501.12345",
  "title": "Example Paper Title",
  "authors": "Alice, Bob",
  "abstract": "This paper proposes...",
  "pdf_url": "https://arxiv.org/pdf/2501.12345",
  "source_url": "https://arxiv.org/abs/2501.12345",
  "published_at": "2026-05-09",
  "source": "arxiv",
  "rag_status": "indexed",
  "summary_status": "pending",
  "created_at": "2026-05-09T10:00:00",
  "updated_at": "2026-05-09T10:00:00"
}
```

### 404 响应

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "PAPER_NOT_FOUND",
    "message": "Paper not found"
  }
}
```

---

## 8.5 PATCH `/papers/{paper_id}`

### 说明

更新论文元数据。

如果更新了 `abstract`，应自动将 `rag_status` 改为 `pending`。

### 请求体

```json
{
  "title": "Updated Paper Title",
  "authors": "Alice, Bob, Carol",
  "abstract": "Updated abstract...",
  "pdf_url": "https://arxiv.org/pdf/2501.12345",
  "source_url": "https://arxiv.org/abs/2501.12345",
  "published_at": "2026-05-09"
}
```

### 响应示例

```json
{
  "paper_id": 1,
  "status": "updated",
  "rag_status": "pending"
}
```

---

## 8.6 DELETE `/papers/{paper_id}`

### 说明

删除论文。

要求：

1. 删除 `papers` 表记录
2. 删除 `rag_chunks` 表记录
3. 删除 Chroma 中对应向量

### 响应示例

```json
{
  "paper_id": 1,
  "status": "deleted"
}
```

---

# 9. Abstract RAG 接口

## 9.1 POST `/rag/index`

### 说明

从数据库中读取 `rag_status = pending` 的论文，将 abstract 写入 Chroma。

### 请求体

```json
{
  "limit": 50
}
```

### 参数说明

| 字段 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| limit | int | 50 | 本次最多索引多少篇论文 |

### 处理逻辑

1. 查询 `papers.rag_status = pending`
2. 将选中的论文状态改为 `indexing`
3. 对每篇论文的 abstract 生成 embedding
4. 写入 Chroma
5. 写入 `rag_chunks`
6. 将论文状态改为 `indexed`
7. 失败则改为 `failed` 并写入 `system_events`

### 响应示例

```json
{
  "indexed_count": 30,
  "failed_count": 0,
  "items": [
    {
      "paper_id": 1,
      "arxiv_id": "2501.12345",
      "status": "indexed",
      "chroma_id": "paper_1_abstract"
    }
  ]
}
```

---

## 9.2 POST `/rag/reindex/{paper_id}`

### 说明

重建单篇论文的 abstract 向量索引。

适用于：

- abstract 更新后重建索引
- Chroma 数据异常后重新写入
- 人工触发修复

### 请求体

无请求体。

### 响应示例

```json
{
  "paper_id": 1,
  "status": "indexed",
  "chroma_id": "paper_1_abstract"
}
```

---

# 10. 问答接口

## 10.1 POST `/ask`

### 说明

基于已索引的 abstract 进行 RAG 问答。

该接口只允许基于检索到的论文 abstract 回答。  
如果检索结果不足，应明确说明“当前知识库中没有足够信息”。

### 请求体

```json
{
  "question": "最近 RAG Agent 方向的论文主要在研究什么？",
  "top_k": 5
}
```

### 参数说明

| 字段 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| question | string | 必填 | 用户问题 |
| top_k | int | 5 | 检索 abstract 数量 |

### 响应示例

```json
{
  "answer": "根据当前收录论文的 abstract，最近相关工作主要集中在三个方向：第一，提升 Agent 的检索规划能力；第二，将 RAG 与工具调用结合；第三，增强多步推理过程中的可靠性。",
  "sources": [
    {
      "paper_id": 1,
      "arxiv_id": "2501.12345",
      "title": "Example Paper Title",
      "abstract": "This paper proposes...",
      "score": 0.87
    },
    {
      "paper_id": 2,
      "arxiv_id": "2501.23456",
      "title": "Another Example Paper",
      "abstract": "We introduce...",
      "score": 0.82
    }
  ]
}
```

### 无足够信息响应示例

```json
{
  "answer": "当前知识库中没有足够的论文 abstract 支持回答这个问题。可以先增加相关关键词的论文收录。",
  "sources": []
}
```

### 后端处理逻辑

1. 接收 `question`
2. 对问题生成 embedding
3. 在 Chroma 中检索 top_k 个 abstract
4. 根据 Chroma 结果查 SQLite 中的论文元数据
5. 将 question + sources 传给 LLM
6. 返回 answer + sources
7. 写入 `qa_logs`

---

# 11. 日志查询接口

## 11.1 GET `/events`

### 说明

查询系统事件日志。

### Query 参数

| 参数 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| limit | int | 50 | 返回数量 |
| offset | int | 0 | 偏移量 |
| event_type | string | 空 | 按事件类型过滤 |

### 响应示例

```json
{
  "items": [
    {
      "id": 1,
      "event_type": "rag_indexed",
      "message": "Indexed paper 1",
      "payload_json": "{\"paper_id\":1}",
      "created_at": "2026-05-09T10:00:00"
    }
  ],
  "total": 1,
  "limit": 50,
  "offset": 0
}
```

---

## 11.2 GET `/qa-logs`

### 说明

查询问答日志。

### Query 参数

| 参数 | 类型 | 默认值 | 说明 |
|---|---|---|---|
| limit | int | 50 | 返回数量 |
| offset | int | 0 | 偏移量 |

### 响应示例

```json
{
  "items": [
    {
      "id": 1,
      "question": "最近 RAG Agent 方向的论文主要在研究什么？",
      "answer": "根据当前收录论文的 abstract...",
      "source_paper_ids": "[1,2]",
      "asked_by": "api",
      "created_at": "2026-05-09T10:00:00"
    }
  ],
  "total": 1,
  "limit": 50,
  "offset": 0
}
```

---

# 12. 推荐模块划分

后端目录建议：

```text
/opt/paper-watcher/app/
├── server.py              # FastAPI 路由
├── config.py              # 环境变量配置
├── schemas.py             # Pydantic 请求/响应模型
├── db.py                  # SQLite 初始化和 CRUD
├── abstract_indexer.py    # abstract 写入 Chroma
├── rag.py                 # Chroma 检索
├── embedder.py            # embedding 模型封装
├── llm.py                 # LLM 回答生成
└── events.py              # system_events 写入工具
```

---

# 13. 环境变量

`.env` 建议：

```env
PAPER_WATCHER_DB=/opt/paper-watcher/data/papers.db
PAPER_WATCHER_CHROMA_DIR=/opt/paper-watcher/data/chroma

EMBEDDING_MODEL=sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2

OPENAI_API_KEY=your_api_key
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4o-mini
```

---

# 14. 最小依赖

`requirements.txt`：

```txt
fastapi
uvicorn
python-dotenv
chromadb
sentence-transformers
openai
pydantic
```

如果需要跨域支持：

```txt
python-multipart
```

---

# 15. 启动命令

```bash
cd /opt/paper-watcher
source venv/bin/activate
uvicorn app.server:app --host 127.0.0.1 --port 8010
```

---

# 16. 最小验收标准

## 16.1 论文入库

```bash
curl -X POST http://127.0.0.1:8010/api/paper/papers \
  -H "Content-Type: application/json" \
  -d '{
    "arxiv_id": "2501.12345",
    "title": "Example Paper Title",
    "authors": "Alice, Bob",
    "abstract": "This paper proposes a simple method for retrieval augmented generation agents.",
    "pdf_url": "https://arxiv.org/pdf/2501.12345",
    "source_url": "https://arxiv.org/abs/2501.12345",
    "published_at": "2026-05-09"
  }'
```

期望返回：

```json
{
  "paper_id": 1,
  "status": "created",
  "rag_status": "pending"
}
```

---

## 16.2 Abstract 索引

```bash
curl -X POST http://127.0.0.1:8010/api/paper/rag/index \
  -H "Content-Type: application/json" \
  -d '{"limit": 10}'
```

期望返回：

```json
{
  "indexed_count": 1,
  "failed_count": 0,
  "items": [
    {
      "paper_id": 1,
      "arxiv_id": "2501.12345",
      "status": "indexed",
      "chroma_id": "paper_1_abstract"
    }
  ]
}
```

---

## 16.3 RAG 问答

```bash
curl -X POST http://127.0.0.1:8010/api/paper/ask \
  -H "Content-Type: application/json" \
  -d '{
    "question": "这篇论文主要研究什么？",
    "top_k": 3
  }'
```

期望返回：

```json
{
  "answer": "这篇论文主要研究……",
  "sources": [
    {
      "paper_id": 1,
      "arxiv_id": "2501.12345",
      "title": "Example Paper Title",
      "abstract": "This paper proposes...",
      "score": 0.87
    }
  ]
}
```

---

# 17. 第一版不实现的内容

第一版后端不要实现以下内容：

```text
1. PDF 全文解析
2. 图表解析
3. 公式识别
4. 自动抓取 ArXiv
5. 定时任务
6. 多 Agent 编排
7. 复现代码生成
8. 用户权限系统
9. 复杂前端逻辑
10. 复杂任务队列
```

---

# 18. 核心实现原则

1. 数据库是核心，所有论文必须先入库。
2. RAG 只基于 abstract，不基于全文。
3. abstract 更新后必须重建向量索引。
4. 问答结果必须返回来源论文。
5. 所有异常需要写入 `system_events`。
6. 所有问答需要写入 `qa_logs`。
7. 第一版优先稳定，不追求复杂能力。
