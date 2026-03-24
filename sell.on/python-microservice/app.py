from flask import Flask, jsonify, request

from analytics.clients_segmentation import client_aggregates, cluster_clients
from analytics.insights_engine import generate_insights
from analytics.overview import compute_overview
from analytics.predictive import forecast_revenue_naive, score_open_proposals, train_win_models
from analytics.preprocessing import proposals_to_dataframe
from analytics.proposals_funnel import funnel_conversion_rates, funnel_counts
from analytics.sellers_module import seller_performance
from analytics.temporal import simple_trend_direction

app = Flask(__name__)

PALETTE = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]


def _empty_payload(counters: dict) -> dict:
    return {
        "summary": {
            "totalProposals": 0,
            "totalRevenueClosed": 0,
            "winRate": 0,
            "lossRate": 0,
            "avgTicket": 0,
            "clientesAtivos": int(counters.get("clients", 0)),
            "distribuidoresAtivos": int(counters.get("distributors", 0)),
            "vendedoresAtivos": int(counters.get("sellers", 0)),
            "pipelineOpenCount": 0,
            "pipelineOpenValue": 0,
            "avgDaysToClose": None,
        },
        "statusBreakdown": [],
        "monthlyTrend": [],
        "topSellers": [],
        "topDistributors": [],
        "funnelStages": [],
        "funnelTransitions": [],
        "topClients": [],
        "clientSegments": [],
        "predictive": {
            "winModel": {"ok": False, "message": "Sem dados.", "rocAucLr": None, "rocAucRf": None, "importances": None},
            "forecast": {"ok": False, "message": "Sem dados."},
            "pipelineScores": [],
        },
        "insights": ["Sem dados suficientes para análise."],
        "palette": PALETTE,
        "engine": "python",
        "analysisVersion": 2,
    }


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
        return jsonify(_empty_payload(counters))

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

    funnel_stages = [
        {
            "stage": row["status"],
            "label": row["status_label"],
            "count": int(row["count"]),
            "avgValue": round(float(row["valor_medio"]), 2),
        }
        for _, row in fb.iterrows()
    ]

    trans = funnel_conversion_rates(df)
    funnel_transitions = [
        {
            "fromStage": row["de"],
            "toStage": row["para"],
            "transitionRate": float(row["taxa_transicao_pct"]),
        }
        for _, row in trans.iterrows()
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

    sp = seller_performance(df)
    ts = sp.head(8)
    top_sellers = [
        {
            "seller": row["seller"],
            "proposals": int(row["propostas"]),
            "won": int(row["ganhas"]),
            "lost": int(row["perdidas"]),
            "revenue": round(float(row["receita"]), 2),
            "conversionRate": float(row["taxa_conversao"]),
            "avgTicket": float(row["ticket_medio"]),
            "efficiencyScore": float(row["eficiencia_score"]),
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

    clients_agg = client_aggregates(df)
    clients_seg, _clust_msg = cluster_clients(clients_agg, 4)
    top_clients = []
    if not clients_agg.empty:
        head = clients_agg.head(10)
        for _, row in head.iterrows():
            top_clients.append(
                {
                    "clientName": str(row["client_display"])[:80],
                    "proposals": int(row["n_propostas"]),
                    "won": int(row["n_ganhas"]),
                    "revenue": round(float(row["receita"]), 2),
                    "avgTicket": round(float(row["ticket_medio"]), 2),
                }
            )

    client_segments = []
    if not clients_seg.empty and clients_seg["segmento"].notna().any():
        seg = (
            clients_seg.dropna(subset=["segmento"])
            .groupby("segmento", as_index=False)
            .agg(clients=("client_key", "nunique"), totalRevenue=("receita", "sum"))
        )
        for _, row in seg.iterrows():
            client_segments.append(
                {
                    "segment": str(row["segmento"]),
                    "clients": int(row["clients"]),
                    "totalRevenue": round(float(row["totalRevenue"]), 2),
                }
            )

    trend_msg = simple_trend_direction(ov["receita_por_mes"]["receita"])
    forecast = forecast_revenue_naive(ov["receita_por_mes"])

    win_full = train_win_models(df)
    win_model = {
        "ok": bool(win_full.get("ok")),
        "message": str(win_full.get("message") or ""),
        "rocAucLr": win_full.get("roc_auc_lr"),
        "rocAucRf": win_full.get("roc_auc_rf"),
        "importances": win_full.get("importances"),
    }
    pipeline_scores = []
    if win_full.get("ok"):
        scored = score_open_proposals(df, win_full)
        if not scored.empty:
            for _, row in scored.head(12).iterrows():
                label = str(row.get("client_display") or row.get("seller") or "—")[:48]
                pipeline_scores.append(
                    {
                        "label": label,
                        "value": round(float(row["total"]), 2),
                        "probPct": round(float(row["prob_ganho"]) * 100, 1),
                    }
                )

    forecast_out = {
        "ok": bool(forecast.get("ok")),
        "message": str(forecast.get("message") or ""),
        "nextMonthRevenue": forecast.get("proximo_mes_estimado"),
        "method": forecast.get("metodo"),
        "slope": forecast.get("coef_angular"),
    }

    fc_insight = {
        "ok": forecast.get("ok"),
        "proximo_mes_estimado": forecast.get("proximo_mes_estimado") or 0,
        "metodo": forecast.get("metodo") or "",
    }
    insights = generate_insights(df, ov, sp, fb, clients_seg, trend_msg, fc_insight)

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
                "pipelineOpenCount": ov["pipeline_aberto"],
                "pipelineOpenValue": round(float(ov["pipeline_valor"]), 2),
                "avgDaysToClose": ov["tempo_medio_fechamento_dias"],
            },
            "statusBreakdown": status_breakdown,
            "monthlyTrend": monthly_trend,
            "topSellers": top_sellers,
            "topDistributors": top_distributors_list,
            "funnelStages": funnel_stages,
            "funnelTransitions": funnel_transitions,
            "topClients": top_clients,
            "clientSegments": client_segments,
            "predictive": {
                "winModel": win_model,
                "forecast": forecast_out,
                "pipelineScores": pipeline_scores,
            },
            "insights": insights,
            "palette": PALETTE,
            "engine": "python",
            "analysisVersion": 2,
        }
    )


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)
