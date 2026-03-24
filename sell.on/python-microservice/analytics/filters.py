"""Filtros avançados (período, vendedor, cliente, status, valor)."""

from __future__ import annotations

import pandas as pd


def apply_filters(
    df: pd.DataFrame,
    *,
    date_mode: str,
    month_str: str | None = None,
    date_start=None,
    date_end=None,
    sellers: list[str] | None = None,
    clients: list[str] | None = None,
    statuses: list[str] | None = None,
    value_min: float | None = None,
    value_max: float | None = None,
) -> pd.DataFrame:
    """date_mode: 'all' | 'month' | 'range'."""
    if df.empty:
        return df

    out = df.copy()

    if date_mode == "month" and month_str:
        out = out[out["month"] == month_str]
    elif date_mode == "range" and date_start is not None and date_end is not None:
        start = pd.Timestamp(date_start)
        end = pd.Timestamp(date_end) + pd.Timedelta(days=1)
        out = out[(out["createdAt"] >= start) & (out["createdAt"] < end)]

    if sellers:
        out = out[out["seller"].isin(sellers)]
    if clients:
        out = out[out["client_key"].isin(clients)]
    if statuses:
        out = out[out["status"].isin(statuses)]
    if value_min is not None:
        out = out[out["total"] >= value_min]
    if value_max is not None:
        out = out[out["total"] <= value_max]

    return out
