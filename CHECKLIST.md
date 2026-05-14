# ✅ CHECKLIST — SaaS Restaurante

**Status:** 🔴 Não iniciado | 🟡 Em andamento | 🟢 Concluído

---

## Módulo 1 — Base do Projeto

| # | Item | Status |
|---|------|--------|
| 1.1 | `prisma/schema.prisma` — schema completo com 15 modelos + 18 enums | 🟢 |
| 1.2 | `lib/prisma.ts` — singleton Prisma (sem headers) | 🟢 |
| 1.3 | `lib/tenant-prisma.ts` — factory `createTenantPrisma(tenantId)` com `$extends` | 🟢 |
| 1.4 | `.env.example` — todas as variáveis de ambiente | 🟢 |
| 1.5 | `package.json` — dependências (Next.js, Prisma, jose, bcryptjs, Zod, Stripe, shadcn, Tailwind v4) | 🟢 |
| 1.6 | `prisma/seed.ts` — seed com 1 tenant + admin + 3 categorias + 5 produtos | 🟢 |
| 1.7 | `tsconfig.json`, `next.config.ts`, `postcss.config.js`, `app/globals.css` | 🟢 |
| 1.8 | `app/layout.tsx`, `app/page.tsx` (redirect → /login) | 🟢 |
| 1.9 | Rodar `npx prisma migrate dev --name init` (pendente: precisa de PostgreSQL) | 🟡 |
| 1.10 | Rodar `npx prisma db seed` (pendente: precisa da migrate) | 🟡 |

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
| 8.8 | Middleware de plano (plan no JWT + header + limite orders) | 🟢 |

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
| Módulo 10 — Refinamentos | 21 | 20 | 95% |
## 🔄 Itens Pendentes (Backlog)

| # | Item | Módulo | Prioridade |
|---|------|--------|------------|
| P1 | `CategoryManager` drag-and-drop com @dnd-kit | 3 | Baixa |
| P2 | Integrar fidelidade com bot (earnPoints ao finalizar pedido) | 9 | Média |
| P3 | Rate limiting com Upstash Redis (login, webhook, PIX) | 10 | Média |
| P4 | Testes Jest mais completos (order, bot) | 10 | Baixa |

| **Total** | **103** | **98** | **95%** |

---
*Última atualização: 14/05/2026*
