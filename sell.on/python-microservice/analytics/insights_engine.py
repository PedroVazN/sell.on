"""Insights automáticos em linguagem natural (regras + estatísticas)."""

from __future__ import annotations

import pandas as pd


def generate_insights(
    df: pd.DataFrame,
    overview: dict,
    sellers_df: pd.DataFrame,
    funnel_df: pd.DataFrame,
    clients_df: pd.DataFrame,
    trend_msg: str,
    forecast: dict,
) -> list[str]:
    out: list[str] = []

    if df.empty:
        return ["Sem propostas no período filtrado."]

    taxa = overview.get("taxa_conversao", 0)
    if taxa >= 35:
        out.append(f"Taxa de conversão global forte: {taxa:.1f}%.")
    else:
        out.append(f"Taxa de conversão abaixo do benchmark típico: {taxa:.1f}% — revisar follow-up e proposta de valor.")

    if overview.get("tempo_medio_fechamento_dias"):
        out.append(
            f"Tempo médio até fechamento (ganhas): {overview['tempo_medio_fechamento_dias']:.1f} dias."
        )

    if not sellers_df.empty and len(sellers_df) >= 2:
        med_conv = sellers_df["taxa_conversao"].mean()
        top = sellers_df.iloc[0]
        if top["taxa_conversao"] > med_conv * 1.2:
            out.append(
                f"O vendedor {top['seller']} está com taxa de conversão "
                f"{((top['taxa_conversao'] / med_conv - 1) * 100):.0f}% acima da média do time."
            )

    if not funnel_df.empty:
        m = funnel_df.loc[funnel_df["count"].idxmax()]
        out.append(
            f"Maior concentração de propostas no estágio '{m['status_label']}' "
            f"({m['count']} propostas, valor médio R$ {m['valor_medio']:,.2f})."
        )

    if not clients_df.empty and "segmento" in clients_df.columns:
        seg_avg = clients_df.groupby("segmento")["receita"].mean().sort_values(ascending=False)
        if len(seg_avg) > 0:
            out.append(
                f"Segmento de clientes com maior ticket médio (proxy LTV): cluster {seg_avg.index[0]} "
                f"(R$ {seg_avg.iloc[0]:,.2f} em receita média)."
            )

    out.append(trend_msg)

    if forecast.get("ok"):
        out.append(
            f"Previsão baseline de receita no próximo mês: R$ {forecast['proximo_mes_estimado']:,.2f} "
            f"({forecast.get('metodo', '')})."
        )

    return out
