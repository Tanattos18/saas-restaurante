# 📋 CHECKLIST DE FUNCIONALIDADES — SaaS Restaurante v1.0

**Data:** 15 de maio de 2026 (v2)  
**Status Geral:** 🟢 ~90% Implementado | 10% Faltando
**Prioridade:** Próximo de produção, faltando Stripe + Testes

> **Última atualização:** 15/05/2026 - Correções de bugs + melhorias no fluxo do cliente

> **Legenda:** 🟢 Completo | 🟡 Parcial | 🔴 Faltando | ⚠️ Crítico

---

## 🟢 MÓDULO 1: BASE DO PROJETO (100% ✅)

| # | Item | Status |
|---|------|--------|
| 1.1 | `prisma/schema.prisma` — 15 modelos + 18 enums | 🟢 |
| 1.2 | `lib/prisma.ts` — singleton Prisma seguro | 🟢 |
| 1.3 | `lib/tenant-prisma.ts` — factory com auto-injeção tenantId | 🟢 |
| 1.4 | `.env.example` com variáveis necessárias | 🟢 |
| 1.5 | `package.json` com todas as dependências | 🟢 |
| 1.6 | `prisma/seed.ts` — seed com dados de teste | 🟢 |
| 1.7 | Configurações: `tsconfig.json`, `next.config.ts`, `postcss.config.js` | 🟢 |
| 1.8 | Pages raiz: `app/layout.tsx`, `app/page.tsx` (redirect /login) | 🟢 |

**Status:** ✅ **COMPLETO**

---

## 🟡 MÓDULO 2: AUTENTICAÇÃO (75% ⚠️)

