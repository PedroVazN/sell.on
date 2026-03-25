"""Modelos preditivos: probabilidade de ganho, previsão de receita (baseline)."""

from __future__ import annotations

from collections import Counter
import math

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import roc_auc_score
from sklearn.model_selection import train_test_split


def _safe_train_test_split(X, y, test_size=0.25, random_state=42):
    """Evita falha de stratify com classes muito desbalanceadas."""
    cnt = Counter(y)
    if len(cnt) < 2 or min(cnt.values()) < 2:
        return train_test_split(X, y, test_size=test_size, random_state=random_state)
    try:
        return train_test_split(X, y, test_size=test_size, random_state=random_state, stratify=y)
    except ValueError:
        return train_test_split(X, y, test_size=test_size, random_state=random_state)


def train_win_models(df: pd.DataFrame) -> dict:
    """Treina RandomForest e Regressão Logística. Retorna métricas e modelo principal."""
    out = {
        "ok": False,
        "message": "",
        "roc_auc_lr": None,
        "roc_auc_rf": None,
        "importances": None,
    }
    try:
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
                np.log1p(np.nan_to_num(closed["total"].clip(lower=0).values, nan=0.0)),
                np.nan_to_num(closed["items_count"].fillna(0).values, nan=0.0),
            ]
        )
        y = closed["y"].values.astype(int)

        if not np.isfinite(X).all():
            out["message"] = "Features inválidas (NaN/Inf) nas propostas fechadas."
            return out

        X_train, X_test, y_train, y_test = _safe_train_test_split(X, y)

        lr = LogisticRegression(max_iter=500, random_state=42, solver="lbfgs")
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
    except Exception as exc:
        out["message"] = f"Falha no treino: {exc!s}"[:220]
        return out


def score_open_proposals(df: pd.DataFrame, models: dict) -> pd.DataFrame:
    """Probabilidade estimada de fechamento com ganho para propostas abertas."""
    open_df = df[df["status"].isin(["negociacao", "aguardando_pagamento"])].copy()
    if open_df.empty or not models.get("ok"):
        return open_df.assign(prob_ganho_lr=np.nan, prob_ganho_rf=np.nan)

    X = np.column_stack(
        [
            np.log1p(np.nan_to_num(open_df["total"].clip(lower=0).values, nan=0.0)),
            np.nan_to_num(open_df["items_count"].fillna(0).values, nan=0.0),
        ]
    )
    lr = models["model_lr"]
    rf = models["model_rf"]
    open_df = open_df.copy()
    open_df["prob_ganho_lr"] = lr.predict_proba(X)[:, 1]
    open_df["prob_ganho_rf"] = rf.predict_proba(X)[:, 1]
    open_df["prob_ganho"] = (open_df["prob_ganho_lr"] + open_df["prob_ganho_rf"]) / 2
    return open_df.sort_values("prob_ganho", ascending=False)


def _clamp01(x: float) -> float:
    try:
        v = float(x)
    except Exception:
        return 0.0
    if not math.isfinite(v):
        return 0.0
    return max(0.0, min(1.0, v))


def _safe_pct(x: float | None) -> float | None:
    if x is None:
        return None
    try:
        v = float(x)
    except Exception:
        return None
    if not math.isfinite(v):
        return None
    return v * 100.0


def _norm_bucket_str(s: str, limit: int = 40) -> str:
    t = str(s or "").strip().lower().replace("\n", " ").replace("\t", " ")
    if not t:
        return "Sem info"
    t = t[: limit].strip()
    return t if t else "Sem info"


