# Módulo 5 — KDS (Kitchen Display System)

## Objetivo
Implementar o sistema de tela de cozinha com atualizações em tempo real via PostgreSQL LISTEN/NOTIFY.

## Arquivos

### lib/pg-notify.ts
- Conexão dedicada com node-postgres (pg) para LISTEN
- subscribe(channel, callback): retorna unsubscribe function
- notify(channel, payload): envia notificação
- Canal padrão: kds_{tenantId}

### prisma/migrations/add_kds_trigger.sql
- Trigger PostgreSQL que chama pg_notify automaticamente ao INSERT/UPDATE na tabela Order
- NOTIFICA canal kds_{tenantId} com { type, orderId, status }

### services/kds.service.ts
- getActiveOrders(): ordens PENDING, ACCEPTED, PREPARING, READY
- updateOrderStatus(orderId, status): atualiza status + timestamps
- registerDevice(name, type): cria dispositivo com deviceCode único
- validateDevice(deviceCode): valida dispositivo ativo

### api/kds/stream/route.ts (SSE)
- Autentica via deviceCode
- Conecta ao pg_notify no canal kds_{tenantId}
- Envia INIT com ordens ativas ao conectar
- Atualiza via pg_notify em tempo real
- Heartbeat a cada 30s

### api/kds/orders/[id]/status/route.ts
- PATCH { status, deviceCode? }
- Autenticação: JWT ou deviceCode
- Atualiza status + timestamps

### api/kds/devices/route.ts
- POST: registra novo dispositivo KDS

### lib/sounds.ts
- Utilitário de som usando Web Audio API (sem arquivos externos)
- `playNotificationSound()`: toca um timbre de dois tons ao chegar novo pedido
- Sem dependências — usa `AudioContext` nativo do navegador

### Componentes
- KitchenBoard: 3 colunas (Pendentes | Em Preparo | Prontos) com SSE + detecção de novos pedidos + som
- OrderTicket: card com número, canal, itens, observações, timer, botão de ação
- KitchenTimer: contador colorido (verde <15min, amarelo 15-25min, vermelho >25min)

### Página
- /[tenantSlug]/kds: fullscreen, registro de dispositivo via localStorage
