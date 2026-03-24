"""Análises temporais e sazonalidade leve."""

from __future__ import annotations

import pandas as pd


def monthly_kpis(df: pd.DataFrame) -> pd.DataFrame:
    if df.empty:
        return pd.DataFrame()
    base = df.dropna(subset=["month"])
    won = base[base["status"] == "venda_fechada"]
    lost = base[base["status"] == "venda_perdida"]
    rev = won.groupby("month", as_index=False).agg(receita=("total", "sum"))
    all_p = base.groupby("month", as_index=False).agg(propostas=("status", "size"))
    g = won.groupby("month", as_index=False).agg(ganhas=("status", "size"))
    l = lost.groupby("month", as_index=False).agg(perdidas=("status", "size"))
    out = all_p.merge(rev, on="month", how="left").merge(g, on="month", how="left").merge(l, on="month", how="left").fillna(0)
    out["taxa_conversao"] = (out["ganhas"] / out["propostas"] * 100).replace([float("inf")], 0).round(2)
    return out.sort_values("month")


def simple_trend_direction(monthly_receita: pd.Series) -> str:
    """Últimos 3 meses vs 3 anteriores."""
    if monthly_receita is None or len(monthly_receita) < 6:
        return "Histórico insuficiente para tendência."
    vals = monthly_receita.dropna().values
    if len(vals) < 6:
        return "Histórico insuficiente para tendência."
    recent = vals[-3:].mean()
    prev = vals[-6:-3].mean()
    if prev == 0:
        return "Base anterior nula; tendência não calculada."
    delta = (recent - prev) / prev * 100
    if delta > 5:
        return f"Tendência de crescimento na receita recente (~{delta:+.1f}% vs trimestre anterior)."
    if delta < -5:
        return f"Tendência de queda na receita recente (~{delta:+.1f}% vs trimestre anterior)."
    return f"Receita estável no comparativo de trimestres (~{delta:+.1f}%)."
