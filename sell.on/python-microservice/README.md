# Python Microservice (Analysis)

Pasta criada na raiz do projeto para hospedar o microserviço Python de análise.

## Caminho no repositório (monorepo)

`sell.on/python-microservice/`

No Render, use **Root Directory:** `sell.on/python-microservice`.

## Endpoints

- `GET /` — informações do serviço (abrir no navegador não dá mais 404)
- `GET /health`
- `POST /analyze`

## Variável na Vercel (backend)

`PYTHON_ANALYSIS_URL` pode ser:

- `https://SEU-SERVICO.onrender.com` (o backend acrescenta `/analyze` sozinho), ou
- `https://SEU-SERVICO.onrender.com/analyze` (explícito)

Teste no navegador: `https://SEU-SERVICO.onrender.com/health` deve retornar JSON com `"engine": "python"`.

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

