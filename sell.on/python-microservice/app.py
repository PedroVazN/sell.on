from flask import Flask, jsonify, request

from analytics.api_payload import build_analysis_payload

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
    payload = request.get_json(silent=True) or {}
    proposals = payload.get("proposals", [])
    counters = payload.get("counters", {})

    body = build_analysis_payload(proposals, counters)
    body["engine"] = "python"
    return jsonify(body)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)
