import sys
import traceback

from flask import Flask, jsonify, request

from analytics.api_payload import build_analysis_payload
from analytics.json_utils import sanitize_for_json

app = Flask(__name__)


@app.get("/")
def root():
    """Evita 404 ao abrir a URL do Render no navegador."""
    return jsonify(
        {
            "service": "sellon-python-analysis",
            "engine": "python",
            "endpoints": {
                "GET /health": "checagem rápida",
                "POST /analyze": "corpo JSON com proposals + counters (igual ao backend SellOn)",
            },
            "dashboard": "Opcional: rode Streamlit localmente com streamlit run streamlit_app.py",
        }
    )


@app.get("/health")
def health():
    return jsonify({"ok": True, "engine": "python"})


@app.post("/analyze")
def analyze():
    try:
        payload = request.get_json(silent=True) or {}
        proposals = payload.get("proposals", [])
        counters = payload.get("counters", {})

        body = build_analysis_payload(proposals, counters)
        body["engine"] = "python-render"
        return jsonify(sanitize_for_json(body))
    except Exception as exc:
        traceback.print_exc(file=sys.stderr)
        msg = str(exc)[:500]
        return (
            jsonify(
                {
                    "error": "analyze_failed",
                    "message": msg,
                    "detail": type(exc).__name__,
                }
            ),
            500,
        )


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)
