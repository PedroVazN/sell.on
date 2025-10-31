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

## 3. Configurar WhatsApp (IMPORTANTE!)

### Passo 1: Ativar WhatsApp Sandbox
1. No menu lateral do Twilio, vá em **Messaging** > **Try it out** > **Send a WhatsApp message**
2. Ou acesse diretamente: https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn
3. Você verá um número sandbox: `+1 415 523 8886` (ou similar)
4. **ANOTE O CÓDIGO DE CONFIRMAÇÃO** que aparece (ex: "join <código>")

### Passo 2: Cadastrar seu número para receber mensagens
1. Envie uma mensagem para o número sandbox do Twilio no WhatsApp
2. Envie o código de confirmação que você viu (ex: "join <código>")
3. Você receberá uma confirmação "You're all set!"
4. **IMPORTANTE**: Você só pode receber mensagens se fizer isso primeiro!

### Passo 3: Configurar o número "From"
**O número sandbox padrão é:** `whatsapp:+14155238886`

**IMPORTANTE:**
- Use exatamente: `whatsapp:+14155238886` (com "whatsapp:" e "+")
- Não esqueça o "whatsapp:" no início
- Não esqueça o "+" antes do número

## 4. Configurar Variáveis de Ambiente

### No arquivo `.env` local:
```env
WHATSAPP_PROVIDER=twilio
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=seu_auth_token_aqui
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
ADMIN_WHATSAPP_PHONE=55649999999999
```

**⚠️ ATENÇÃO - Formato do TWILIO_WHATSAPP_FROM:**
- ✅ Correto: `whatsapp:+14155238886`
- ❌ Errado: `+14155238886` (falta "whatsapp:")
- ❌ Errado: `14155238886` (falta "whatsapp:" e "+")
- ❌ Errado: `whatsapp:14155238886` (falta "+")

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

**Erro: "Twilio could not find a Channel with the specified 'From' address"**
- ✅ **Solução**: Configure `TWILIO_WHATSAPP_FROM=whatsapp:+14155238886` (com "whatsapp:" e "+")
- Verifique se copiou o número completo sem espaços
- O código agora usa o sandbox padrão automaticamente se não configurar

**Erro: "Unable to create record"**
- Verifique se o número de destino está no formato correto
- No modo sandbox, o número precisa estar cadastrado (enviar "join <código>" primeiro)

**Erro: "Unauthorized"**
- Verifique Account SID e Auth Token
- Certifique-se de copiar completo (sem espaços)
- Auth Token é diferente do Account SID

**Não recebe mensagem**
- No modo sandbox, você precisa enviar "join <código>" para o número sandbox primeiro
- Verifique se o número ADMIN_WHATSAPP_PHONE está no formato correto (55 + DDD + número)
- Confirme que você está usando o mesmo número que cadastrou no sandbox

