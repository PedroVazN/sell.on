"""Análise de desempenho por vendedor."""

from __future__ import annotations

import pandas as pd


def seller_performance(df: pd.DataFrame) -> pd.DataFrame:
    if df.empty:
        return pd.DataFrame()

    tot = df.groupby("seller", as_index=False).agg(propostas=("status", "size"))
    won = df[df["status"] == "venda_fechada"]
    lost = df[df["status"] == "venda_perdida"]

    w = (
        won.groupby("seller", as_index=False)
        .agg(receita=("total", "sum"), ganhas=("status", "size"))
    )
    l = lost.groupby("seller", as_index=False).agg(perdidas=("status", "size"))

    g = tot.merge(w, on="seller", how="left").merge(l, on="seller", how="left")
    g = g.fillna({"receita": 0, "ganhas": 0, "perdidas": 0})
    g["receita"] = g["receita"].astype(float)
    g["ganhas"] = g["ganhas"].astype(int)
    g["perdidas"] = g["perdidas"].astype(int)

    g["taxa_conversao"] = (g["ganhas"] / g["propostas"] * 100).replace([float("inf")], 0).fillna(0).round(2)
    g["ticket_medio"] = 0.0
    mask = g["ganhas"] > 0
    g.loc[mask, "ticket_medio"] = (g.loc[mask, "receita"] / g.loc[mask, "ganhas"]).round(2)
    g["ticket_medio"] = g["ticket_medio"].fillna(0).replace([float("inf"), float("-inf")], 0)

    dtc = won.groupby("seller", as_index=False).agg(tempo_medio_fechamento_dias=("days_to_close", "mean"))
    g = g.merge(dtc, on="seller", how="left")

    g["ranking_receita"] = g["receita"].rank(ascending=False, method="min").astype(int)
    mx = g["receita"].max() or 1.0
    g["eficiencia_score"] = (g["taxa_conversao"] * 0.4 + (g["receita"] / mx * 100) * 0.6).round(2)
    return g.sort_values("receita", ascending=False)


def seller_monthly_pivot(df: pd.DataFrame) -> pd.DataFrame:
    if df.empty:
        return pd.DataFrame()
    sub = df.dropna(subset=["month"])
    won = sub[sub["status"] == "venda_fechada"]
    if won.empty:
        return pd.DataFrame()
    return won.pivot_table(index="month", columns="seller", values="total", aggfunc="sum", fill_value=0)
