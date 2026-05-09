"""LLM 回答生成"""

from openai import OpenAI
from app.config import OPENAI_API_KEY, OPENAI_BASE_URL, OPENAI_MODEL

_client: OpenAI | None = None


def get_client() -> OpenAI:
    global _client
    if _client is None:
        _client = OpenAI(api_key=OPENAI_API_KEY, base_url=OPENAI_BASE_URL)
    return _client


SYSTEM_PROMPT = """你是一个论文知识库助手。你只能基于用户提供的论文 abstract 来回答问题。

规则：
1. 只基于提供的 abstract 内容回答，不要编造信息。
2. 如果提供的 abstract 不足以回答问题，明确说明"当前知识库中没有足够的论文 abstract 支持回答这个问题"。
3. 回答时尽量引用具体论文的观点。
4. 使用中文回答。"""


def generate_answer(question: str, sources: list[dict]) -> str:
    """基于检索到的 abstract 生成回答"""
    if not sources:
        return "当前知识库中没有足够的论文 abstract 支持回答这个问题。可以先增加相关关键词的论文收录。"

    # 构建上下文
    context_parts = []
    for i, src in enumerate(sources, 1):
        context_parts.append(
            f"论文 {i}:\n"
            f"标题: {src['title']}\n"
            f"ArXiv ID: {src['arxiv_id']}\n"
            f"Abstract: {src['abstract']}\n"
        )
    context = "\n---\n".join(context_parts)

    user_message = f"""以下是从知识库中检索到的相关论文 abstract：

{context}

---

用户问题：{question}

请基于以上论文 abstract 回答用户的问题。"""

    try:
        client = get_client()
        response = client.chat.completions.create(
            model=OPENAI_MODEL,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_message},
            ],
            temperature=0.3,
            max_tokens=1024,
        )
        return response.choices[0].message.content
    except Exception as e:
        return f"生成回答时出错：{str(e)}"
