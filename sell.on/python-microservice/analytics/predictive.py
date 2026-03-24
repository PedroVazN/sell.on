"""Modelos preditivos: probabilidade de ganho, previsão de receita (baseline)."""

from __future__ import annotations

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import roc_auc_score
from sklearn.model_selection import train_test_split


def train_win_models(df: pd.DataFrame) -> dict:
    """Treina RandomForest e Regressão Logística. Retorna métricas e modelo principal."""
    out = {
        "ok": False,
        "message": "",
        "roc_auc_lr": None,
        "roc_auc_rf": None,
        "importances": None,
    }
    closed = df[df["status"].isin(["venda_fechada", "venda_perdida"])].copy()
    if len(closed) < 15:
        out["message"] = "Mínimo ~15 propostas fechadas (ganha/perdida) para treinar modelos."
        return out

    closed["y"] = (closed["status"] == "venda_fechada").astype(int)
    if closed["y"].nunique() < 2:
        out["message"] = "Só há uma classe (só ganhos ou só perdas); não é possível treinar classificador."
        return out

    X = np.column_stack(
        [
            np.log1p(closed["total"].clip(lower=0).values),
            closed["items_count"].fillna(0).values,
        ]
    )
    y = closed["y"].values

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.25, random_state=42, stratify=y
    )

    lr = LogisticRegression(max_iter=200, random_state=42)
    lr.fit(X_train, y_train)
    rf = RandomForestClassifier(n_estimators=80, max_depth=6, random_state=42)
    rf.fit(X_train, y_train)

    try:
        out["roc_auc_lr"] = round(float(roc_auc_score(y_test, lr.predict_proba(X_test)[:, 1])), 3)
    except Exception:
        out["roc_auc_lr"] = None
    try:
        out["roc_auc_rf"] = round(float(roc_auc_score(y_test, rf.predict_proba(X_test)[:, 1])), 3)
    except Exception:
        out["roc_auc_rf"] = None

    out["importances"] = {
        "log_valor_proposta": float(rf.feature_importances_[0]),
        "qtd_itens": float(rf.feature_importances_[1]),
    }
    out["model_lr"] = lr
    out["model_rf"] = rf
    out["ok"] = True
    out["message"] = "Modelos treinados."
    return out


def score_open_proposals(df: pd.DataFrame, models: dict) -> pd.DataFrame:
    """Probabilidade estimada de fechamento com ganho para propostas abertas."""
    open_df = df[df["status"].isin(["negociacao", "aguardando_pagamento"])].copy()
    if open_df.empty or not models.get("ok"):
        return open_df.assign(prob_ganho_lr=np.nan, prob_ganho_rf=np.nan)

    X = np.column_stack(
        [
            np.log1p(open_df["total"].clip(lower=0).values),
            open_df["items_count"].fillna(0).values,
        ]
    )
    lr = models["model_lr"]
    rf = models["model_rf"]
    open_df = open_df.copy()
    open_df["prob_ganho_lr"] = lr.predict_proba(X)[:, 1]
    open_df["prob_ganho_rf"] = rf.predict_proba(X)[:, 1]
    open_df["prob_ganho"] = (open_df["prob_ganho_lr"] + open_df["prob_ganho_rf"]) / 2
    return open_df.sort_values("prob_ganho", ascending=False)


def forecast_revenue_naive(monthly_df: pd.DataFrame, horizon: int = 1) -> dict:
    """Previsão simples: tendência linear sobre receita mensal (numpy.polyfit)."""
    if monthly_df is None or monthly_df.empty or "receita" not in monthly_df.columns:
        return {"ok": False, "message": "Sem série de receita mensal."}

    y = monthly_df["receita"].astype(float).values
    if len(y) < 3:
        return {"ok": False, "message": "Mínimo 3 meses para previsão."}

    x = np.arange(len(y), dtype=float)
    coef = np.polyfit(x, y, 1)
    next_x = len(y) + horizon - 1
    pred = float(np.polyval(coef, next_x))
    pred = max(pred, 0.0)
    return {
        "ok": True,
        "proximo_mes_estimado": round(pred, 2),
        "coef_angular": round(float(coef[0]), 4),
        "metodo": "tendência linear (baseline)",
    }


def try_xgboost_train(df: pd.DataFrame) -> dict | None:
    """Opcional: XGBoost se o pacote estiver instalado."""
    try:
        import xgboost as xgb
    except ImportError:
        return None

    closed = df[df["status"].isin(["venda_fechada", "venda_perdida"])].copy()
    if len(closed) < 20 or closed["status"].nunique() < 2:
        return None

    closed["y"] = (closed["status"] == "venda_fechada").astype(int)
    X = np.column_stack(
        [
            np.log1p(closed["total"].clip(lower=0).values),
            closed["items_count"].fillna(0).values,
        ]
    )
    y = closed["y"].values
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42, stratify=y)

    model = xgb.XGBClassifier(
        n_estimators=60, max_depth=4, learning_rate=0.1, random_state=42, eval_metric="logloss"
    )
    model.fit(X_train, y_train)
    try:
        auc = round(float(roc_auc_score(y_test, model.predict_proba(X_test)[:, 1])), 3)
    except Exception:
        auc = None
    return {"model_xgb": model, "roc_auc_xgb": auc, "ok": True}
