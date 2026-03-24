"""
Dashboard de Inteligência Comercial — SellOn
Execute localmente: streamlit run streamlit_app.py
No Render: Start Command alternativo — streamlit run streamlit_app.py --server.port $PORT --server.address 0.0.0.0
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

import numpy as np
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import streamlit as st

from analytics.clients_segmentation import client_aggregates, cluster_clients
from analytics.filters import apply_filters
from analytics.insights_engine import generate_insights
from analytics.overview import compute_overview
from analytics.predictive import forecast_revenue_naive, score_open_proposals, train_win_models, try_xgboost_train
from analytics.preprocessing import proposals_to_dataframe
from analytics.proposals_funnel import bottleneck_score, funnel_conversion_rates, funnel_counts
from analytics.sellers_module import seller_monthly_pivot, seller_performance
from analytics.temporal import monthly_kpis, simple_trend_direction

st.set_page_config(
    page_title="SellOn — Inteligência Comercial",
    page_icon="📊",
    layout="wide",
    initial_sidebar_state="expanded",
)

st.title("📊 Inteligência Comercial & Ciência de Dados")
st.caption("Análise de propostas, vendedores e clientes — filtros por período, ML e insights automáticos.")

# ——— Dados ———
st.sidebar.header("1) Dados")
upload = st.sidebar.file_uploader("JSON exportado (proposals + counters)", type=["json"])
paste = st.sidebar.text_area("Ou cole o JSON aqui", height=120, placeholder='{"proposals":[], "counters":{}}')

raw = None
if upload is not None:
    raw = json.loads(upload.read().decode("utf-8"))
elif paste.strip():
    raw = json.loads(paste)

if not raw:
    st.info(
        "Carregue um arquivo JSON com o formato `{\"proposals\": [...], \"counters\": {...}}` "
        "(o mesmo payload enviado ao `/analyze` pelo backend SellOn)."
    )
    st.stop()

proposals = raw.get("proposals") or []
counters = raw.get("counters") or {}
df0 = proposals_to_dataframe(proposals)

# ——— Filtros ———
st.sidebar.header("2) Período & filtros")
date_mode = st.sidebar.radio("Modo de data", ["Todo o histórico", "Mês específico", "Intervalo personalizado"])

month_str = None
d_start, d_end = None, None
if not df0.empty and df0["month"].notna().any():
    months = sorted(df0["month"].dropna().unique())
else:
    months = []

if date_mode == "Mês específico" and months:
    month_str = st.sidebar.selectbox("Mês", months, index=len(months) - 1)
elif date_mode == "Intervalo personalizado":
    d_start = st.sidebar.date_input("Data inicial", value=pd.Timestamp("2024-01-01").date())
    d_end = st.sidebar.date_input("Data final", value=pd.Timestamp.today().date())

seller_opts = sorted(df0["seller"].dropna().unique()) if not df0.empty else []
client_opts = sorted(df0["client_key"].dropna().unique()) if not df0.empty else []
status_opts = sorted(df0["status"].dropna().unique()) if not df0.empty else []

sel_sellers = st.sidebar.multiselect("Vendedores", seller_opts)
sel_clients = st.sidebar.multiselect("Clientes (chave)", client_opts, max_selections=30)
sel_status = st.sidebar.multiselect("Status da proposta", status_opts)
v_min = st.sidebar.number_input("Valor mínimo (R$)", value=0.0)
v_max = st.sidebar.number_input("Valor máximo (R$)", value=0.0, help="0 = sem teto")
v_max_eff = None if v_max <= 0 else v_max

mode_map = {"Todo o histórico": "all", "Mês específico": "month", "Intervalo personalizado": "range"}
df = apply_filters(
    df0,
    date_mode=mode_map[date_mode],
    month_str=month_str,
    date_start=d_start,
    date_end=d_end,
    sellers=sel_sellers or None,
    clients=sel_clients or None,
    statuses=sel_status or None,
    value_min=v_min if v_min > 0 else None,
    value_max=v_max_eff,
)

st.sidebar.metric("Propostas (filtradas)", len(df))

# ——— Módulos ———
overview = compute_overview(df, counters)
sellers_df = seller_performance(df)
funnel_df = funnel_counts(df)
clients_base = client_aggregates(df)
clients_seg, seg_err = cluster_clients(clients_base, n_clusters=4)
monthly_full = monthly_kpis(df)
trend_msg = (
    simple_trend_direction(overview["receita_por_mes"]["receita"])
    if not overview["receita_por_mes"].empty
    else "Sem série mensal."
)
forecast = forecast_revenue_naive(overview["receita_por_mes"])
models = train_win_models(df)
open_scored = score_open_proposals(df, models)
xgb_res = try_xgboost_train(df)

insights = generate_insights(df, overview, sellers_df, funnel_df, clients_seg, trend_msg, forecast)

tab1, tab2, tab3, tab4, tab5, tab6, tab7 = st.tabs(
    [
        "Visão geral",
        "Vendedores",
        "Propostas & funil",
        "Clientes",
        "Temporal",
        "Preditivo",
        "Insights IA",
    ]
)

# --- Tab 1 ---
with tab1:
    c1, c2, c3, c4, c5 = st.columns(5)
    c1.metric("Receita (ganhas)", f"R$ {overview['receita_total']:,.0f}")
    c2.metric("Propostas", overview["n_propostas"])
    c3.metric("Ganhas / Perdidas", f"{overview['ganhas']} / {overview['perdidas']}")
    c4.metric("Conversão", f"{overview['taxa_conversao']:.1f}%")
    c5.metric("Ticket médio", f"R$ {overview['ticket_medio']:,.0f}")
    c6, c7 = st.columns(2)
    c6.metric("Pipeline aberto (qtd)", overview["pipeline_aberto"])
    c7.metric("Valor em pipeline", f"R$ {overview['pipeline_valor']:,.0f}")
    if overview["tempo_medio_fechamento_dias"]:
        st.metric("Tempo médio fechamento (dias)", f"{overview['tempo_medio_fechamento_dias']:.1f}")

    if not overview["receita_por_mes"].empty:
        fig = px.bar(
            overview["receita_por_mes"],
            x="month",
            y="receita",
            title="Receita mensal (propostas ganhas)",
        )
        st.plotly_chart(fig, use_container_width=True)
        fig2 = px.line(
            overview["receita_por_mes"],
            x="month",
            y="crescimento_pct",
            markers=True,
            title="Crescimento mês a mês (%) — receita",
        )
        st.plotly_chart(fig2, use_container_width=True)

# --- Tab 2 ---
with tab2:
    if sellers_df.empty:
        st.warning("Sem dados de vendedores.")
    else:
        st.dataframe(
            sellers_df,
            use_container_width=True,
            hide_index=True,
        )
        fig = px.bar(
            sellers_df.head(15),
            x="seller",
            y="receita",
            color="taxa_conversao",
            title="Receita por vendedor (top 15) — cor = conversão",
        )
        st.plotly_chart(fig, use_container_width=True)
        piv = seller_monthly_pivot(df)
        if not piv.empty and piv.shape[1] > 0:
            st.subheader("Heatmap receita — mês × vendedor")
            fig_h = px.imshow(
                piv.T,
                labels=dict(x="Mês", y="Vendedor", color="R$"),
                aspect="auto",
                title="Receita de ganhas",
            )
            st.plotly_chart(fig_h, use_container_width=True)

# --- Tab 3 ---
with tab3:
    st.subheader("Funil por estágio")
    if funnel_df.empty:
        st.warning("Sem funil.")
    else:
        fig_f = go.Figure(
            go.Funnel(
                y=funnel_df["status_label"],
                x=funnel_df["count"],
                textinfo="value+percent initial",
            )
        )
        fig_f.update_layout(title="Volume de propostas por estágio")
        st.plotly_chart(fig_f, use_container_width=True)
        st.dataframe(funnel_df, use_container_width=True, hide_index=True)
        st.subheader("Transições (heurística)")
        st.dataframe(funnel_conversion_rates(df), use_container_width=True, hide_index=True)
        bn = bottleneck_score(funnel_df)
        if bn:
            st.warning(bn)

# --- Tab 4 ---
with tab4:
    if clients_base.empty:
        st.warning("Sem clientes nas propostas.")
    else:
        st.dataframe(clients_base.head(50), use_container_width=True, hide_index=True)
        if seg_err:
            st.info(seg_err)
        else:
            fig_c = px.scatter(
                clients_seg,
                x="n_propostas",
                y="receita",
                color="segmento",
                size="ticket_medio",
                hover_data=["client_display"],
                title="Segmentação (K-Means) — frequência × receita",
            )
            st.plotly_chart(fig_c, use_container_width=True)

# --- Tab 5 ---
with tab5:
    if monthly_full.empty:
        st.warning("Sem série temporal.")
    else:
        fig_m = px.line(monthly_full, x="month", y="receita", markers=True, title="Receita mensal")
        st.plotly_chart(fig_m, use_container_width=True)
        fig_cnv = px.line(
            monthly_full, x="month", y="taxa_conversao", markers=True, title="Taxa de conversão mensal (%)"
        )
        st.plotly_chart(fig_cnv, use_container_width=True)
        fig_p = px.bar(monthly_full, x="month", y="propostas", title="Volume de propostas por mês")
        st.plotly_chart(fig_p, use_container_width=True)

# --- Tab 6 ---
with tab6:
    st.subheader("Probabilidade de ganho (propostas abertas)")
    if not models.get("ok"):
        st.info(models.get("message", "Modelo não disponível."))
    else:
        st.write(
            f"ROC-AUC (validação): LogReg ~ {models.get('roc_auc_lr')}, "
            f"RandomForest ~ {models.get('roc_auc_rf')}"
        )
        st.json(models.get("importances", {}))
        if not open_scored.empty and "prob_ganho" in open_scored.columns:
            show = open_scored[
                ["proposalNumber", "seller", "client_display", "total", "status", "prob_ganho"]
            ].head(30)
            st.dataframe(show, use_container_width=True, hide_index=True)
        else:
            st.info("Nenhuma proposta aberta ou sem scores.")

    st.subheader("XGBoost (opcional)")
    if xgb_res and xgb_res.get("ok"):
        st.success(f"XGBoost treinado — ROC-AUC ~ {xgb_res.get('roc_auc_xgb')}")
    else:
        st.caption("Instale `xgboost` no requirements para habilitar.")

    st.subheader("Previsão de receita (baseline)")
    if forecast.get("ok"):
        st.metric("Próximo mês (estimado)", f"R$ {forecast['proximo_mes_estimado']:,.0f}")
        st.caption(forecast.get("metodo", ""))
    else:
        st.info(forecast.get("message", ""))

# --- Tab 7 ---
with tab7:
    for line in insights:
        st.markdown(f"- {line}")
    st.divider()
    st.subheader("Insights adicionais do motor")
    if xgb_res and xgb_res.get("ok"):
        st.markdown("- Modelo com gradient boosting disponível para comparar com ensemble em árvores.")

st.sidebar.markdown("---")
st.sidebar.caption("Stack: Pandas, NumPy, scikit-learn, Plotly, Streamlit. Prophet/SQLAlchemy podem ser plugados em módulos futuros.")
