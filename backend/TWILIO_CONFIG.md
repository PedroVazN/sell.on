# Configuração Twilio WhatsApp - Passo a Passo

## 1. Criar Conta no Twilio

1. Acesse: https://www.twilio.com/try-twilio
2. Crie uma conta gratuita (tem crédito para testes)
3. Confirme seu e-mail e número de telefone

## 2. Obter Credenciais

1. No painel do Twilio, vá em **Console Dashboard**
2. Você verá:
   - **Account SID**: Começa com `AC...`
   - **Auth Token**: Clique em "show" para revelar

## 3. Configurar WhatsApp

1. No menu lateral, vá em **Messaging** > **Try it out** > **Send a WhatsApp message**
2. Ou vá em **Messaging** > **Senders** > **WhatsApp**
3. Use o número sandbox do Twilio: `+14155238886`
4. Para adicionar números para receber mensagens (modo sandbox):
   - Vá em **Messaging** > **Try it out** > **Send a WhatsApp message**
   - Clique em "Join Sandbox"
   - Escaneie o QR Code com seu WhatsApp
   - Agora você pode receber mensagens deste número sandbox

## 4. Configurar Variáveis de Ambiente

### No arquivo `.env` local:
```env
WHATSAPP_PROVIDER=twilio
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=seu_auth_token_aqui
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
ADMIN_WHATSAPP_PHONE=55649999999999
```

### Na Vercel:
1. Vá no seu projeto na Vercel
2. **Settings** > **Environment Variables**
3. Adicione cada variável:
   - `WHATSAPP_PROVIDER` = `twilio`
   - `TWILIO_ACCOUNT_SID` = seu Account SID
   - `TWILIO_AUTH_TOKEN` = seu Auth Token
   - `TWILIO_WHATSAPP_FROM` = `whatsapp:+14155238886`
   - `ADMIN_WHATSAPP_PHONE` = seu número (ex: `55649999999999`)

## 5. Formato do Número

**IMPORTANTE**: Use o formato internacional completo:
- ✅ Correto: `55649999999999` (código país 55 + DDD 64 + número)
- ✅ Correto: `5564999999999` (11 dígitos total)
- ❌ Errado: `64999999999` (falta código do país)
- ❌ Errado: `(64) 99999-9999` (tem caracteres especiais)

## 6. Testar

1. Configure as variáveis
2. Faça deploy na Vercel (ou reinicie servidor local)
3. Crie uma proposta ou feche uma venda
4. Você deve receber a notificação no WhatsApp

## 7. Produção

Para usar em produção (não sandbox):
1. Solicite aprovação do número no Twilio
2. Adicione seu número como remetente
3. Troque `TWILIO_WHATSAPP_FROM` para seu número aprovado

## Troubleshooting

**Erro: "Unable to create record"**
- Verifique se o número de destino está no formato correto
- No modo sandbox, o número precisa estar cadastrado (escaneado QR Code)

**Erro: "Unauthorized"**
- Verifique Account SID e Auth Token
- Certifique-se de copiar completo (sem espaços)

**Não recebe mensagem**
- No modo sandbox, você precisa escanear o QR Code primeiro
- Verifique se o número está no formato correto (55 + DDD + número)

