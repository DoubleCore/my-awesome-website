"""环境变量配置"""

import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

PAPER_WATCHER_DB = os.getenv("PAPER_WATCHER_DB", str(BASE_DIR / "data" / "papers.db"))
PAPER_WATCHER_CHROMA_DIR = os.getenv("PAPER_WATCHER_CHROMA_DIR", str(BASE_DIR / "data" / "chroma"))

EMBEDDING_MODEL = os.getenv("EMBEDDING_MODEL", "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2")

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
OPENAI_BASE_URL = os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1")
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
