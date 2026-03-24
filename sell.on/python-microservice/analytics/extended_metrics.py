"""Métricas extras para o payload v2 (funil comercial, hábitos, aging, mix)."""

from __future__ import annotations

import math

import pandas as pd


def _safe_str(s) -> str:
    t = str(s or "").strip()
    return t if t else "Não informado"


def loss_reason_breakdown(df: pd.DataFrame, top: int = 8) -> list[dict]:
    lost = df[df["status"] == "venda_perdida"]
    if lost.empty:
        return []
    lr = lost["lossReason"].map(_safe_str)
    tmp = lost.assign(_reason=lr)
    g = (
        tmp.groupby("_reason", as_index=False)
        .agg(count=("proposal_id", "count"), value=("total", "sum"))
        .sort_values(["count", "value"], ascending=False)
        .head(top)
    )
    return [
        {
            "reason": str(row["_reason"])[:120],
            "count": int(row["count"]),
            "value": round(float(row["value"]), 2),
        }
        for _, row in g.iterrows()
    ]


def payment_condition_mix(df: pd.DataFrame, top: int = 10) -> list[dict]:
    if df.empty:
        return []
    pc = df["paymentCondition"].map(_safe_str)
    tmp = df.assign(_pc=pc)
    g = (
        tmp.groupby("_pc", as_index=False)
        .agg(count=("proposal_id", "count"), revenue=("total", "sum"))
        .sort_values("count", ascending=False)
        .head(top)
    )
    return [
        {
            "condition": str(row["_pc"])[:100],
            "count": int(row["count"]),
            "revenue": round(float(row["revenue"]), 2),
        }
        for _, row in g.iterrows()
    ]


def weekday_created_distribution(df: pd.DataFrame) -> list[dict]:
    valid = df.dropna(subset=["createdAt"])
    if valid.empty:
        return []
    labels = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"]
    dow = valid["createdAt"].dt.dayofweek
    out = []
    for i in range(7):
        m = dow == i
        sub = valid[m]
        out.append(
            {
                "weekday": i,
                "label": labels[i],
                "count": int(m.sum()),
                "revenue": round(float(sub["total"].sum()), 2),
            }
        )
    return out


def weekly_trend(df: pd.DataFrame, weeks: int = 12) -> list[dict]:
    valid = df.dropna(subset=["createdAt"]).copy()
    if valid.empty:
        return []
    valid["week"] = valid["createdAt"].dt.to_period("W-MON").astype(str)
    g = (
        valid.groupby("week", as_index=False)
        .agg(
            proposals=("proposal_id", "count"),
            won=("is_won", "sum"),
            lost=("is_lost", "sum"),
            revenue=("total", "sum"),
        )
        .sort_values("week")
        .tail(weeks)
    )
    return [
        {
            "week": str(row["week"]),
            "proposals": int(row["proposals"]),
            "won": int(row["won"]),
            "lost": int(row["lost"]),
            "revenue": round(float(row["revenue"]), 2),
        }
        for _, row in g.iterrows()
    ]


def ticket_size_buckets(df: pd.DataFrame) -> list[dict]:
    if df.empty:
        return []
    t = df["total"].clip(lower=0)
    bins = [-0.001, 5000, 20000, 100000, float("inf")]
    labels = ["Até R$ 5k", "R$ 5k – 20k", "R$ 20k – 100k", "Acima R$ 100k"]
    cat = pd.cut(t, bins=bins, labels=labels)
    tmp = df.assign(_b=cat.astype(str))
    g = tmp.groupby("_b", as_index=False).agg(count=("proposal_id", "count"), value=("total", "sum"))
    order = {lab: i for i, lab in enumerate(labels)}
    g["_ord"] = g["_b"].map(lambda x: order.get(x, 99))
    g = g.sort_values("_ord")
    return [
        {
            "bucket": str(row["_b"]),
            "count": int(row["count"]),
            "value": round(float(row["value"]), 2),
        }
        for _, row in g.iterrows()
    ]


def _age_days_open(created: pd.Series) -> pd.Series:
    ref = pd.Timestamp.now(tz="UTC")
    c = pd.to_datetime(created, utc=True, errors="coerce")
    delta = ref - c
    return delta.dt.total_seconds() / 86400.0


