# Configuração de Notificações WhatsApp

O sistema suporta notificações automáticas via WhatsApp quando:
- ✅ Uma proposta é criada
- ✅ Uma venda é fechada
- ❌ Uma venda é perdida

## ⚠️ IMPORTANTE: Compatibilidade com Vercel

**Evolution API e WppConnect NÃO funcionam na Vercel!**
- Eles precisam de um servidor próprio rodando 24/7
- Vercel é serverless (funções sem servidor permanente)
- Evolution API precisa manter conexão WebSocket ativa

**Para Vercel, use Twilio WhatsApp API (recomendado) ou outra solução serverless**

## Opções de Integração

### 1. Twilio WhatsApp API (🌟 RECOMENDADO para Vercel - Profissional)

**Vantagens:**
- ✅ Funciona perfeitamente na Vercel (serverless)
- ✅ Oficial e confiável (API do Meta/WhatsApp)
- ✅ Suporte profissional
- ✅ Não precisa manter servidor próprio
- ✅ Não há risco de bloqueio
- ✅ Mensagens ilimitadas (paga apenas pelo que usar)

**Desvantagens:**
- ❌ Custo por mensagem (aprox. R$ 0,02-0,05 por mensagem)
- ❌ Precisa aprovar número no Twilio

**Custo aproximado:**
- R$ 0,02-0,05 por mensagem enviada
- Se enviar 100 notificações/mês: ~R$ 2-5/mês

**Como configurar:**

1. Crie conta no [Twilio](https://www.twilio.com/) (free trial disponível)
2. Vá em "Messaging" > "WhatsApp" e ative WhatsApp
3. Adicione um número sandbox do Twilio (gratuito para testes)
4. Para produção, solicite aprovação do seu número
5. Configure as variáveis no `.env`:
```env
WHATSAPP_PROVIDER=twilio
TWILIO_ACCOUNT_SID=seu_account_sid
TWILIO_AUTH_TOKEN=seu_auth_token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

**Exemplo de configuração completa:**
```env
# WhatsApp Configuration para Vercel
WHATSAPP_PROVIDER=twilio
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
ADMIN_WHATSAPP_PHONE=55649999999999
```

### 2. Evolution API (Open Source - ⚠️ NÃO funciona na Vercel)

**⚠️ ATENÇÃO**: Esta opção NÃO funciona na Vercel!

**Vantagens:**
- Gratuito e open source
- Não requer aprovação do WhatsApp
- Funciona com WhatsApp pessoal
- Fácil de configurar

**Desvantagens:**
- ❌ Precisa de servidor próprio (VPS, AWS, DigitalOcean, etc.)
- ❌ Não funciona em ambiente serverless (Vercel, Netlify, etc.)
- ❌ Precisa manter servidor rodando 24/7

**Quando usar:**
- Se você tiver servidor próprio/VPS
- Se não quiser usar Twilio (custo)

**Como configurar (em servidor próprio):**

1. Instale o Evolution API em um servidor VPS seguindo a [documentação oficial](https://github.com/EvolutionAPI/evolution-api)

2. Configure as variáveis de ambiente no `.env`:
```env
WHATSAPP_PROVIDER=evolution
EVOLUTION_API_URL=https://seu-servidor.com:8080
EVOLUTION_API_KEY=sua_api_key_aqui
EVOLUTION_INSTANCE_NAME=default
```

3. Inicie o Evolution API e conecte seu WhatsApp escaneando o QR Code

### 3. WppConnect (Não-oficial - ⚠️ NÃO funciona na Vercel)

**Vantagens:**
- Gratuito
- Fácil de usar

**Desvantagens:**
- ❌ Não-oficial (pode ser bloqueado)
- ❌ Instável
- ❌ Precisa de servidor próprio (NÃO funciona na Vercel)

**Quando usar:**
- Apenas para testes locais
- Se tiver servidor próprio

**Como configurar (em servidor próprio):**
```env
WHATSAPP_PROVIDER=wppconnect
WPPCONNECT_URL=http://localhost:21465
WPPCONNECT_SESSION=default
```

## 🚀 Configuração Rápida para Vercel (Recomendado)

**Passo a passo:**

1. Crie conta no [Twilio](https://www.twilio.com/try-twilio) (gratuito para começar)

2. No painel do Twilio:
   - Vá em "Messaging" > "WhatsApp"
   - Use o número sandbox: `whatsapp:+14155238886` (para testes)
   - Para produção, solicite aprovação do seu número

3. Adicione as variáveis de ambiente na Vercel:
   - Vá em Settings > Environment Variables
   - Adicione:
     ```
     WHATSAPP_PROVIDER=twilio
     TWILIO_ACCOUNT_SID=seu_account_sid
     TWILIO_AUTH_TOKEN=seu_auth_token
     TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
     ADMIN_WHATSAPP_PHONE=55649999999999
     ```

4. Para usar em produção, você precisará:
   - Solicitar aprovação do número no Twilio
   - Adicionar números de destino permitidos (ou usar número sandbox para testes)

**Custo estimado:**
- ~100 notificações/mês: R$ 2-5/mês
- ~500 notificações/mês: R$ 10-25/mês
- ~1000 notificações/mês: R$ 20-50/mês

## Requisitos

1. **Telefone do Vendedor**: O vendedor precisa ter um telefone cadastrado no sistema (campo `phone` no modelo User)

2. **Telefone do Admin/Gerente**: Configure seu número para receber notificações também no `.env`:
   ```env
   ADMIN_WHATSAPP_PHONE=55649999999999
   ```
   **IMPORTANTE**: Use o formato com código do país (55 para Brasil) + DDD + número
   Exemplos:
   - `55649999999999` (correto)
   - `5564999999999` (correto)
   - `64999999999` (errado - falta código do país)

3. **Formato do Telefone**: O sistema aceita números no formato:
   - `(64) 99999-9999`
   - `64999999999`
   - `5564999999999` (com código do país)

4. **Ativação**: Configure a variável `WHATSAPP_PROVIDER` e `ADMIN_WHATSAPP_PHONE` no `.env` e reinicie o servidor

## Formato das Mensagens

### Proposta Criada
```
🎉 Nova Proposta Criada!

📋 Proposta: PRO-2025-001
👤 Cliente: João Silva
💰 Valor: R$ 1.500,00
📅 Válido até: 15/01/2025

Status: 🔄 Em Negociação
```

### Venda Fechada
```
🎊 Venda Fechada!

📋 Proposta: PRO-2025-001
👤 Cliente: João Silva
💰 Valor: R$ 1.500,00

Parabéns pela venda! 🎉
```

### Venda Perdida
```
😔 Venda Perdida

📋 Proposta: PRO-2025-001
👤 Cliente: João Silva
💰 Valor: R$ 1.500,00
📝 Motivo: Preço Concorrente

Não desanime! Continue trabalhando! 💪
```

## Desativar Notificações

Para desativar temporariamente, remova ou comente a variável `WHATSAPP_PROVIDER` no `.env`, ou defina um valor inválido.

## Troubleshooting

1. **Notificações não estão sendo enviadas:**
   - Verifique se o telefone do vendedor está cadastrado
   - Verifique os logs do servidor para erros
   - Confirme que a API está configurada corretamente

2. **Erro de formato de telefone:**
   - Certifique-se de que o telefone está no formato correto
   - O sistema tenta formatar automaticamente

3. **API não responde:**
   - Verifique se a URL da API está correta
   - Confirme que a API está rodando
   - Verifique as credenciais (API Key, tokens)

