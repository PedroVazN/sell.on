# Configuração de Variáveis de Ambiente (.env)

## Para Desenvolvimento Local

1. Copie o arquivo `.env.example` para `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edite o arquivo `.env` e preencha com seus valores:
   - MongoDB URI
   - JWT Secret
   - Credenciais do Twilio

## Para Produção (Vercel)

1. Acesse seu projeto na Vercel
2. Vá em **Settings** > **Environment Variables**
3. Adicione todas as variáveis do `.env.example`

## Variáveis Obrigatórias

### Mínimas para funcionar:
```env
MONGODB_URI=sua_uri_aqui
JWT_SECRET=seu_secret_aqui
```

### Para WhatsApp (Twilio):
```env
WHATSAPP_PROVIDER=twilio
TWILIO_ACCOUNT_SID=seu_account_sid
TWILIO_AUTH_TOKEN=seu_auth_token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
ADMIN_WHATSAPP_PHONE=55649999999999
```

## Exemplo Completo

```env
# Básico
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
JWT_SECRET=seu_jwt_secret_super_seguro

# WhatsApp Twilio
WHATSAPP_PROVIDER=twilio
TWILIO_ACCOUNT_SID=1a028a0c0ce702a7878bb6fff444670d
TWILIO_AUTH_TOKEN=seu_auth_token_do_twilio
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
ADMIN_WHATSAPP_PHONE=55649999999999
```

## ⚠️ IMPORTANTE

- **NUNCA** commite o arquivo `.env` no Git
- Use `.env.example` como template
- Na Vercel, adicione as variáveis no painel (não use arquivo .env)

