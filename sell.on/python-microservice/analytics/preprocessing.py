"""Normalização de propostas (JSON da API SellOn) para DataFrame analítico."""

from __future__ import annotations

import pandas as pd


# Alinhado a backend/routes/analysis.js STATUS_LABELS (contrato API + React Analysis).
STATUS_LABELS_PT = {
    "negociacao": "Em negociacao",
    "aguardando_pagamento": "Aguardando pagamento",
    "venda_fechada": "Ganhas",
    "venda_perdida": "Perdidas",
    "expirada": "Expiradas",
}

# Ordem lógica do funil (para análise de estágios)
FUNNEL_ORDER = [
    "negociacao",
    "aguardando_pagamento",
    "venda_fechada",
    "venda_perdida",
    "expirada",
]


def _to_float(x) -> float:
    try:
        return float(x or 0)
    except (TypeError, ValueError):
        return 0.0


def proposals_to_dataframe(proposals: list) -> pd.DataFrame:
    """Converte lista de propostas (dict) no formato Mongo/API para um único DataFrame."""
    rows = []
    for p in proposals or []:
        client = p.get("client") or {}
        seller = p.get("seller") or {}
        dist = p.get("distributor") or {}
        items = p.get("items") or []

        email = (client.get("email") or "").strip().lower()
        cnpj = (client.get("cnpj") or "").strip()
        razao = (client.get("razaoSocial") or client.get("company") or "").strip()
        client_key = email or cnpj or razao or "Cliente não identificado"
        client_display = razao or client.get("name") or client_key

        rows.append(
            {
                "proposal_id": str(p.get("_id", "")),
                "proposalNumber": p.get("proposalNumber"),
                "status": p.get("status") or "negociacao",
                "status_label": STATUS_LABELS_PT.get(
                    p.get("status") or "negociacao", p.get("status") or "negociacao"
                ),
                "total": _to_float(p.get("total")),
                "subtotal": _to_float(p.get("subtotal")),
                "discount": _to_float(p.get("discount")),
                "seller": seller.get("name") or "Sem vendedor",
                "seller_id": str(seller.get("_id", "")),
                "distributor": dist.get("apelido") or dist.get("razaoSocial") or "Sem distribuidor",
                "client_key": client_key,
                "client_display": client_display,
                "items_count": len(items) if isinstance(items, list) else 0,
                "paymentCondition": (p.get("paymentCondition") or "")[:80],
                "lossReason": p.get("lossReason") or "",
                "createdAt": p.get("createdAt"),
                "updatedAt": p.get("updatedAt"),
                "closedAt": p.get("closedAt"),
                "validUntil": p.get("validUntil"),
            }
        )

    df = pd.DataFrame(rows)
    if df.empty:
        return df

    df["createdAt"] = pd.to_datetime(df["createdAt"], errors="coerce")
    df["closedAt"] = pd.to_datetime(df["closedAt"], errors="coerce")
    df["validUntil"] = pd.to_datetime(df["validUntil"], errors="coerce")
    df["month"] = df["createdAt"].dt.to_period("M").astype(str)

    # Tempo até fechamento (dias) — apenas ganhas com closedAt
    mask_won = df["status"] == "venda_fechada"
    df["days_to_close"] = pd.NA
    df.loc[mask_won, "days_to_close"] = (
        df.loc[mask_won, "closedAt"] - df.loc[mask_won, "createdAt"]
    ).dt.days

    df["is_won"] = df["status"] == "venda_fechada"
    df["is_lost"] = df["status"] == "venda_perdida"
    df["is_open"] = df["status"].isin(["negociacao", "aguardando_pagamento"])

    return df