def _build_win_rate_map(closed_df: pd.DataFrame, group_col: str, value_col: str = "status") -> dict:
    """Retorna dict: group_value -> win_rate (0..1)."""
    if closed_df.empty or group_col not in closed_df.columns:
        return {}
    if value_col not in closed_df.columns:
        return {}

    tmp = closed_df.copy()
    tmp["is_won"] = tmp[value_col] == "venda_fechada"
    g = tmp.groupby(group_col, dropna=False).agg(total=(value_col, "size"), won=("is_won", "sum"))
    out = {}
    for idx, row in g.iterrows():
        total = int(row.get("total", 0) or 0)
        won = int(row.get("won", 0) or 0)
        if total > 0:
            out[str(idx)] = won / total
    return out


def _bucketize_series(values: pd.Series, bins: list[float], labels: list[str]) -> pd.Series:
    # Cut com include_lowest para capturar o limite inferior.
    cat = pd.cut(values.astype(float), bins=bins, labels=labels, include_lowest=True)
    return cat.astype(str).fillna("Sem info")


def build_pipeline_deep_scores(
    df: pd.DataFrame,
    models: dict,
    top_n: int = 20,
    bottom_n: int = 10,
) -> dict:
    """
    Score por proposta aberta, com breakdown para o dashboard.
    Combina:
      - base do ML (quando treinado) com
      - heuristicas: aging, conversao historica (cliente/seller/distribuidor), pagamento, itens, desconto, engajamento e sazonalidade.
    """
    open_df = df[df["status"].isin(["negociacao", "aguardando_pagamento"])].copy()
    if open_df.empty:
        return {"top20": [], "bottom10": [], "totalOpen": 0}

    # Usar agora tz-naive para evitar misturar com datetime tz-aware.
    # A normalização (tz_convert(None)) das colunas vem abaixo.
    now = pd.Timestamp.now()
    # Garantir que o pandas não mistura tz-aware/tz-naive.
    if "createdAt" in open_df.columns:
        if getattr(open_df["createdAt"].dt, "tz", None) is not None:
            open_df["createdAt"] = open_df["createdAt"].dt.tz_convert(None)
    # Calcular aging com cuidado de timezone.
    try:
        open_df["negotiationDays"] = ((now - open_df["createdAt"]).dt.total_seconds() / 86400.0).replace(
            [np.inf, -np.inf], np.nan
        )
    except TypeError:
        # Se ainda houver mistura tz-aware/tz-naive, garantimos tz-naive.
        try:
            open_df["createdAt"] = open_df["createdAt"].dt.tz_localize(None)
        except Exception:
            pass
        open_df["negotiationDays"] = ((now - open_df["createdAt"]).dt.total_seconds() / 86400.0).replace(
            [np.inf, -np.inf], np.nan
        )

    if "updatedAt" in open_df.columns:
        if getattr(open_df["updatedAt"].dt, "tz", None) is not None:
            open_df["updatedAt"] = open_df["updatedAt"].dt.tz_convert(None)
        try:
            open_df["daysSinceUpdate"] = ((now - open_df["updatedAt"]).dt.total_seconds() / 86400.0).replace(
                [np.inf, -np.inf], np.nan
            )
        except TypeError:
            try:
                open_df["updatedAt"] = open_df["updatedAt"].dt.tz_localize(None)
            except Exception:
                pass
            open_df["daysSinceUpdate"] = ((now - open_df["updatedAt"]).dt.total_seconds() / 86400.0).replace(
                [np.inf, -np.inf], np.nan
            )
    else:
        open_df["daysSinceUpdate"] = np.nan

    # Closed history para conversoes historicas e sazonalidade.
    closed_df = df[df["status"].isin(["venda_fechada", "venda_perdida"])].copy()
    overall_win_rate = 0.5
    if not closed_df.empty:
        overall_win_rate = _clamp01(
            (closed_df["status"] == "venda_fechada").sum() / max(len(closed_df), 1)
        )

    # ML base probability (por proposta).
    open_df["baseModelProb"] = np.nan
    open_df["baseModelProbLr"] = np.nan
    open_df["baseModelProbRf"] = np.nan
    if models.get("ok"):
        scored = score_open_proposals(df, models)
        # Join por proposal_id (existe no output do preprocessing).
        cols = [c for c in ["proposal_id", "prob_ganho", "prob_ganho_lr", "prob_ganho_rf"] if c in scored.columns]
        if "proposal_id" in cols and "prob_ganho" in cols:
            scored = scored[cols].copy()
            open_df = open_df.merge(scored, on="proposal_id", how="left")
            open_df.rename(
                columns={
                    "prob_ganho": "baseModelProb",
                    "prob_ganho_lr": "baseModelProbLr",
                    "prob_ganho_rf": "baseModelProbRf",
                },
                inplace=True,
            )

    # Maps de win-rate por categorias.
    client_win = _build_win_rate_map(closed_df, "client_key")
    seller_win = _build_win_rate_map(closed_df, "seller")
    dist_win = _build_win_rate_map(closed_df, "distributor")

    # Pagamento (bucketizado por string normalizada)
    if not closed_df.empty and "paymentCondition" in closed_df.columns:
        closed_df = closed_df.copy()
        closed_df["paymentBucket"] = closed_df["paymentCondition"].map(_norm_bucket_str)
        pay_win = _build_win_rate_map(closed_df, "paymentBucket")
        overall_pay = pay_win.get("Sem info") if "Sem info" in pay_win else overall_win_rate
    else:
        pay_win = {}
        overall_pay = overall_win_rate

    # Desconto (bucket por faixa)
    if not closed_df.empty and "discount" in closed_df.columns:
        closed_df = closed_df.copy()
        closed_df["discountBucket"] = _bucketize_series(
            closed_df["discount"].fillna(0),
            bins=[-0.1, 0, 5, 10, 15, 20, 1000],
            labels=["0", "0-5", "5-10", "10-15", "15-20", "20+"],
        )
        disc_win = _build_win_rate_map(closed_df, "discountBucket")
    else:
        disc_win = {}

    # Produtos (itens_count)
    if not closed_df.empty and "items_count" in closed_df.columns:
        closed_df = closed_df.copy()
        closed_df["itemsBucket"] = _bucketize_series(
            closed_df["items_count"].fillna(0),
            bins=[-0.1, 2, 5, 10, 1000],
            labels=["0-2", "3-5", "6-10", "10+"],
        )
        items_win = _build_win_rate_map(closed_df, "itemsBucket")
    else:
        items_win = {}

    # Sazonalidade (mês de criação)
    season_win = {}
    if not closed_df.empty and "month" in closed_df.columns:
        season_win = _build_win_rate_map(closed_df, "month")

    # Default score neutro caso não exista bucket no histórico.
    def _lookup(map_obj: dict, key: str) -> float:
        if not map_obj:
            return overall_win_rate
        v = map_obj.get(str(key), None)
        if v is None:
            return overall_win_rate
        return _clamp01(v)

    # Scores por proposta.
    open_df["clientWinRate"] = open_df["client_key"].map(lambda k: _lookup(client_win, k))
    open_df["sellerWinRate"] = open_df["seller"].map(lambda k: _lookup(seller_win, k))
    open_df["distWinRate"] = open_df["distributor"].map(lambda k: _lookup(dist_win, k))

    open_df["clientWeightedScore"] = (
        0.6 * open_df["clientWinRate"] + 0.2 * open_df["sellerWinRate"] + 0.2 * open_df["distWinRate"]
    )

    if "paymentCondition" in open_df.columns:
        open_df["paymentBucket"] = open_df["paymentCondition"].map(_norm_bucket_str)
        open_df["paymentWinRate"] = open_df["paymentBucket"].map(lambda k: pay_win.get(str(k), overall_pay))
    else:
        open_df["paymentWinRate"] = overall_win_rate

    if "discount" in open_df.columns:
        open_df["discountBucket"] = _bucketize_series(
            open_df["discount"].fillna(0),
            bins=[-0.1, 0, 5, 10, 15, 20, 1000],
            labels=["0", "0-5", "5-10", "10-15", "15-20", "20+"],
        )
        open_df["discountWinRate"] = open_df["discountBucket"].map(lambda k: disc_win.get(str(k), overall_win_rate))
    else:
        open_df["discountWinRate"] = overall_win_rate

    if "items_count" in open_df.columns:
        open_df["itemsBucket"] = _bucketize_series(
            open_df["items_count"].fillna(0),
            bins=[-0.1, 2, 5, 10, 1000],
            labels=["0-2", "3-5", "6-10", "10+"],
        )
        open_df["itemsWinRate"] = open_df["itemsBucket"].map(lambda k: items_win.get(str(k), overall_win_rate))
    else:
        open_df["itemsWinRate"] = overall_win_rate

    if "month" in open_df.columns:
        open_df["seasonalityWinRate"] = open_df["month"].map(lambda k: season_win.get(str(k), overall_win_rate))
    else:
        open_df["seasonalityWinRate"] = overall_win_rate

    # Aging: score maior se criado há menos dias.
    days = open_df["negotiationDays"].fillna(30.0).clip(lower=0)
    open_df["negotiationScore"] = 1.0 / (1.0 + (days / 30.0) ** 1.25)

    # Engajamento: atualizacao recente (proxy).
    upd = open_df["daysSinceUpdate"].fillna(np.nan)
    engagement = []
    for v in upd.tolist():
        if v is None or (isinstance(v, float) and (math.isnan(v) or not math.isfinite(v))):
            engagement.append(0.5)
        else:
            engagement.append(1.0 / (1.0 + (float(v) / 7.0) ** 1.35))
    open_df["engagementScore"] = engagement

    # Heuristica agregada (prob. "explicavel").
    heuristic_prob = (
        0.20 * open_df["negotiationScore"]
        + 0.25 * open_df["clientWeightedScore"]
        + 0.10 * open_df["paymentWinRate"]
        + 0.10 * open_df["itemsWinRate"]
        + 0.10 * open_df["discountWinRate"]
        + 0.10 * open_df["engagementScore"]
        + 0.15 * open_df["seasonalityWinRate"]
    )

    base_prob = open_df["baseModelProb"].fillna(overall_win_rate)
    final_prob = 0.45 * base_prob + 0.55 * heuristic_prob
    open_df["finalProb"] = final_prob.map(_clamp01)
    open_df["finalChancePct"] = (open_df["finalProb"] * 100.0).round(1)
    open_df["riskPct"] = (100.0 - open_df["finalChancePct"]).round(1)

    # Sinais de risco (texto).
    def _signals(row: pd.Series) -> list[str]:
        sig = []
        d = row.get("negotiationDays", None)
        if d is not None and math.isfinite(float(d)):
            if float(d) > 90:
                sig.append("Risco alto: pipeline aberto > 90 dias.")
            elif float(d) > 60:
                sig.append("Risco: pipeline aberto > 60 dias.")
            elif float(d) > 30:
                sig.append("Atenção: pipeline aberto > 30 dias.")
        c_wr = row.get("clientWinRate", None)
        if c_wr is not None and math.isfinite(float(c_wr)):
            if float(c_wr) < 0.25:
                sig.append("Cliente com histórico baixo de ganho.")
            elif float(c_wr) > 0.65:
                sig.append("Cliente com histórico forte de ganho.")
        p_wr = row.get("paymentWinRate", None)
        if p_wr is not None and math.isfinite(float(p_wr)):
            if float(p_wr) < 0.30:
                sig.append("Condição de pagamento com baixa taxa histórica.")
        if row.get("engagementScore", 0.5) < 0.35:
            sig.append("Engajamento/atualização antiga (proxy).")
        return sig[:5]

    open_df["signals"] = open_df.apply(_signals, axis=1)

    def _label(row: pd.Series) -> str:
        proposal_no = row.get("proposalNumber", None)
        client = row.get("client_display", None)
        seller = row.get("seller", None)
        if proposal_no not in (None, "") and not (isinstance(proposal_no, float) and math.isnan(proposal_no)):
            return f"Proposta {proposal_no} - {str(client)[:40]}"
        return f"{str(client)[:40]} - {str(seller)[:30]}"

    open_df["label"] = open_df.apply(_label, axis=1)

    # Construir saída serializavel.
    def _to_item(row: pd.Series) -> dict:
        proposal_id = str(row.get("proposal_id", "") or "")
        proposal_number = row.get("proposalNumber", None)
        try:
            if isinstance(proposal_number, float) and math.isnan(proposal_number):
                proposal_number = None
        except Exception:
            pass
        value = float(row.get("total", 0) or 0)
        discount = float(row.get("discount", 0) or 0)
        items_count = int(row.get("items_count", 0) or 0)
        negotiation_days = row.get("negotiationDays", None)
        try:
            negotiation_days = None if negotiation_days is None else float(negotiation_days)
        except Exception:
            negotiation_days = None
        days_since_update = row.get("daysSinceUpdate", None)
        try:
            if days_since_update is None or not math.isfinite(float(days_since_update)):
                days_since_update = None
            else:
                days_since_update = float(days_since_update)
        except Exception:
            days_since_update = None

        return {
            "proposalId": proposal_id,
            "proposalNumber": proposal_number,
            "label": str(row.get("label", "") or "")[:120],
            "clientDisplay": str(row.get("client_display", "") or "")[:80],
            "seller": str(row.get("seller", "") or "")[:60],
            "distributor": str(row.get("distributor", "") or "")[:60],
            "value": round(value, 2),
            "chancePct": float(row.get("finalChancePct", 0) or 0),
            "riskPct": float(row.get("riskPct", 0) or 0),
            "baseModelProbPct": float((_safe_pct(row.get("baseModelProb", None)) or overall_win_rate * 100.0)) if row.get("baseModelProb", None) is not None else None,
            "breakdown": {
                "negotiationDays": round(negotiation_days, 1) if negotiation_days is not None else None,
                "negotiationScore": round(float(row.get("negotiationScore", 0.0) or 0.0), 4),
                "clientWinRatePct": float(row.get("clientWinRate", overall_win_rate) * 100.0),
                "sellerWinRatePct": float(row.get("sellerWinRate", overall_win_rate) * 100.0),
                "distributorWinRatePct": float(row.get("distWinRate", overall_win_rate) * 100.0),
                "clientWeightedScore": round(float(row.get("clientWeightedScore", overall_win_rate) or overall_win_rate), 4),
                "paymentCondition": str(row.get("paymentCondition", "") or "")[:80],
                "paymentWinRatePct": float(row.get("paymentWinRate", overall_win_rate) * 100.0),
                "productsItemsCount": items_count,
                "productsWinRatePct": float(row.get("itemsWinRate", overall_win_rate) * 100.0),
                "discountPct": round(discount, 2),
                "discountWinRatePct": float(row.get("discountWinRate", overall_win_rate) * 100.0),
                "engagementDaysAgo": days_since_update,
                "engagementScore": round(float(row.get("engagementScore", 0.5) or 0.5), 4),
                "seasonalityMonth": str(row.get("month", "") or ""),
                "seasonalityWinRatePct": float(row.get("seasonalityWinRate", overall_win_rate) * 100.0),
                "signals": row.get("signals", []) or [],
            },
        }

    scored_df = open_df.sort_values("finalChancePct", ascending=False).copy()
    top_df = scored_df.head(top_n)
    bottom_df = scored_df.tail(bottom_n).sort_values("finalChancePct", ascending=True)

    return {
        "top20": [_to_item(r) for _, r in top_df.iterrows()],
        "bottom10": [_to_item(r) for _, r in bottom_df.iterrows()],
        "totalOpen": int(len(scored_df)),
    }


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