def open_pipeline_aging(df: pd.DataFrame) -> dict:
    sub = df[df["is_open"]].copy()
    if sub.empty:
        return {
            "buckets": [
                {"label": "0–7 dias", "count": 0, "value": 0.0},
                {"label": "8–30 dias", "count": 0, "value": 0.0},
                {"label": "31–90 dias", "count": 0, "value": 0.0},
                {"label": "90+ dias", "count": 0, "value": 0.0},
            ],
            "avgAgeDays": None,
            "staleOver90Count": 0,
            "staleOver90Value": 0.0,
        }
    sub = sub.dropna(subset=["createdAt"])
    if sub.empty:
        return {
            "buckets": [
                {"label": "0–7 dias", "count": 0, "value": 0.0},
                {"label": "8–30 dias", "count": 0, "value": 0.0},
                {"label": "31–90 dias", "count": 0, "value": 0.0},
                {"label": "90+ dias", "count": 0, "value": 0.0},
            ],
            "avgAgeDays": None,
            "staleOver90Count": 0,
            "staleOver90Value": 0.0,
        }

    age = _age_days_open(sub["createdAt"])
    age = age.fillna(0)

    def bucket_row(mask, label):
        m = sub[mask]
        return {"label": label, "count": int(len(m)), "value": round(float(m["total"].sum()), 2)}

    b0 = age <= 7
    b1 = (age > 7) & (age <= 30)
    b2 = (age > 30) & (age <= 90)
    b3 = age > 90

    buckets = [
        bucket_row(b0, "0–7 dias"),
        bucket_row(b1, "8–30 dias"),
        bucket_row(b2, "31–90 dias"),
        bucket_row(b3, "90+ dias"),
    ]
    stale = sub[b3]
    avg_age = float(age.mean()) if len(age) else None
    return {
        "buckets": buckets,
        "avgAgeDays": round(avg_age, 1) if avg_age is not None and not math.isnan(avg_age) else None,
        "staleOver90Count": int(len(stale)),
        "staleOver90Value": round(float(stale["total"].sum()), 2),
    }


def distributor_deep_stats(df: pd.DataFrame, top: int = 8) -> list[dict]:
    rows = []
    for dist, g in df.groupby("distributor"):
        n = len(g)
        w = int(g["is_won"].sum())
        l = int(g["is_lost"].sum())
        rev = float(g.loc[g["is_won"], "total"].sum())
        conv = (w / n * 100) if n else 0.0
        rows.append(
            {
                "distributor": str(dist)[:80],
                "proposals": n,
                "won": w,
                "lost": l,
                "revenue": round(rev, 2),
                "conversionRate": round(conv, 2),
                "avgTicket": round(rev / w, 2) if w else 0.0,
            }
        )
    rows.sort(key=lambda x: (-x["revenue"], -x["won"]))
    return rows[:top]


def repeat_client_summary(df: pd.DataFrame) -> dict:
    if df.empty:
        return {
            "clientsWithMultipleProposals": 0,
            "clientsSingleProposal": 0,
            "repeatRevenueSharePct": 0.0,
            "avgProposalsPerClient": 0.0,
        }
    by_c = df.groupby("client_key", as_index=False).agg(
        proposals=("proposal_id", "count"),
        won=("is_won", "sum"),
    )
    won_rev = df[df["is_won"]].groupby("client_key")["total"].sum()
    multi = by_c[by_c["proposals"] >= 2]
    single = by_c[by_c["proposals"] == 1]
    total_rev = float(won_rev.sum()) if len(won_rev) else 0.0
    repeat_rev = 0.0
    for ck in multi["client_key"]:
        if ck in won_rev.index:
            repeat_rev += float(won_rev[ck])
    share = (repeat_rev / total_rev * 100) if total_rev > 0 else 0.0
    return {
        "clientsWithMultipleProposals": int(len(multi)),
        "clientsSingleProposal": int(len(single)),
        "repeatRevenueSharePct": round(share, 1),
        "avgProposalsPerClient": round(float(by_c["proposals"].mean()), 2) if len(by_c) else 0.0,
    }


def items_intensity(df: pd.DataFrame) -> dict:
    if df.empty:
        return {
            "avgItemsOpen": 0.0,
            "avgItemsWon": 0.0,
            "avgItemsLost": 0.0,
            "maxItems": 0,
        }
    o = df[df["is_open"]]["items_count"]
    w = df[df["is_won"]]["items_count"]
    l = df[df["is_lost"]]["items_count"]
    return {
        "avgItemsOpen": round(float(o.mean()), 2) if len(o) else 0.0,
        "avgItemsWon": round(float(w.mean()), 2) if len(w) else 0.0,
        "avgItemsLost": round(float(l.mean()), 2) if len(l) else 0.0,
        "maxItems": int(df["items_count"].max()) if len(df) else 0,
    }


def discount_profile(df: pd.DataFrame) -> dict:
    """Compara desconto médio (valor) entre ganhas / abertas / perdidas."""
    if df.empty or "discount" not in df.columns:
        return {"avgDiscountWon": 0.0, "avgDiscountOpen": 0.0, "avgDiscountLost": 0.0, "pctProposalsWithDiscount": 0.0}
    with_disc = df[df["discount"] > 0]
    pct = len(with_disc) / len(df) * 100 if len(df) else 0.0

    def avg_disc(mask):
        sub = df[mask]["discount"]
        return round(float(sub.mean()), 2) if len(sub) else 0.0

    return {
        "avgDiscountWon": avg_disc(df["is_won"]),
        "avgDiscountOpen": avg_disc(df["is_open"]),
        "avgDiscountLost": avg_disc(df["is_lost"]),
        "pctProposalsWithDiscount": round(pct, 1),
    }


def model_feature_importance_chart(importances: dict | None, top: int = 10) -> list[dict]:
    if not importances:
        return []
    items = sorted(importances.items(), key=lambda x: -abs(float(x[1] or 0)))[:top]
    return [{"feature": str(k)[:48], "importance": round(float(v), 4)} for k, v in items]
