# 🧪 Como Testar e Validar WhatsApp Twilio

## ⚠️ Erro: "Twilio could not find a Channel with the specified 'From' address"

Este erro significa que o **WhatsApp Sandbox não está ativo** na sua conta Twilio.

## ✅ SOLUÇÃO COMPLETA (Passo a Passo)

### Passo 1: Ativar WhatsApp Sandbox

1. Acesse: https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn
2. **Faça login na sua conta Twilio**
3. Se você ver a página de "Try it out", o sandbox já está ativo
4. Se não vir, procure no menu: **Messaging** → **Try it out** → **Send a WhatsApp message**

### Passo 2: Descobrir seu número sandbox EXATO

1. Na página do WhatsApp Sandbox, procure por:
   - **"From"** ou **"Sandbox Number"**
   - Um campo mostrando um número no formato: `+1 415 XXX XXXX`

2. **Anote o número EXATO** que aparece
   - Exemplo: Se aparecer `+1 415 523 8886`
   - Use no .env: `whatsapp:+14155238886` (sem espaços)

3. **Se não encontrar o número:**
   - O sandbox pode não estar totalmente ativado
   - Tente criar uma nova conta Twilio ou contatar suporte

### Passo 3: Cadastrar seu número (OBRIGATÓRIO!)

⚠️ **SEM ISSO, VOCÊ NÃO RECEBE MENSAGENS!**

1. Abra o WhatsApp no seu celular
2. Envie uma mensagem para o número sandbox (o que você descobriu no Passo 2)
3. O Twilio vai te enviar um código de confirmação (ex: "join <código>")
4. Envie esse código de volta para o número sandbox
5. Você receberá: **"You're all set!"**
6. Agora você pode receber mensagens do sandbox

### Passo 4: Configurar no .env

```env
WHATSAPP_PROVIDER=twilio
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=seu_token_aqui
TWILIO_WHATSAPP_FROM=whatsapp:+1415XXXXXXXX
ADMIN_WHATSAPP_PHONE=5511999999999
```

Ao marcar proposta como **venda fechada**, o sistema envia WhatsApp com:
- Número da proposta
- Vendedor que fechou
- Distribuidor
- Lista de produtos (nome, quantidade, subtotal)
- Total da proposta
- Data/hora do fechamento

Destinatário: apenas `ADMIN_WHATSAPP_PHONE` (seu WhatsApp). Não envia ao criar proposta nem em venda perdida.

Exemplo de mensagem:

```
✅ *Venda fechada — Sell.On*

📋 *Proposta:* PROP-2025-001
👤 *Vendedor:* Maria Silva
🏢 *Distribuidor:* Distribuidora ABC
👥 *Cliente:* Cliente XYZ

📦 *Produtos:*
• Produto A — 10 un. — R$ 1.500,00
• Produto B — 2 un. — R$ 800,00

💰 *Total:* R$ 2.300,00
🕐 *Fechada em:* 18/05/2026 às 14:30
```

Variáveis mínimas no Vercel (backend):

```env
WHATSAPP_PROVIDER=twilio
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=seu_token_aqui
TWILIO_WHATSAPP_FROM=whatsapp:+1415XXXXXXXX
ADMIN_WHATSAPP_PHONE=5511999999999
```

**Substitua:**
- `1415XXXXXXXX` pelo número sandbox EXATO que você descobriu
- `5511962234936` pelo seu número (código país 55 + DDD + número)

### Passo 5: Testar

1. Reinicie o servidor backend
2. Crie uma proposta no sistema
3. Verifique os logs do backend - devem mostrar:
   ```
   📋 Configuração Twilio:
      Account SID: ACxxxxxxxx
      From (configurado): whatsapp:+1415XXXXXXXX
      From (usando): whatsapp:+1415XXXXXXXX
   ```
4. Se ainda der erro, verifique:
   - O número está correto?
   - O sandbox está ativo?
   - Você cadastrou seu número no sandbox?

## 🔍 Verificar se está configurado

### Via Console Twilio:
1. Vá em: **Messaging** → **Try it out** → **Send a WhatsApp message**
2. Você DEVE ver um formulário para enviar mensagens
3. Se não ver, o sandbox não está ativo

### Via API (teste):
Você pode testar enviando uma mensagem diretamente pelo console do Twilio para verificar se o número funciona.

## ❌ Problemas Comuns

### "Channel not found"
- ✅ Solução: Ative o WhatsApp Sandbox no console Twilio
- ✅ Certifique-se que o número começa com `+1415`
- ✅ Verifique que você copiou o número corretamente

### "Não recebo mensagens"
- ✅ Solução: Você precisa cadastrar seu número primeiro (Passo 3)
- ✅ Certifique-se que enviou "join <código>" para o sandbox
- ✅ Use o MESMO número que cadastrou no sandbox como ADMIN_WHATSAPP_PHONE

### "Unauthorized"
- ✅ Solução: Verifique Account SID e Auth Token
- ✅ Certifique-se de copiar completo (sem espaços)

## 📞 Precisa de Ajuda?

Se ainda não funcionar:
1. Verifique os logs do backend para mensagens de erro detalhadas
2. Confirme que seguiu TODOS os passos acima
3. Tente criar uma nova conta Twilio se necessário
4. Contate o suporte Twilio se o sandbox não aparecer no console

