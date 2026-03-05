#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Serviço Python para Cálculo de Score Preditivo usando Machine Learning
Recebe dados JSON via stdin e retorna score calculado
"""

import sys
import json
import pickle
from datetime import datetime
from typing import Dict, Any, List
import warnings
warnings.filterwarnings('ignore')

try:
    import numpy as np
    import pandas as pd
    from sklearn.ensemble import RandomForestClassifier
    from sklearn.preprocessing import StandardScaler
    HAS_ML_LIBS = True
except ImportError:
    HAS_ML_LIBS = False
    print("AVISO: Bibliotecas ML não instaladas. Usando algoritmo estatístico básico.", file=sys.stderr)

def calculate_basic_score(proposal_data: Dict, historical_stats: Dict) -> Dict:
    """Cálculo básico quando ML não disponível"""
    score = 50.0
    factors = {}
    
    # Fator vendedor
    seller_rate = historical_stats.get('seller_rate', 0.5)
    factors['seller'] = {'score': seller_rate * 100, 'rate': seller_rate}
    score += (seller_rate - 0.5) * 40
    
    # Fator cliente
    client_rate = historical_stats.get('client_rate', 0.5)
    factors['client'] = {'score': client_rate * 100, 'rate': client_rate}
    score += (client_rate - 0.5) * 50
    
    # Fator valor
    value = proposal_data.get('total', 0)
    if 5000 <= value <= 50000:
        value_score = 85
    elif value > 0:
        value_score = 70
    else:
        value_score = 30
    factors['value'] = {'score': value_score}
    score = (score + value_score) / 2
    
    return {
        'score': max(0, min(100, score)),
        'percentual': round(max(0, min(100, score))),
        'factors': factors,
        'method': 'statistical'
    }

def calculate_ml_score(proposal_data: Dict, historical_data: List[Dict]) -> Dict:
    """Cálculo usando Machine Learning"""
    
    if not historical_data or len(historical_data) < 10:
        return calculate_basic_score(proposal_data, {
            'seller_rate': 0.5,
            'client_rate': 0.5
        })
    
    try:
        # Preparar dados para treinamento
        df = pd.DataFrame(historical_data)
        
        # Features numéricas
        feature_cols = [
            'total', 'days_since_creation', 'days_until_expiry',
            'items_count', 'discount_percentage', 'seller_conversion_rate',
            'client_conversion_rate', 'month', 'seller_proposals_count',
            'client_proposals_count', 'client_total_revenue'
        ]
        
        # Criar features se não existirem
        for col in feature_cols:
            if col not in df.columns:
                df[col] = 0
        
        # Features da proposta atual
        current_features = np.array([[
            proposal_data.get('total', 0),
            proposal_data.get('days_since_creation', 0),
            proposal_data.get('days_until_expiry', 30),
            proposal_data.get('items_count', 0),
            proposal_data.get('discount_percentage', 0),
            proposal_data.get('seller_conversion_rate', 0.5),
            proposal_data.get('client_conversion_rate', 0.5),
            proposal_data.get('month', datetime.now().month),
            proposal_data.get('seller_proposals_count', 0),
            proposal_data.get('client_proposals_count', 0),
            proposal_data.get('client_total_revenue', 0)
        ]])
        
        # Preparar dados de treinamento
        X = df[feature_cols].fillna(0).values
        y = (df['status'] == 'venda_fechada').astype(int).values
        
        # Treinar modelo (Random Forest)
        if len(np.unique(y)) > 1:  # Só treinar se houver variância
            model = RandomForestClassifier(
                n_estimators=100,
                max_depth=10,
                random_state=42,
                n_jobs=1
            )
            model.fit(X, y)
            
            # Fazer predição
            prediction_proba = model.predict_proba(current_features)[0]
            score = prediction_proba[1] * 100  # Probabilidade de fechar
            
            # Feature importance
            feature_importance = dict(zip(feature_cols, model.feature_importances_))
            
            return {
                'score': round(float(score), 1),
                'percentual': round(score),
                'confidence': min(95, 50 + len(historical_data) // 10),
                'method': 'ml_random_forest',
                'features_importance': feature_importance,
                'prediction_probability': float(prediction_proba[1])
            }
        else:
            return calculate_basic_score(proposal_data, {
                'seller_rate': proposal_data.get('seller_conversion_rate', 0.5),
                'client_rate': proposal_data.get('client_conversion_rate', 0.5)
            })
            
    except Exception as e:
        # Fallback para cálculo básico em caso de erro
        print(f"ERRO ML: {str(e)}", file=sys.stderr)
        return calculate_basic_score(proposal_data, {
            'seller_rate': proposal_data.get('seller_conversion_rate', 0.5),
            'client_rate': proposal_data.get('client_conversion_rate', 0.5)
        })

def determine_level(score: float) -> str:
    """Determina nível baseado no score"""
    if score >= 80:
        return 'alto'
    elif score >= 60:
        return 'medio'
    elif score >= 35:
        return 'baixo'
    else:
        return 'muito_baixo'

def generate_action(score: float, level: str, factors: Dict) -> str:
    """Gera ação inteligente baseada no score"""
    if level == 'alto':
        return f"🎯 EXCELENTE OPORTUNIDADE! Score {score:.1f}%. Priorizar follow-up imediato."
    elif level == 'medio':
        return f"📊 Negociação ativa. Score {score:.1f}%. Manter contato regular."
    elif level == 'baixo':
        return f"⚠️ ATENÇÃO NECESSÁRIA. Score {score:.1f}%. Revisar estratégia ou oferecer incentivo."
    else:
        return f"🚨 ALTO RISCO. Score {score:.1f}%. Ação imediata necessária."

def main():
    """Função principal - recebe JSON e retorna score"""
    try:
        # Ler dados JSON do stdin
        input_data = json.loads(sys.stdin.read())
        
        proposal = input_data.get('proposal', {})
        historical_data = input_data.get('historical_data', [])
        historical_stats = input_data.get('historical_stats', {})
        
        # Calcular score
        if HAS_ML_LIBS and historical_data and len(historical_data) >= 10:
            result = calculate_ml_score(proposal, historical_data)
        else:
            result = calculate_basic_score(proposal, historical_stats)
        
        # Adicionar informações adicionais
        result['level'] = determine_level(result['score'])
        result['action'] = generate_action(
            result['score'],
            result['level'],
            result.get('factors', {})
        )
        result['calculated_at'] = datetime.now().isoformat()
        result['algorithm_version'] = 'python-v1.0'
        
        # Retornar resultado JSON
        print(json.dumps(result, ensure_ascii=False))
        
    except Exception as e:
        # Retornar erro em formato JSON
        error_result = {
            'error': str(e),
            'score': 50,
            'percentual': 50,
            'level': 'medio',
            'action': 'Erro ao calcular score. Score neutro atribuído.',
            'method': 'error_fallback',
            'calculated_at': datetime.now().isoformat()
        }
        print(json.dumps(error_result, ensure_ascii=False))
        sys.exit(1)

if __name__ == '__main__':
    main()

