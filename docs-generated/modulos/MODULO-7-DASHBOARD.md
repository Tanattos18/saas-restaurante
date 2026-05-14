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
- StatsCards: 4 cards (pedidos, receita, ticket médio, pendentes)
- SalesChart: gráfico de pedidos por hora + pedidos por canal (Recharts)
- RecentOrders: lista dos últimos 10 pedidos

### Pedidos (/[tenantSlug]/orders)
- OrderKanban: colunas Pendente | Aceito | Preparando | Pronto | Entregue
- Filtro por canal (WhatsApp, QR Code, Balcão, Telefone)
- OrderCard: card com número, cliente, itens, valor, canal

### Detalhe do Pedido (/[tenantSlug]/orders/[id])
- OrderDetails: timeline, itens, valores, observações
- Ações contextuais por status (Aceitar, Preparar, Pronto, Entregar)
