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

### HTTP 500 em `POST /analyze`

- Veja **Logs** do serviço no Render: o traceback completo vai para stderr.
- Causas comuns: payload muito grande (muitas propostas), memória do plano free, ou dependência faltando após redeploy.
- O corpo da resposta 500 inclui `message` com o erro resumido (o frontend da Vercel pode exibir isso).

## Deploy no Render (grátis)

- **Root Directory** (no painel do serviço): `sell.on/python-microservice`
- Build Command: `pip install -r requirements.txt`

### Blueprint (`render.yaml`)

Na **raiz do repositório** existe `render.yaml` com `rootDir: sell.on/python-microservice`, `startCommand` com `--bind 0.0.0.0:$PORT` e `healthCheckPath: /health`. Ao criar o serviço por **Blueprint**, o comando certo deixa de depender só do que está escrito no painel.

### Start Command e porta (evita “Port scan timeout”)

O Render só considera o serviço **saudável** se algo escutar em **`0.0.0.0:$PORT`** (`$PORT` é variável injetada pelo Render).

**Opção A — recomendada:** deixe o campo **Start Command vazio** no painel e use o **`Procfile`** desta pasta (`web: gunicorn ... --bind 0.0.0.0:$PORT ...`). Se você digitou manualmente só `gunicorn app:app`, isso **substitui** o Procfile — os logs mostram exatamente isso e o health check pode falhar.

**Opção B:** no painel, Start Command **exatamente** (uma linha):

```bash
gunicorn app:app --bind 0.0.0.0:$PORT --workers 1 --threads 1 --timeout 120 --access-logfile - --error-logfile -
```

Não use apenas `gunicorn app:app` sem `--bind 0.0.0.0:$PORT`.

### Cold start e health check

O `POST /analyze` carrega pandas/sklearn só **no primeiro pedido** a essa rota, para `/` e `/health` ficarem leves e o worker passar no health check logo após o deploy.

- **Health Check Path** (recomendado): `/health`

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

