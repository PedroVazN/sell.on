from flask import Flask, jsonify, request

from analytics.overview import compute_overview
from analytics.preprocessing import proposals_to_dataframe
from analytics.proposals_funnel import funnel_counts
from analytics.sellers_module import seller_performance

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

    df = proposals_to_dataframe(proposals)
    if df.empty:
        return jsonify(
            {
                "summary": {
                    "totalProposals": 0,
                    "totalRevenueClosed": 0,
                    "winRate": 0,
                    "lossRate": 0,
                    "avgTicket": 0,
                    "clientesAtivos": int(counters.get("clients", 0)),
                    "distribuidoresAtivos": int(counters.get("distributors", 0)),
                    "vendedoresAtivos": int(counters.get("sellers", 0)),
                },
                "statusBreakdown": [],
                "monthlyTrend": [],
                "topSellers": [],
                "topDistributors": [],
                "insights": ["Sem dados suficientes para análise."],
                "palette": ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"],
                "engine": "python",
            }
        )

    ov = compute_overview(df, counters)
    n = ov["n_propostas"]
    g, p = ov["ganhas"], ov["perdidas"]

    fb = funnel_counts(df)
    status_breakdown = [
        {
            "status": row["status_label"],
            "count": int(row["count"]),
            "total": round(float(row["valor_total"]), 2),
        }
        for _, row in fb.iterrows()
    ]

    monthly = ov["receita_por_mes"].tail(12)
    monthly_trend = [
        {
            "month": row["month"],
            "proposals": int(row["propostas"]),
            "won": int(row["ganhas"]),
            "lost": int(row["perdidas"]),
            "revenue": round(float(row["receita"]), 2),
        }
        for _, row in monthly.iterrows()
    ]

    ts = seller_performance(df).head(8)
    top_sellers = [
        {
            "seller": row["seller"],
            "proposals": int(row["propostas"]),
            "won": int(row["ganhas"]),
            "lost": int(row["perdidas"]),
            "revenue": round(float(row["receita"]), 2),
            "conversionRate": float(row["taxa_conversao"]),
        }
        for _, row in ts.iterrows()
    ]

    won_d = df[df["status"] == "venda_fechada"]
    cnt = df.groupby("distributor", as_index=False).agg(proposals=("status", "size"))
    rev_d = won_d.groupby("distributor", as_index=False).agg(revenue=("total", "sum"))
    wn = won_d.groupby("distributor", as_index=False).agg(won=("status", "size"))
    top_distributors = cnt.merge(rev_d, on="distributor", how="left").merge(wn, on="distributor", how="left").fillna(0)
    top_distributors["revenue"] = top_distributors["revenue"].astype(float)
    top_distributors["won"] = top_distributors["won"].astype(int)
    top_distributors["proposals"] = top_distributors["proposals"].astype(int)
    top_distributors = top_distributors.sort_values(["revenue", "won"], ascending=False).head(8)
    top_distributors_list = [
        {
            "distributor": row["distributor"],
            "proposals": int(row["proposals"]),
            "won": int(row["won"]),
            "revenue": round(float(row["revenue"]), 2),
        }
        for _, row in top_distributors.iterrows()
    ]

    insights = []
    if ov["taxa_conversao"] >= 35:
        insights.append(f"Taxa de ganho em bom nível ({ov['taxa_conversao']:.1f}%).")
    else:
        insights.append(f"Taxa de ganho em alerta ({ov['taxa_conversao']:.1f}%).")
    insights.append(f"Ticket médio de vendas fechadas: R$ {ov['ticket_medio']:,.2f}.")
    if not ts.empty:
        leader = ts.iloc[0]
        insights.append(
            f"Líder atual: {leader['seller']} com {int(leader['ganhas'])} vendas e R$ {leader['receita']:,.2f}."
        )

    return jsonify(
        {
            "summary": {
                "totalProposals": n,
                "totalRevenueClosed": round(ov["receita_total"], 2),
                "winRate": ov["taxa_conversao"],
                "lossRate": round((p / n * 100) if n else 0, 2),
                "avgTicket": ov["ticket_medio"],
                "clientesAtivos": ov["clientes_ativos_sistema"],
                "distribuidoresAtivos": ov["distribuidores_ativos"],
                "vendedoresAtivos": ov["vendedores_ativos"],
            },
            "statusBreakdown": status_breakdown,
            "monthlyTrend": monthly_trend,
            "topSellers": top_sellers,
            "topDistributors": top_distributors_list,
            "insights": insights,
            "palette": ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"],
            "engine": "python",
        }
    )


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)
