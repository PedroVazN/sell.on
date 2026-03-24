# Python Microservice (Analysis)

Pasta criada na raiz do projeto para hospedar o microserviço Python de análise.

## Caminho

`python-microservice/`

## Endpoints

- `GET /health`
- `POST /analyze`

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

