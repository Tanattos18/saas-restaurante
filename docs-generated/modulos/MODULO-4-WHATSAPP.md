# Módulo 4 — Bot WhatsApp (Evolution API v2)

## Objetivo
Implementar o bot de atendimento automático via WhatsApp com máquina de estado completa.

## Arquivos

### lib/whatsapp.ts
- sendText, sendButtons, sendList — chamadas Evolution API v2
- parseWebhookPayload — converte webhook bruto em { phone, text, type }
- formatPhone — normaliza número para 5511999999999

### services/whatsapp/message.service.ts
- sendMessage — wrapper que resolve instanceName e chama Evolution API
- getInstanceName — cache de instância por tenant

### services/whatsapp/templates.ts
- 10 funções de template: welcomeNew, welcomeReturning, requestName, requestAddress, mainMenu, categoryMenu, productMenu, orderSummary, orderConfirmed, pixPayment

### services/whatsapp/flow.service.ts
- FlowContext: interface do contexto da sessão (cart, selectedCategoryId, orderType, invalidAttempts)
- sendMenu, sendCategories, sendProductsByCategory — envio de cardápio

### services/whatsapp/bot.service.ts
- Máquina de estado com 11 estados:
  WELCOME → COLLECTING_NAME → COLLECTING_ADDRESS → SHOWING_MENU → SELECTING_CATEGORY → SELECTING_PRODUCT → BUILDING_ORDER → CONFIRMING_ORDER → WAITING_PAYMENT → ORDER_COMPLETE → SHOWING_MENU
- Comandos globais: "cancelar" → menu principal, "menu" → cardápio
- 3 invalid attempts → TALK_TO_HUMAN automático
- Sessão expira em 24h
- Ao criar Order, decrementa stock (se não for ilimitado)

### app/api/webhooks/whatsapp/route.ts
- Verifica header x-evolution-apikey
- Ignora mensagens próprias (fromMe)
- Resolve tenant pelo telefone
- Processa mensagem no botService

## Fluxo do Bot
Cliente envia msg → Webhook → parseWebhookPayload → botService.processMessage → busca/cria cliente → busca/cria sessão → salva mensagem → verifica comando global → routeState → handler específico → resposta
