# Módulo 7 — Dashboard e Pedidos

## Objetivo
Dashboard com métricas em tempo real e gestão de pedidos em formato kanban.

## Arquivos

### services/analytics.service.ts
- getMetrics(period): totalOrders, totalRevenue, avgTicket, pendingOrders
- topProducts, ordersByHour (para gráfico), ordersByChannel, revenueByDay

### services/order.service.ts
- list(filters): paginação, status, channel, date, search
- getById(id): com items, customer, payments
- create(input): orderNumber sequencial com cálculo de subtotal/total
- updateStatus(id, status, notes): atualiza status + timestamps

### API Routes
- POST /api/orders — cria pedido (usado pelo checkout público)
- PATCH /api/orders/[id]/status — atualiza status

### Dashboard (/[tenantSlug]/dashboard)
- StatsCards: 4 cards com gradientes, ícones SVG e animação de valor (redesign 15/05)
- SalesChart: gráfico de barras por hora + PieChart por canal com legenda e percentual
- RecentOrders: lista com dots de status, ícone de canal, horário e link para detalhe

### Pedidos (/[tenantSlug]/orders)
- OrderKanban: colunas com header gradiente, filter pills estilizados, status dots
- Filtro por canal (Todos, WhatsApp, QR Code, Balcão, Telefone)
- OrderCard: badge de canal, status dot, contagem de itens, hover elevado

### Detalhe do Pedido (/[tenantSlug]/orders/[id])
- OrderDetails: timeline, itens, valores, observações
- Ações contextuais por status (Aceitar, Preparar, Pronto, Entregar)
