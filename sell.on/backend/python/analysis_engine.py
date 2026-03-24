"""
Legado: script stdin/stdout usado antes do microserviço Flask (python-microservice).
O backend em produção não chama mais este arquivo — use POST no serviço Render + PYTHON_ANALYSIS_URL.
Mantido apenas para referência ou execução manual local.
"""
import json
import sys
from datetime import datetime

import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt


STATUS_MAP = {
    "negociacao": "Em negociacao",
    "venda_fechada": "Ganhas",
    "venda_perdida": "Perdidas",
    "aguardando_pagamento": "Aguardando pagamento",
    "expirada": "Expiradas",
}


def _safe_float(value):
    try:
        return float(value or 0)
    except (TypeError, ValueError):
        return 0.0


def _normalize_rows(raw):
    rows = []
    for p in raw:
        seller = (p.get("seller") or {}).get("name") or "Sem vendedor"
        distributor_obj = p.get("distributor") or {}
        distributor = distributor_obj.get("apelido") or distributor_obj.get("razaoSocial") or "Sem distribuidor"
        status_raw = p.get("status") or "negociacao"
        status = STATUS_MAP.get(status_raw, status_raw)
        total = _safe_float(p.get("total"))
        created = p.get("createdAt")
        rows.append(
            {
                "status": status,
                "statusRaw": status_raw,
                "total": total,
                "seller": seller,
                "distributor": distributor,
                "createdAt": created,
            }
        )
    return rows


def main():
    payload = json.loads(sys.stdin.read() or "{}")
    proposals = payload.get("proposals", [])
    counters = payload.get("counters", {})

    df = pd.DataFrame(_normalize_rows(proposals))
    if df.empty:
        result = {
            "summary": {
                "totalProposals": 0,
                "totalRevenueClosed": 0,
                "winRate": 0,
                "lossRate": 0,
                "avgTicket": 0,
                "clientesAtivos": counters.get("clients", 0),
                "distribuidoresAtivos": counters.get("distributors", 0),
                "vendedoresAtivos": counters.get("sellers", 0),
            },
            "statusBreakdown": [],
            "monthlyTrend": [],
            "topSellers": [],
            "topDistributors": [],
            "insights": ["Nao ha propostas suficientes para analise no momento."],
            "palette": ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"],
        }
        print(json.dumps(result, ensure_ascii=False))
        return

    df["createdAt"] = pd.to_datetime(df["createdAt"], errors="coerce")
    df["month"] = df["createdAt"].dt.to_period("M").astype(str)

    total_proposals = int(df.shape[0])
    wins = int((df["statusRaw"] == "venda_fechada").sum())
    losses = int((df["statusRaw"] == "venda_perdida").sum())
    closed_revenue = float(df.loc[df["statusRaw"] == "venda_fechada", "total"].sum())
    avg_ticket = float(df.loc[df["statusRaw"] == "venda_fechada", "total"].mean() or 0)
    win_rate = (wins / total_proposals * 100) if total_proposals else 0
    loss_rate = (losses / total_proposals * 100) if total_proposals else 0

    status_group = (
        df.groupby("status", as_index=False)
        .agg(count=("status", "size"), total=("total", "sum"))
        .sort_values("count", ascending=False)
    )
    status_breakdown = status_group.to_dict(orient="records")

    monthly_group = (
        df.dropna(subset=["month"])
        .groupby("month", as_index=False)
        .agg(
            proposals=("status", "size"),
            won=("statusRaw", lambda s: int((s == "venda_fechada").sum())),
            lost=("statusRaw", lambda s: int((s == "venda_perdida").sum())),
            revenue=("total", "sum"),
        )
        .sort_values("month")
    )
    monthly_trend = monthly_group.tail(12).to_dict(orient="records")

    sellers_group = (
        df.groupby("seller", as_index=False)
        .agg(
            proposals=("status", "size"),
            won=("statusRaw", lambda s: int((s == "venda_fechada").sum())),
            lost=("statusRaw", lambda s: int((s == "venda_perdida").sum())),
            revenue=("total", "sum"),
        )
        .sort_values(["revenue", "won"], ascending=False)
        .head(8)
    )
    sellers_group["conversionRate"] = (
        (sellers_group["won"] / sellers_group["proposals"]) * 100
    ).fillna(0).round(2)
    top_sellers = sellers_group.to_dict(orient="records")

    dist_group = (
        df.groupby("distributor", as_index=False)
        .agg(
            proposals=("status", "size"),
            won=("statusRaw", lambda s: int((s == "venda_fechada").sum())),
            revenue=("total", "sum"),
        )
        .sort_values(["revenue", "won"], ascending=False)
        .head(8)
    )
    top_distributors = dist_group.to_dict(orient="records")

    # Garante o uso das libs de visualização para padronizar paleta do frontend
    sns.set_theme(style="darkgrid")
    palette = sns.color_palette("deep", 5).as_hex()
    plt.close("all")

    insights = []
    if win_rate >= 35:
        insights.append(f"Taxa de ganho em bom nivel ({win_rate:.1f}%).")
    else:
        insights.append(f"Taxa de ganho em alerta ({win_rate:.1f}%). Revisar follow-up e condicoes comerciais.")

    if avg_ticket > 0:
        insights.append(f"Ticket medio das vendas fechadas: R$ {avg_ticket:,.2f}.")

    if top_sellers:
        leader = top_sellers[0]
        insights.append(
            f"Lider atual: {leader['seller']} com {leader['won']} vendas e R$ {leader['revenue']:,.2f}."
        )

    result = {
        "summary": {
            "totalProposals": total_proposals,
            "totalRevenueClosed": round(closed_revenue, 2),
            "winRate": round(win_rate, 2),
            "lossRate": round(loss_rate, 2),
            "avgTicket": round(avg_ticket, 2),
            "clientesAtivos": int(counters.get("clients", 0)),
            "distribuidoresAtivos": int(counters.get("distributors", 0)),
            "vendedoresAtivos": int(counters.get("sellers", 0)),
        },
        "statusBreakdown": status_breakdown,
        "monthlyTrend": monthly_trend,
        "topSellers": top_sellers,
        "topDistributors": top_distributors,
        "insights": insights,
        "palette": palette,
    }

    print(json.dumps(result, ensure_ascii=False))


if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print(
            json.dumps(
                {
                    "error": "Falha ao processar analise em Python",
                    "details": str(exc),
                },
                ensure_ascii=False,
            )
        )
        sys.exit(1)
