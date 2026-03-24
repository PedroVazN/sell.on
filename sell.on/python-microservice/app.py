from flask import Flask, jsonify, request
import pandas as pd

app = Flask(__name__)


def to_number(value):
    try:
        return float(value or 0)
    except (TypeError, ValueError):
        return 0.0


@app.get("/health")
def health():
    return jsonify({"ok": True, "engine": "python"})


@app.post("/analyze")
def analyze():
    payload = request.get_json(silent=True) or {}
    proposals = payload.get("proposals", [])
    counters = payload.get("counters", {})

    rows = []
    for p in proposals:
        status = p.get("status") or "negociacao"
        total = to_number(p.get("total"))
        seller = (p.get("seller") or {}).get("name") or "Sem vendedor"
        distributor_obj = p.get("distributor") or {}
        distributor = distributor_obj.get("apelido") or distributor_obj.get("razaoSocial") or "Sem distribuidor"
        rows.append(
            {
                "status": status,
                "total": total,
                "seller": seller,
                "distributor": distributor,
                "createdAt": p.get("createdAt"),
            }
        )

    df = pd.DataFrame(rows)
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

    total_proposals = int(len(df))
    won_df = df[df["status"] == "venda_fechada"]
    lost_df = df[df["status"] == "venda_perdida"]

    total_revenue_closed = float(won_df["total"].sum())
    avg_ticket = float(won_df["total"].mean()) if len(won_df) > 0 else 0.0
    win_rate = (len(won_df) / total_proposals) * 100 if total_proposals else 0
    loss_rate = (len(lost_df) / total_proposals) * 100 if total_proposals else 0

    status_breakdown = (
        df.groupby("status", as_index=False)
        .agg(count=("status", "size"), total=("total", "sum"))
        .sort_values("count", ascending=False)
        .to_dict(orient="records")
    )

    df["createdAt"] = pd.to_datetime(df["createdAt"], errors="coerce")
    df["month"] = df["createdAt"].dt.to_period("M").astype(str)
    monthly_trend = (
        df.dropna(subset=["month"])
        .groupby("month", as_index=False)
        .agg(
            proposals=("status", "size"),
            won=("status", lambda s: int((s == "venda_fechada").sum())),
            lost=("status", lambda s: int((s == "venda_perdida").sum())),
            revenue=("total", "sum"),
        )
        .sort_values("month")
        .tail(12)
        .to_dict(orient="records")
    )

    top_sellers = (
        df.groupby("seller", as_index=False)
        .agg(
            proposals=("status", "size"),
            won=("status", lambda s: int((s == "venda_fechada").sum())),
            lost=("status", lambda s: int((s == "venda_perdida").sum())),
            revenue=("total", "sum"),
        )
        .sort_values(["revenue", "won"], ascending=False)
        .head(8)
    )
    top_sellers["conversionRate"] = (
        (top_sellers["won"] / top_sellers["proposals"]) * 100
    ).fillna(0).round(2)

    top_distributors = (
        df.groupby("distributor", as_index=False)
        .agg(
            proposals=("status", "size"),
            won=("status", lambda s: int((s == "venda_fechada").sum())),
            revenue=("total", "sum"),
        )
        .sort_values(["revenue", "won"], ascending=False)
        .head(8)
        .to_dict(orient="records")
    )

    insights = []
    if win_rate >= 35:
        insights.append(f"Taxa de ganho em bom nível ({win_rate:.1f}%).")
    else:
        insights.append(f"Taxa de ganho em alerta ({win_rate:.1f}%).")
    insights.append(f"Ticket médio de vendas fechadas: R$ {avg_ticket:,.2f}.")
    if len(top_sellers) > 0:
        leader = top_sellers.iloc[0]
        insights.append(
            f"Líder atual: {leader['seller']} com {int(leader['won'])} vendas e R$ {leader['revenue']:,.2f}."
        )

    return jsonify(
        {
            "summary": {
                "totalProposals": total_proposals,
                "totalRevenueClosed": round(total_revenue_closed, 2),
                "winRate": round(win_rate, 2),
                "lossRate": round(loss_rate, 2),
                "avgTicket": round(avg_ticket, 2),
                "clientesAtivos": int(counters.get("clients", 0)),
                "distribuidoresAtivos": int(counters.get("distributors", 0)),
                "vendedoresAtivos": int(counters.get("sellers", 0)),
            },
            "statusBreakdown": status_breakdown,
            "monthlyTrend": monthly_trend,
            "topSellers": top_sellers.to_dict(orient="records"),
            "topDistributors": top_distributors,
            "insights": insights,
            "palette": ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"],
            "engine": "python",
        }
    )


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000)