### ✅ Implementado
| # | Item | Status |
|---|------|--------|
| 2.1 | JWT com access (15min) + refresh (7d) tokens | 🟢 |
| 2.2 | Login com validação email+password+tenantSlug | 🟢 |
| 2.3 | Registro de novo tenant com transaction | 🟢 |
| 2.4 | Middleware RBAC por role (KITCHEN, OWNER, MANAGER, STAFF, CASHIER) | 🟢 |
| 2.5 | Refresh token automático | 🟢 |
| 2.6 | Logout com limpeza de cookies | 🟢 |
| 2.7 | Schemas Zod para validação | 🟢 |
| 2.8 | Routes: /login, /register, /api/auth/* | 🟢 |

### ❌ Faltando (Nice-to-have)
| # | Item | Status |
|---|------|--------|
| 2.9 | Recuperação de senha (forgot-password) | 🔴 |
| 2.10 | Two-factor authentication (2FA/TOTP) | 🔴 |
| 2.11 | Social login (Google, GitHub) | 🔴 |
| 2.12 | Sessão multi-dispositivo (logout remoto) | 🔴 |

**Status:** ⚠️ **CORE IMPLEMENTADO**

---

## 🟢 MÓDULO 3: CRUD CARDÁPIO (95% ✅)

| # | Item | Status |
|---|------|--------|
| 3.1 | CRUD categorias (create, read, update, delete, reorder) | 🟢 |
| 3.2 | Drag-and-drop reordenar categorias | 🟢 |
| 3.3 | CRUD produtos (create, read, update, delete, toggle, stock) | 🟢 |
| 3.4 | PromoPrice validado (sempre < price) | 🟢 |
| 3.5 | Controle de estoque + alerta de mínimo | 🟢 |
| 3.6 | InventoryLog para auditoria | 🟢 |
| 3.7 | Filtros: busca, categoria, ativos/inativos | 🟢 |
| 3.8 | API routes completas | 🟢 |
| 3.9 | Componentes: ProductList, ProductForm, CategoryManager, StockAlert | 🟢 |
| 3.10 | Pages: /menu, /menu/new, /menu/[id] | 🟢 |

**Status:** ✅ **COMPLETO (core)**

---

## 🟡 MÓDULO 4: BOT WHATSAPP (70% ⚠️) ⚠️ CRÍTICO

### ✅ Implementado
| # | Item | Status |
|---|------|--------|
| 4.1 | Integração Evolution API v2 | 🟢 |
| 4.2 | Webhook `/api/webhooks/whatsapp` | 🟢 |
| 4.3 | Modelos ChatSession, ChatMessage | 🟢 |
| 4.4 | Máquina de estados completa (11 estados) | 🟢 |
| 4.5 | Fluxo de conversação (WELCOME → ORDER_COMPLETE) | 🟢 |
| 4.6 | Detecção de 3 erros → transferência para atendente | 🟢 |
| 4.7 | Comandos globais: "cancelar", "menu" | 🟢 |
| 4.8 | Integração com orderService.create() | 🟢 |
| 4.9 | **Integração com loyaltyService.earnPoints()** | 🟢 (NOVO) |
| 4.10 | Suporte a botões interativos | 🟢 |
| 4.4 | Templates de mensagens básicas | 🟢 |
| 4.5 | `lib/whatsapp.ts` — helpers de envio | 🟢 |

### ❌ Faltando (CRÍTICO)
| # | Item | Status |
|---|------|--------|
| 4.6 | Máquina de estados completa (11 estados) | 🔴 ⚠️ |
| 4.7 | Fluxo de conversação (WELCOME → ORDER_COMPLETE) | 🔴 ⚠️ |
| 4.8 | Detecção de 3 erros → transferência para atendente | 🔴 |
| 4.9 | Comandos globais: "cancelar", "menu" | 🔴 |
| 4.10 | Integração com orderService.create() | 🔴 |
| 4.11 | Integração com loyaltyService.earnPoints() | 🔴 |
| 4.12 | Notificação ao cliente quando pedido pronto | 🔴 |
| 4.13 | Suporte a botões interativos (sendButtons) | 🔴 |
| 4.14 | Suporte a listas interativas (sendList) | 🔴 |

**Status:** 🔴 **ESTRUTURA PRONTA, LÓGICA FALTANDO** ⚠️ **SEM ISSO SISTEMA NÃO FUNCIONA**

---

## Módulo 2 — Autenticação e Middleware

| # | Item | Status |
|---|------|--------|
| 2.1 | `lib/jwt.ts` — signAccessToken, signRefreshToken, verifyToken (jose) | 🟢 |
| 2.2 | `lib/auth.ts` — getTokenFromRequest, getAuthContext | 🟢 |
| 2.3 | `middleware.ts` — valida JWT, injeta headers, RBAC por rota | 🟢 |
| 2.4 | `app/api/auth/login/route.ts` — POST login com Zod + bcrypt | 🟢 |
| 2.5 | `app/api/auth/register/route.ts` — POST registro com transaction | 🟢 |
| 2.6 | `app/api/auth/refresh/route.ts` — POST refresh token | 🟢 |
| 2.7 | `app/api/auth/logout/route.ts` — POST limpa cookies | 🟢 |
| 2.8 | `app/api/auth/me/route.ts` — GET dados do usuário logado | 🟢 |
| 2.9 | `lib/validations/auth.schema.ts` — schemas login e register | 🟢 |
| 2.10 | Páginas: login, register, forgot-password | 🟢 |

---

## Módulo 3 — CRUD de Cardápio

| # | Item | Status |
|---|------|--------|
| 3.1 | `lib/validations/product.schema.ts` — categorySchema + productSchema | 🟢 |
| 3.2 | `services/category.service.ts` — CRUD + reorder + bloqueio | 🟢 |
| 3.3 | `services/product.service.ts` — CRUD + stock + toggle + alertas | 🟢 |
| 3.4 | API routes de categorias (GET, POST, PATCH, DELETE, reorder) | 🟢 |
| 3.5 | API routes de produtos (GET, POST, PATCH, DELETE, toggle, stock) | 🟢 |
| 3.6 | `components/platform/menu/ProductList.tsx` — tabela com filtros | 🟢 |
| 3.7 | `components/platform/menu/ProductForm.tsx` — form create/edit | 🟢 |
| 3.8 | `components/platform/menu/CategoryManager.tsx` — drag-and-drop | 🔴 *pendente* |
| 3.9 | `components/platform/menu/StockAlert.tsx` — alerta estoque mínimo | 🟢 |
| 3.10 | Páginas: menu list, new, edit | 🟢 |

---

## Módulo 4 — Bot WhatsApp (Evolution API v2)

| # | Item | Status |
|---|------|--------|
| 4.1 | `lib/whatsapp.ts` — sendText, sendButtons, sendList, parseWebhook, formatPhone | 🟢 |
| 4.2 | `services/whatsapp/templates.ts` — templates de mensagem | 🟢 |
| 4.3 | `services/whatsapp/bot.service.ts` — máquina de estado COMPLETA | 🟢 |
| 4.4 | `services/whatsapp/message.service.ts` — envio/recebimento | 🟢 |
| 4.5 | `services/whatsapp/flow.service.ts` — fluxos conversacionais | 🟢 |
| 4.6 | `app/api/webhooks/whatsapp/route.ts` — webhook Evolution API | 🟢 |
| 4.7 | Tratamento: sessão expira 24h, 3 erros → humano, "cancelar"/"menu" global | 🟢 |

---

## Módulo 5 — KDS (Kitchen Display System)

| # | Item | Status |
|---|------|--------|
| 5.1 | `lib/pg-notify.ts` — LISTEN/NOTIFY com node-postgres | 🟢 |
| 5.2 | `prisma/migrations/add_kds_trigger.sql` — trigger pg_notify | 🟢 |
| 5.3 | `app/api/kds/stream/route.ts` — SSE com pg_notify | 🟢 |
| 5.4 | `services/kds.service.ts` — getActiveOrders, updateStatus, registerDevice | 🟢 |
| 5.5 | `app/api/kds/orders/[id]/status/route.ts` — PATCH status | 🟢 |
| 5.6 | `components/platform/kds/KitchenBoard.tsx` — 3 colunas | 🟢 |
| 5.7 | `components/platform/kds/OrderTicket.tsx` — card do pedido | 🟢 |
| 5.8 | `components/platform/kds/KitchenTimer.tsx` — timer colorido | 🟢 |
| 5.9 | Página KDS fullscreen + registro de dispositivo | 🟢 |
| 5.10 | `lib/sounds.ts` — som de notificação via Web Audio API | 🟢 |
| 5.11 | Som ao chegar novo pedido no KitchenBoard | 🟢 |

---

## Módulo 6 — QR Code e Cardápio Público

| # | Item | Status |
|---|------|--------|
| 6.1 | `services/qr-code.service.ts` — geração de QR Codes | 🟢 |
| 6.2 | `app/api/qr-code/tables/route.ts` — GET QR Codes | 🟢 |
| 6.3 | `app/(public)/menu/[tenantSlug]/page.tsx` — cardápio público mobile-first | 🟢 |
| 6.4 | `app/(public)/table/[tenantSlug]/[tableNumber]/page.tsx` — pedido na mesa | 🟢 |
| 6.5 | `components/public/MenuViewer.tsx` — visualizador cardápio | 🟢 |
| 6.6 | `components/public/ProductCard.tsx` — card de produto público | 🟢 |
| 6.7 | `components/public/Cart.tsx` — carrinho de compras | 🟢 |
| 6.8 | `components/public/Checkout.tsx` — checkout público | 🟢 |
| 6.9 | Página de gestão de QR Codes no painel | 🟢 |

---

## Módulo 7 — Dashboard e Pedidos

| # | Item | Status |
|---|------|--------|
| 7.1 | `services/analytics.service.ts` — métricas e gráficos | 🟢 |
| 7.2 | `services/order.service.ts` — CRUD com orderNumber sequencial | 🟢 |
| 7.3 | Página dashboard com cards + gráficos (Recharts) | 🟢 |
| 7.4 | `components/platform/dashboard/StatsCards.tsx` | 🟢 |
| 7.5 | `components/platform/dashboard/RecentOrders.tsx` | 🟢 |
| 7.6 | `components/platform/dashboard/SalesChart.tsx` | 🟢 |
| 7.7 | Página de pedidos (kanban) com filtros | 🟢 |
| 7.8 | `components/platform/orders/OrderKanban.tsx` | 🟢 |
| 7.9 | `components/platform/orders/OrderCard.tsx` | 🟢 |
| 7.10 | `components/platform/orders/OrderDetails.tsx` | 🟢 |
| 7.11 | Página de detalhe do pedido com timeline | 🟢 |

---

## Módulo 8 — Stripe e Assinaturas

| # | Item | Status |
|---|------|--------|
| 8.1 | `lib/stripe.ts` — instância Stripe + PLANS config | 🟢 |
| 8.2 | `services/stripe.service.ts` — customer, subscription, webhook handler | 🟢 |
| 8.3 | `app/api/webhooks/stripe/route.ts` — webhook Stripe | 🟢 |
| 8.4 | `app/api/payment/stripe/create-checkout/route.ts` | 🟢 |
| 8.5 | `app/api/payment/stripe/portal/route.ts` | 🟢 |
| 8.6 | `app/api/payment/pix/create/route.ts` — geração PIX | 🟢 |
| 8.7 | Página de assinatura (plano atual, upgrade, downgrade) | 🟢 |
---

## 🟢 MÓDULO 5: KDS (95% ✅)

| # | Item | Status |
|---|------|--------|
| 5.1 | PostgreSQL LISTEN/NOTIFY real-time | 🟢 |
| 5.2 | Trigger SQL automático | 🟢 |
| 5.3 | API SSE `/api/kds/stream` | 🟢 |
| 5.4 | Service `kds.service.ts` | 🟢 |
| 5.5 | Componente KitchenBoard (3 colunas) | 🟢 |
| 5.6 | Componente OrderTicket | 🟢 |
| 5.7 | Timer colorido com pulse + trava ao READY | 🟢 (MELHORADO) |
| 5.8 | Modo fullscreen | 🟢 |
| 5.9 | Som de notificação ao novo pedido | 🟢 |
| 5.10 | Impressão térmica (via Electron) | 🟢 |
| 5.11 | Cache offline com sincronização | 🟢 |
| 5.12 | `notify()` programático no service (sem depender do trigger SQL) | 🟢 (NOVO) |
| 5.13 | ❌ Drag-and-drop entre colunas | 🔴 |

**Status:** ✅ **QUASE COMPLETO**

---

## 🟢 MÓDULO 6: QR CODE (85% ✅)

| # | Item | Status |
|---|------|--------|
| 6.1 | Geração de QR Code | 🟢 |
| 6.2 | Cardápio público mobile-first | 🟢 |
| 6.3 | Filtros por categoria | 🟢 |
| 6.4 | Indicadores (vegan, sem glúten, promoção) | 🟢 |
| 6.5 | Carrinho de compras | 🟢 |
| 6.6 | Checkout público | 🟢 |
| 6.7 | Pagamento via PIX | 🟢 |
| 6.8 | API routes completas | 🟢 |
| 6.9 | ❌ **Exportar PDF para impressão** | 🔴 |
| 6.10 | ❌ **Validar flag showInQRCode** | 🔴 |

**Status:** ✅ **COMPLETO (core)**

---

## 🟢 MÓDULO 7: DASHBOARD (95% ✅)

| # | Item | Status |
|---|------|--------|
| 7.1 | StatsCards com gradientes e animação de valor | 🟢 |
| 7.2 | SalesChart (BarChart + PieChart por canal) | 🟢 |
| 7.3 | RecentOrders com dots de status e hover | 🟢 |
| 7.4 | OrderKanban com filter pills e colunas gradientes | 🟢 |
| 7.5 | OrderCard com badge canal, status dot | 🟢 |
| 7.6 | OrderDetails com timeline de status | 🟢 |
| 7.7 | OrderTracking para cliente (polling 8s) | 🟢 (NOVO) |
| 7.8 | Checkout público com pagamento visível | 🟢 (NOVO) |
| 7.9 | MenuViewer com "Todos" + filtro por categoria | 🟢 (NOVO) |

**Status:** ✅ **COMPLETO**

---

## 🔴 MÓDULO 8: STRIPE (50% ⚠️) ⚠️ CRÍTICO

| # | Item | Status |
|---|------|--------|
| 8.1 | Integração básica | 🟢 |
| 8.2 | Service `stripe.service.ts` | 🟢 |
| 8.3 | Webhook route | 🟢 |
| 8.4 | ❌ **Checkout Session funcionando** | 🔴 ⚠️ |
| 8.5 | ❌ **Customer Portal** | 🔴 ⚠️ |
| 8.6 | ❌ **Webhooks de eventos** | 🔴 ⚠️ |
| 8.7 | ❌ **Middleware de plano** | 🔴 |
| 8.8 | ❌ **Página de assinatura** | 🔴 |
| 8.9 | ❌ **Trial de 14 dias** | 🔴 |
| 8.10 | ❌ **Emails de notificação** | 🔴 |

**Status:** 🔴 **INTEGRAÇÃO PRONTA, WORKFLOWS FALTANDO** ⚠️ **SEM ISSO NÃO CONSEGUE COBRAR**

---

## 🟡 MÓDULO 9: FIDELIDADE (60% ⚠️)

| # | Item | Status |
|---|------|--------|
| 9.1 | Modelo Customer com fidelidade | 🟢 |
| 9.2 | Service `loyalty.service.ts` | 🟢 |
| 9.3 | Earn points (R$1 = 1 ponto) | 🟢 |
| 9.4 | Redeem points (100 = R$5) | 🟢 |
| 9.5 | Expiração de pontos (365 dias) | 🟢 |
| 9.6 | Histórico de transações | 🟢 |
| 9.7 | Service `customer.service.ts` | 🟢 |
| 9.8 | ❌ **Páginas de gestão de clientes** | 🔴 |
| 9.9 | ❌ **Dashboard de fidelidade** | 🔴 |
| 9.10 | ❌ **Integração com bot WhatsApp** | 🔴 |
| 9.11 | ❌ **Integração com cardápio público** | 🔴 |
| 9.12 | ❌ **Churn analysis** | 🔴 |

**Status:** ⚠️ **CORE IMPLEMENTADO, UI FALTANDO**

---

## 🔴 MÓDULO 10: REFINAMENTOS (10% ❌) ⚠️ CRÍTICO

| # | Item | Status |
|---|------|--------|
| 10.1 | Health check endpoint | 🟢 |
| 10.2 | Sidebar com navegação | 🟢 |
| 10.3 | Header com informações | 🟢 |
| 10.4 | ❌ **Testes (jest)** | 🔴 ⚠️ |
| 10.5 | ❌ **Documentação de deploy** | 🔴 ⚠️ |
| 10.6 | ❌ **Documentação de variáveis de ambiente** | 🔴 ⚠️ |
| 10.7 | ❌ **Rate limiting** | 🔴 |
| 10.8 | ❌ **Email notifications** | 🔴 |
| 10.9 | ❌ **Logging e monitoring** | 🔴 |
| 10.10 | ❌ **Segurança (CORS, CSP, CSRF)** | 🔴 |

**Status:** 🔴 **NÃO INICIADO** ⚠️ **OBRIGATÓRIO PARA PRODUÇÃO**

---

## 🟢 MÓDULO 11: DESIGN SYSTEM (100% ✅)

| # | Item | Status |
|---|------|--------|
| 11.1 | Estrutura em `app/components/` | 🟢 |
| 11.2 | Sidebar responsiva com ícones SVG + indicador ativo | 🟢 |
| 11.3 | Header com avatar, iniciais e dropdown animado | 🟢 |
| 11.4 | StatsCards com gradientes, ícones e animação de valor | 🟢 |
| 11.5 | Ícones SVG (Icons.tsx) — 15+ ícones customizados | 🟢 |
| 11.6 | UI components (Button, Card, Input, Badge, Modal, Toast) | 🟢 |
| 11.7 | SalesChart com PieChart + BarChart e legenda por canal | 🟢 |
| 11.8 | RecentOrders com dots de status, canal e horário | 🟢 |
| 11.9 | OrderKanban com filter pills e colunas gradientes | 🟢 |
| 11.10 | OrderCard com badge de canal + status indicator | 🟢 |
| 11.11 | KitchenBoard com glass effect, status pulse, empty states | 🟢 |
| 11.12 | OrderTicket com ícones SVG, notas destacadas | 🟢 |
| 11.13 | KitchenTimer com animação pulse para urgencia | 🟢 |
| 11.14 | ProductList com input de busca, toggle suave, badge Promo | 🟢 |
| 11.15 | CategoryList grid responsivo com toggle e hover | 🟢 |
| 11.16 | StockAlert com ícone de alerta e estilo refinado | 🟢 |
| 11.17 | Tema escuro completo com variáveis CSS customizadas | 🟢 |
| 11.18 | Animações: fade-in, fade-in-up, scale-in, pulse-soft | 🟢 |
| 11.19 | Scrollbar customizada | 🟢 |
| 11.20 | Tailwind CDN + PostCSS config na raiz | 🟢 |

**Status:** ✅ **COMPLETO**

---

## 🔴 MÓDULO 12: APP DESKTOP ELECTRON (30% ⚠️)

| # | Item | Status |
|---|------|--------|
| 11.1 | Estrutura da pasta `app-desktop/` | 🟢 |
| 11.2 | Tipos TypeScript `types/electron.d.ts` | 🟢 |
| 11.3 | Componente `UpdateNotification.tsx` | 🟢 |
| 11.4 | ❌ **electron/main.ts** | 🔴 |
| 11.5 | ❌ **electron/preload.ts** | 🔴 |
| 11.6 | ❌ **electron/printer.ts** | 🔴 |
| 11.7 | ❌ **electron/updater.ts** | 🔴 |
| 11.8 | ❌ **electron/kds-cache.ts** | 🔴 |
| 11.9 | ❌ **electron-builder.yml** | 🔴 |
| 11.10 | ❌ **scripts/build.ps1** | 🔴 |
| 11.11 | ❌ **.github/workflows/release.yml** | 🔴 |

**Status:** ⚠️ **ESTRUTURA PRONTA, IMPLEMENTAÇÃO FALTANDO**

---

## 📊 RESUMO GERAL

| Módulo | Status | % Completo |
|--------|--------|----------|
| 1. Base | 🟢 Completo | 100% |
| 2. Autenticação | 🟢 Completo | 95% |
| 3. Cardápio | 🟢 Completo | 98% |
| 4. WhatsApp | 🟡 Parcial | 75% |
| 5. KDS | 🟢 Quase completo | 95% |
| 6. QR Code | 🟢 Completo | 90% |
| 7. Dashboard + Pedidos | 🟢 Completo | 95% |
| 8. Stripe | 🟡 Parcial | 50% |
| 9. Fidelidade | 🟡 Parcial | 75% |
| 10. Refinamentos | 🟡 Parcial | 60% |
| 11. Design System | 🟢 Completo | 100% |
| 12. Electron | 🟡 Parcial | 30% |
| **TOTAL** | **🟢** | **~90%** |

---

## 🚨 BLOQUEADORES CRÍTICOS PARA PRODUÇÃO

**SEM ESTES, NÃO PODE LANÇAR:**

1. **🟡 Bot WhatsApp Completo** (Módulo 4) - 70%
   - [x] Máquina de estados funcionando
   - [x] Fluxo de pedido completo
   - [x] Integração com fidelidade (ganhar pontos)
   - ⚠️ Faltando: notificação quando pedido pronto

2. **🟡 Stripe Checkout** (Módulo 8) - 50%
   - [x] Service completo
   - [x] Checkout Session
   - [x] Customer Portal
   - ⚠️ Faltando: testar com API real

3. **🔴 Testes** (Módulo 10)
   - [ ] Cobertura >80%
   - [ ] Testes críticos implementados
   - [ ] Sem isso, risco alto de bugs em produção

4. **🔴 Deploy Documentation** (Módulo 10)
   - [ ] Como fazer deploy?
   - [ ] Variáveis de ambiente
   - [ ] Checklist pré-produção
   - [ ] Sem isso, não consegue deployar

5. **🔴 Segurança** (Módulo 10)
   - [ ] CORS, CSP, CSRF
   - [ ] Rate limiting
   - [ ] Validação de input
   - [ ] Sem isso, aplicação é vulnerável

---

## ⏱️ TIMELINE ESTIMADA

### Fase 1: Bloqueadores (2-3 semanas)
- [ ] Bot WhatsApp completo
- [ ] Stripe checkout funcionando
- [ ] Testes (>80% cobertura)
- [ ] Deploy documentation

### Fase 2: Features (2-3 semanas)
- [ ] KDS melhorado (drag-drop, som, fullscreen)
- [ ] Dashboard com métricas
- [ ] Email notifications
- [ ] Segurança completa

### Fase 3: Polimento (1-2 semanas)
- [ ] Electron app desktop
- [ ] UI/UX refinements
- [ ] Performance optimization

### Fase 4: Produção (Contínuo)
- [ ] Staging deployment
- [ ] Teste e2e
- [ ] Load testing
- [ ] Production deployment

---

## 📝 RECOMENDAÇÕES

### PRIORIDADE 1: Bot WhatsApp (1 semana)
- É a funcionalidade principal
- Sem ela, sistema não funciona
- Tudo já está pronto, só falta a máquina de estados

### PRIORIDADE 2: Stripe (3-5 dias)
- Necessário para monetização
- Checkout + webhooks + page de assinatura

### PRIORIDADE 3: Testes (1-2 semanas)
- Crítico para confiabilidade
- Mínimo 80% de cobertura

### PRIORIDADE 4: KDS Melhorado (1 semana)
- Drag-and-drop, som, fullscreen
- Importante para operação da cozinha

---

> **Análise realizada:** 15/05/2026 (v2)
> **Status Geral:** 🟢 90% implementado, 10% faltando
> **Recomendação:** Próximo de produção. Focar em Stripe e testes.

---

## 🚀 PRÓXIMOS PASSOS (prioridade)

| Prioridade | Tarefa | Módulo | Status |
|------------|--------|--------|--------|
| 🔴 Crítico | Stripe Checkout — testar com API real | 8 | ⏳ Pendente |
| 🔴 Crítico | Testes automatizados (>80% cobertura) | 10 | ⏳ Pendente |
| 🟡 Alto | Bot WhatsApp — notificar cliente quando pedido pronto | 4 | ⏳ Pendente |
| 🟡 Alto | Rate limiting (Upstash Redis) | 10 | ⏳ Pendente |
| 🟡 Alto | Deploy produção (Vercel + Neon.tech) | 10 | ⏳ Pendente |
| 🟢 Médio | Estoque — decrementar ao criar pedido público | 3 | ⏳ Pendente |
| 🟢 Médio | Página de Equipe (CRUD usuários) | 10 | ⏳ Pendente |
| 🟢 Médio | Relatórios financeiros | 7 | ⏳ Pendente |
| 🟢 Baixo | Drag-and-drop entre colunas do KDS | 5 | ⏳ Pendente |


---

## Módulo 9 — CRM e Fidelidade

| # | Item | Status |
|---|------|--------|
| 9.1 | `services/loyalty.service.ts` — earn, redeem, balance, expire | 🟢 |
| 9.2 | `services/customer.service.ts` — CRUD + topCustomers + churnRisk | 🟢 |
| 9.3 | Página de clientes (tabela, filtros, badges) | 🟢 |
| 9.4 | Página de detalhe do cliente (pedidos, pontos) | 🟢 |
| 9.5 | Página de fidelidade (config, relatório, expiração) | 🟢 |
| 9.6 | Integração com bot: earnPoints ao finalizar pedido | 🟡 *pendente* |

---

## Módulo 10 — Refinamentos Finais

| # | Item | Status |
|---|------|--------|
| 10.1 | `components/platform/Sidebar.tsx` — sidebar responsiva com badges | 🟢 |
| 10.2 | `components/platform/Header.tsx` — header | 🟢 |
| 10.3 | `app/api/health/route.ts` — health check | 🟢 |
| 10.4 | Testes Jest: jwt.test.ts + loyalty.test.ts | 🟢 |
| 10.5 | Rate limiting (Upstash Redis) | 🟡 *pendente* |
| 10.6 | `docs/DEPLOY.md` — deploy Vercel + Neon.tech | 🟢 |
| 10.7 | `docs/WHATSAPP_SETUP.md` — setup Evolution API v2 | 🟢 |
| 10.8 | `app/(platform)/layout.tsx` — layout com sidebar + header | 🟢 |
| 10.9 | PWA (Progressive Web App) com @serwist/next | 🟢 |
| 10.10 | Service worker com cache offline | 🟢 |
| 10.11 | Manifest.json + ícones SVG | 🟢 |
| 10.12 | Metadados apple-web-app e theme-color | 🟢 |
| 10.13 | `saas-restaurante-app/` — estrutura Electron completa | 🟢 |
| 10.14 | `electron/main.ts` — janela principal + IPC + menus | 🟢 |
| 10.15 | `electron/preload.ts` — ponte segura contextBridge | 🟢 |
| 10.16 | `electron/printer.ts` — impressão térmica de pedidos | 🟢 |
| 10.17 | `electron/updater.ts` — auto-update GitHub Releases | 🟢 |
| 10.18 | `electron/kds-cache.ts` — cache offline SQLite | 🟢 |
| 10.19 | `electron-builder.yml` — build Windows/macOS/Linux | 🟢 |
| 10.20 | `scripts/build.ps1` — script de build automatizado | 🟢 |
| 10.21 | `.github/workflows/release.yml` — CI/CD multiplataforma | 🟢 |
| 10.22 | `types/electron.d.ts` — declarações TypeScript do electronAPI | 🟢 |
| 10.23 | `OrderTicket.tsx` — botão de impressão térmica (Electron) | 🟢 |
| 10.24 | `KitchenBoard.tsx` — cache offline via electronAPI | 🟢 |
| 10.25 | `UpdateNotification.tsx` — notificação de atualização | 🟢 |
| 10.26 | `(platform)/layout.tsx` — componente UpdateNotification adicionado | 🟢 |

---

## 📊 Resumo Geral

| Fase | Total Itens | Concluídos | Progresso |
|------|-------------|------------|-----------|
| Módulo 1 — Base | 10 | 8 | 80% |
| Módulo 2 — Auth | 10 | 10 | 100% |
| Módulo 3 — Cardápio | 10 | 9 | 90% |
| Módulo 4 — WhatsApp | 7 | 7 | 100% |
| Módulo 5 — KDS | 11 | 11 | 100% |
| Módulo 6 — QR Code | 9 | 9 | 100% |
| Módulo 7 — Dashboard | 11 | 11 | 100% |
| Módulo 8 — Stripe | 8 | 8 | 100% |
| Módulo 9 — CRM | 6 | 5 | 83% |
| Módulo 10 — Refinamentos | 26 | 25 | 96% |
## 🔄 Itens Pendentes (Backlog)

| # | Item | Módulo | Prioridade |
|---|------|--------|------------|
| P1 | `CategoryManager` drag-and-drop com @dnd-kit | 3 | Baixa |
| P2 | Integrar fidelidade com bot (earnPoints ao finalizar pedido) | 9 | Média |
| P3 | Rate limiting com Upstash Redis (login, webhook, PIX) | 10 | Média |
| P4 | Testes Jest mais completos (order, bot) | 10 | Baixa |

| **Total** | **108** | **103** | **95%** |

---
*Última atualização: 14/05/2026*
