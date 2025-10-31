# Configuração de Notificações WhatsApp

O sistema suporta notificações automáticas via WhatsApp quando:
- ✅ Uma proposta é criada
- ✅ Uma venda é fechada
- ❌ Uma venda é perdida

## Opções de Integração

### 1. Evolution API (Recomendado - Open Source)

**Vantagens:**
- Gratuito e open source
- Não requer aprovação do WhatsApp
- Funciona com WhatsApp pessoal
- Fácil de configurar

**Como configurar:**

1. Instale o Evolution API seguindo a [documentação oficial](https://github.com/EvolutionAPI/evolution-api)

2. Configure as variáveis de ambiente no `.env`:
```env
WHATSAPP_PROVIDER=evolution
EVOLUTION_API_URL=http://localhost:8080
EVOLUTION_API_KEY=sua_api_key_aqui
EVOLUTION_INSTANCE_NAME=default
```

3. Inicie o Evolution API e conecte seu WhatsApp escaneando o QR Code

### 2. Twilio WhatsApp API (Profissional - Pago)

**Vantagens:**
- Oficial e confiável
- Suporte profissional
- Não precisa manter servidor

**Como configurar:**

1. Crie conta no [Twilio](https://www.twilio.com/)
2. Ative WhatsApp no Twilio
3. Configure as variáveis no `.env`:
```env
WHATSAPP_PROVIDER=twilio
TWILIO_ACCOUNT_SID=seu_account_sid
TWILIO_AUTH_TOKEN=seu_auth_token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

### 3. WppConnect (Não-oficial)

**Vantagens:**
- Gratuito
- Fácil de usar

**Desvantagens:**
- Não-oficial (pode ser bloqueado)
- Instável

**Como configurar:**
```env
WHATSAPP_PROVIDER=wppconnect
WPPCONNECT_URL=http://localhost:21465
WPPCONNECT_SESSION=default
```

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

