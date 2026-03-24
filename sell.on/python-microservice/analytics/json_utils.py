"""Garante estrutura serializável em JSON (Flask jsonify / stdlib json)."""

from __future__ import annotations

import math
from typing import Any

try:
    import numpy as np

    _NP_INT = (np.integer,)
    _NP_FLOAT = (np.floating,)
except ImportError:
    np = None  # type: ignore
    _NP_INT = ()
    _NP_FLOAT = ()


def sanitize_for_json(obj: Any) -> Any:
    if obj is None:
        return None
    if isinstance(obj, bool):
        return obj
    if _NP_INT and isinstance(obj, _NP_INT):
        return int(obj)
    if _NP_FLOAT and isinstance(obj, _NP_FLOAT):
        return sanitize_for_json(float(obj))
    if isinstance(obj, (int,)):
        return int(obj)
    if isinstance(obj, float):
        if math.isnan(obj) or math.isinf(obj):
            return None
        return float(obj)
    if isinstance(obj, str):
        return obj
    if isinstance(obj, dict):
        return {str(k): sanitize_for_json(v) for k, v in obj.items()}
    if isinstance(obj, (list, tuple)):
        return [sanitize_for_json(x) for x in obj]
    try:
        if hasattr(obj, "item"):
            return sanitize_for_json(obj.item())
    except Exception:
        pass
    try:
        return float(obj)
    except (TypeError, ValueError):
        return str(obj)
