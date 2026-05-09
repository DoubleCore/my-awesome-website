"""system_events 写入工具"""

import json
from app.db import create_event


def log_event(event_type: str, message: str, payload: dict = None) -> int:
    """写入系统事件"""
    payload_json = json.dumps(payload, ensure_ascii=False) if payload else None
    return create_event(event_type, message, payload_json)
