# Instalação do Serviço Python para IA

## Requisitos

- Python 3.7 ou superior
- pip (gerenciador de pacotes Python)

## Instalação

1. Instale as dependências:
```bash
cd backend/services
pip install -r requirements.txt
```

Ou com Python 3 explicitamente:
```bash
python3 -m pip install -r requirements.txt
```

## Verificação

Teste se está funcionando:
```bash
python3 backend/services/proposalScorePython.py
```

(Deve retornar um erro de JSON, o que é esperado - significa que o script está funcionando)

## Uso

O sistema Node.js chama automaticamente o Python quando:
- Você passar `?method=python` na rota de score
- Ou usar a rota `/api/proposals/:id/score/compare` para comparar ambos

## Fallback

Se Python não estiver instalado ou der erro, o sistema automaticamente usa JavaScript (método estatístico).

