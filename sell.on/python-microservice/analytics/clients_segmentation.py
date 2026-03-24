"""Agregação por cliente e segmentação (K-Means)."""

from __future__ import annotations

import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler


def client_aggregates(df: pd.DataFrame) -> pd.DataFrame:
    """Métricas por cliente derivadas das propostas."""
    if df.empty:
        return pd.DataFrame()

    base = df.groupby(["client_key", "client_display"], as_index=False).agg(
        n_propostas=("status", "size"),
        ultima_proposta=("createdAt", "max"),
        primeira_proposta=("createdAt", "min"),
    )
    won = df[df["status"] == "venda_fechada"]
    rev = won.groupby(["client_key", "client_display"], as_index=False).agg(
        receita=("total", "sum"),
        n_ganhas=("status", "size"),
    )
    g = base.merge(rev, on=["client_key", "client_display"], how="left").fillna({"receita": 0, "n_ganhas": 0})
    g["receita"] = g["receita"].astype(float)
    g["n_ganhas"] = g["n_ganhas"].astype(int)
    g["ticket_medio"] = np.where(g["n_ganhas"] > 0, g["receita"] / g["n_ganhas"], 0.0)
    g["frequencia"] = g["n_propostas"]
    g["ltv_proxy"] = g["receita"]
    return g.sort_values("receita", ascending=False)


def cluster_clients(client_df: pd.DataFrame, n_clusters: int = 4) -> tuple[pd.DataFrame, str | None]:
    """K-Means em features RFM-like: receita, frequência, recência (dias)."""
    if client_df.empty or len(client_df) < max(2, min(n_clusters, 3)):
        return client_df.assign(segmento=pd.NA), "Dados insuficientes para clusterização (mínimo de clientes)."

    work = client_df.copy()
    today = pd.Timestamp.utcnow().tz_localize(None)
    work["ultima_proposta"] = pd.to_datetime(work["ultima_proposta"])
    work["recency_days"] = (today - work["ultima_proposta"]).dt.days.fillna(999)
    feats = work[["receita", "n_propostas", "recency_days"]].values.astype(float)
    feats = StandardScaler().fit_transform(feats)
    k = min(max(2, n_clusters), len(work))
    km = KMeans(n_clusters=k, random_state=42, n_init=10)
    work["segmento"] = km.fit_predict(feats).astype(str)
    return work, None
