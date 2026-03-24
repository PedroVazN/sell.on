# Python Microservice (Analysis)

Pasta criada na raiz do projeto para hospedar o microserviço Python de análise.

## Caminho no repositório (monorepo)

`sell.on/python-microservice/`

No Render, use **Root Directory:** `sell.on/python-microservice`.

## Endpoints

- `GET /` — informações do serviço (abrir no navegador não dá mais 404)
- `GET /health`
- `POST /analyze`

## Variável na Vercel (backend) — obrigatória para usar o Python do Render

O motor de análise em **produção** é o Flask **hospedado no Render**. Na Vercel, no projeto do **backend**, defina:

`PYTHON_ANALYSIS_URL` = URL base do serviço no Render, por exemplo:

- `https://SEU-SERVICO.onrender.com` — o Node acrescenta `/analyze` automaticamente, ou
- `https://SEU-SERVICO.onrender.com/analyze` — URL completa

Sem essa variável, o dashboard usa só **Node** (sem treino ML).

Opcional: `PYTHON_ANALYSIS_TIMEOUT_MS` (padrão 120000) para cold start do Render.

Opcional (desenvolvimento / VPS com repo completo): `PYTHON_ANALYSIS_LOCAL_FALLBACK=true` tenta `spawn` em `backend/python/analysis_engine.py` se o Render falhar.

Teste: `https://SEU-SERVICO.onrender.com/health` deve retornar JSON com `"ok": true`.

## Deploy no Render (grátis)

- Build Command: `pip install -r requirements.txt`
- Start Command: `gunicorn app:app`

## Exemplo de payload para `/analyze`

```json
{
  "proposals": [],
  "counters": {
    "clients": 0,
    "distributors": 0,
    "sellers": 0
  }
}
```

