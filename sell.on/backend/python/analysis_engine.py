"""
Motor Python local (stdin/stdout JSON) — mesmo schema v2 que o Flask no Render.

Uso: o backend Node faz spawn deste script quando o Render falha ou quando não há
PYTHON_ANALYSIS_URL (se Python + dependências estiverem no PATH).

Requer repositório completo: pasta `python-microservice/analytics` acessível
(relativa a este arquivo: ../../python-microservice).
"""
from __future__ import annotations

import json
import os
import sys


def _microservice_root() -> str:
    here = os.path.dirname(os.path.abspath(__file__))
    sellon_root = os.path.abspath(os.path.join(here, "..", ".."))
    env_override = os.environ.get("PYTHON_MICROSERVICE_ROOT", "").strip()
    if env_override and os.path.isdir(os.path.join(env_override, "analytics")):
        return env_override
    return os.path.join(sellon_root, "python-microservice")


def main() -> None:
    micro = _microservice_root()
    analytics_dir = os.path.join(micro, "analytics")
    if not os.path.isdir(analytics_dir):
        print(
            json.dumps(
                {
                    "error": "analytics não encontrado",
                    "details": (
                        f"Pasta esperada: {analytics_dir}. "
                        "Defina PYTHON_MICROSERVICE_ROOT ou mantenha python-microservice no repositório."
                    ),
                },
                ensure_ascii=False,
            )
        )
        sys.exit(1)

    sys.path.insert(0, micro)

    try:
        from analytics.api_payload import build_analysis_payload
        from analytics.json_utils import sanitize_for_json
    except ImportError as exc:
        print(
            json.dumps(
                {
                    "error": "Falha ao importar analytics",
                    "details": str(exc),
                },
                ensure_ascii=False,
            )
        )
        sys.exit(1)

    payload = json.loads(sys.stdin.read() or "{}")
    proposals = payload.get("proposals", [])
    counters = payload.get("counters", {})
    result = build_analysis_payload(proposals, counters)
    result["engine"] = "python"
    print(json.dumps(sanitize_for_json(result), ensure_ascii=False))


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(
            json.dumps(
                {
                    "error": "Falha ao processar análise em Python",
                    "details": str(exc),
                },
                ensure_ascii=False,
            )
        )
        sys.exit(1)
