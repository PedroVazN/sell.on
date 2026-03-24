"""Visão geral comercial — KPIs e séries agregadas."""

from __future__ import annotations

import pandas as pd


def compute_overview(df: pd.DataFrame, counters: dict | None = None) -> dict:
    counters = counters or {}
    if df.empty:
        return {
            "receita_total": 0.0,
            "n_propostas": 0,
            "ganhas": 0,
            "perdidas": 0,
            "taxa_conversao": 0.0,
            "ticket_medio": 0.0,
            "tempo_medio_fechamento_dias": None,
            "pipeline_aberto": 0,
            "pipeline_valor": 0.0,
            "receita_por_mes": pd.DataFrame(),
            "crescimento_mensal_pct": pd.DataFrame(),
            "clientes_ativos_sistema": int(counters.get("clients", 0)),
            "distribuidores_ativos": int(counters.get("distributors", 0)),
            "vendedores_ativos": int(counters.get("sellers", 0)),
        }

    won = df[df["status"] == "venda_fechada"]
    lost = df[df["status"] == "venda_perdida"]
    open_pipe = df[df["status"].isin(["negociacao", "aguardando_pagamento"])]

    receita = float(won["total"].sum())
    n = len(df)
    g, p = len(won), len(lost)
    taxa = (g / n * 100) if n else 0.0
    ticket = float(won["total"].mean()) if len(won) else 0.0

    dtc = won["days_to_close"].dropna()
    tempo_medio = float(dtc.mean()) if len(dtc) else None

    base = (
        df.dropna(subset=["month"])
        .groupby("month", as_index=False)
        .agg(propostas=("status", "size"))
    )
    rev = (
        won.dropna(subset=["month"])
        .groupby("month", as_index=False)
        .agg(receita=("total", "sum"), ganhas=("status", "size"))
    )
    lost_m = (
        df[df["status"] == "venda_perdida"]
        .dropna(subset=["month"])
        .groupby("month", as_index=False)
        .agg(perdidas=("status", "size"))
    )
    all_months = base.merge(rev, on="month", how="left").merge(lost_m, on="month", how="left").fillna(
        {"receita": 0, "ganhas": 0, "perdidas": 0}
    )
    all_months["receita"] = all_months["receita"].astype(float)
    all_months["ganhas"] = all_months["ganhas"].astype(int)
    all_months["perdidas"] = all_months["perdidas"].astype(int)
    all_months = all_months.sort_values("month")
    all_months["crescimento_pct"] = all_months["receita"].pct_change() * 100

    return {
        "receita_total": receita,
        "n_propostas": n,
        "ganhas": g,
        "perdidas": p,
        "taxa_conversao": round(taxa, 2),
        "ticket_medio": round(ticket, 2),
        "tempo_medio_fechamento_dias": round(tempo_medio, 1) if tempo_medio is not None else None,
        "pipeline_aberto": len(open_pipe),
        "pipeline_valor": float(open_pipe["total"].sum()),
        "receita_por_mes": all_months,
        "crescimento_mensal_pct": all_months[["month", "crescimento_pct"]],
        "clientes_ativos_sistema": int(counters.get("clients", 0)),
        "distribuidores_ativos": int(counters.get("distributors", 0)),
        "vendedores_ativos": int(counters.get("sellers", 0)),
    }
