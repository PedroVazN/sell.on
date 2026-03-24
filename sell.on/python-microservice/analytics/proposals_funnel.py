"""Funil de propostas e métricas por estágio."""

from __future__ import annotations

import pandas as pd

from analytics.preprocessing import FUNNEL_ORDER, STATUS_LABELS_PT


def funnel_counts(df: pd.DataFrame) -> pd.DataFrame:
    """Contagem e valor médio por status (estágio)."""
    if df.empty:
        return pd.DataFrame(columns=["status", "status_label", "count", "valor_medio", "valor_total"])

    agg = (
        df.groupby("status", as_index=False)
        .agg(count=("status", "size"), valor_total=("total", "sum"), valor_medio=("total", "mean"))
    )
    agg["status_label"] = agg["status"].map(STATUS_LABELS_PT).fillna(agg["status"])
    agg = agg.sort_values(
        "status",
        key=lambda s: s.map({st: i for i, st in enumerate(FUNNEL_ORDER)}).fillna(99),
    )
    return agg


def funnel_conversion_rates(df: pd.DataFrame) -> pd.DataFrame:
    """Taxa de avanço aproximada entre estágios (ordem fixa do funil)."""
    if df.empty:
        return pd.DataFrame()

    counts = df["status"].value_counts()
    rows = []
    for i, st in enumerate(FUNNEL_ORDER[:-1]):
        n_here = int(counts.get(st, 0))
        next_st = FUNNEL_ORDER[i + 1]
        n_next = int(counts.get(next_st, 0))
        denom = n_here + n_next if (n_here + n_next) else 1
        rate = n_next / denom * 100 if denom else 0
        rows.append(
            {
                "de": st,
                "para": next_st,
                "count_origem": n_here,
                "count_destino": n_next,
                "taxa_transicao_pct": round(rate, 2),
            }
        )
    return pd.DataFrame(rows)


def bottleneck_score(funnel_df: pd.DataFrame) -> str | None:
    """Identifica estágio com maior acúmulo relativo (heurística simples)."""
    if funnel_df.empty or len(funnel_df) < 2:
        return None
    total = funnel_df["count"].sum()
    if not total:
        return None
    funnel_df = funnel_df.copy()
    funnel_df["pct"] = funnel_df["count"] / total * 100
    idx = funnel_df["pct"].idxmax()
    row = funnel_df.loc[idx]
    return f"Maior volume no estágio '{row['status_label']}' ({row['pct']:.1f}% das propostas)."
