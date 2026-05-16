# 🏗️ SaaS Restaurante — Índice do Projeto

> **SaaS B2B multi-tenant** para gestão de restaurantes com WhatsApp, KDS e cardápio digital.

---

## 📂 Estrutura do Projeto

```
saas-restaurante/
│
├── src/
│   ├── frontend/
│   │   ├── app/                    # Next.js 15 App Router
│   │   │   ├── (auth)/             # Autenticação (login, register, forgot-password)
│   │   │   ├── (platform)/         # Área logada do restaurante
│   │   │   │   └── [tenantSlug]/   # Subdomínio dinâmico do tenant
│   │   │   │       ├── dashboard/  # Dashboard com métricas
│   │   │   │       ├── menu/       # Gestão de cardápio (produtos)
│   │   │   │       ├── categories/ # Gestão de categorias
│   │   │   │       ├── orders/     # Pedidos (kanban)
│   │   │   │       ├── kds/       # Kitchen Display System
│   │   │   │       ├── qr-code/   # Geração de QR Codes
│   │   │   │       ├── customers/ # CRM de clientes
│   │   │   │       ├── loyalty/   # Programa de fidelidade
│   │   │   │       └── settings/  # Configurações (assinatura)
│   │   │   ├── (public)/           # Cardápio público via QR Code
│   │   │   │   ├── menu/[tenantSlug]/       # Cardápio digital
│   │   │   │   └── table/[tenantSlug]/[n]/  # Pedido na mesa
│   │   │   └── api/                # API REST (Route Handlers)
│   │   │       ├── auth/          # Login, register, refresh, logout, me
│   │   │       ├── categories/    # CRUD categorias
│   │   │       ├── products/      # CRUD produtos
│   │   │       ├── orders/        # Pedidos
│   │   │       ├── kds/           # KDS (stream, devices, status)
│   │   │       ├── qr-code/       # Geração QR Codes
│   │   │       ├── payment/       # Stripe e PIX
│   │   │       └── webhooks/      # Stripe e WhatsApp
│   │   │
│   │   ├── components/
│   │   │   ├── ui/                # shadcn/ui (botão, card, input...)
│   │   │   ├── platform/          # Componentes da área logada
│   │   │   │   ├── dashboard/     # StatsCards, Charts, RecentOrders
│   │   │   │   ├── menu/          # ProductList, ProductForm, StockAlert
│   │   │   │   ├── categories/    # CategoryList, CategoryForm (estilo iFood)
│   │   │   │   ├── orders/        # OrderKanban, OrderCard, OrderDetails
│   │   │   │   ├── kds/           # KitchenBoard, OrderTicket, Timer
│   │   │   │   └── layout/        # Sidebar, Header
│   │   │   └── public/            # Componentes do cardápio público
│   │   │       ├── MenuViewer, ProductCard, Cart, Checkout
│   │   │
│   │   └── lib/                   # libs do frontend
│   │       ├── auth.ts            # getAuthContext client-side
│   │       └── ...
│   │
│   ├── backend/
│   │   ├── lib/                   # Bibliotecas e utilitários
│   │   │   ├── prisma.ts          # Singleton Prisma
│   │   │   ├── tenant-prisma.ts   # Factory com auto-filtro tenant
│   │   │   ├── jwt.ts             # Tokens JWT (jose)
│   │   │   ├── auth.ts            # Helpers de autenticação
│   │   │   ├── whatsapp.ts        # Cliente Evolution API v2
│   │   │   ├── stripe.ts          # Integração Stripe
│   │   │   ├── pg-notify.ts       # PostgreSQL LISTEN/NOTIFY
│   │   │   ├── sounds.ts          # Web Audio API (notificação KDS)
│   │   │   ├── validations/       # Schemas Zod
│   │   │   └── utils.ts           # Utilitários gerais
│   │   │
│   │   └── services/              # Lógica de negócio
│   │       ├── whatsapp/          # Bot + templates + fluxo
│   │       ├── category.service.ts
│   │       ├── product.service.ts
│   │       ├── order.service.ts
│   │       ├── customer.service.ts
│   │       ├── kds.service.ts
│   │       ├── stripe.service.ts
│   │       ├── loyalty.service.ts
│   │       ├── analytics.service.ts
│   │       └── qr-code.service.ts
│
├── app/                            # Também existe (legacy/alternative)
├── app-desktop/                    # Electron App Desktop
├── app/sw.ts                       # Service worker PWA (Serwist)
├── prisma/                         # Schema, migrations e seed
├── public/                         # Assets estáticos (manifest.json, icons)
├── docs-generated/                 # Documentação do projeto
├── postcss.config.mjs              # PostCSS + Tailwind v4 (raiz)
├── middleware.ts                   # Next.js Middleware (auth + tenant)
├── .env.example
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 🗺️ Roadmap — 12 Módulos de Implementação

### Módulo 1 — Base do Projeto
**Arquivos:** `prisma/schema.prisma`, `lib/prisma.ts`, `lib/tenant-prisma.ts`, `.env.example`, `package.json`, `prisma/seed.ts`

- Schema Prisma completo (11 modelos: Tenant, User, Customer, Category, Product, Order, OrderItem, ChatSession, ChatMessage, KitchenDevice, InventoryItem, InventoryLog, Payment, LoyaltyTransaction)
- Singleton Prisma seguro
- Factory `createTenantPrisma(tenantId)` com auto-injeção de tenantId em todas as queries
- Seed com 1 tenant de teste + admin + categorias + produtos
- `npx prisma migrate dev --name init` + `npx prisma db seed`

---

### Módulo 2 — Autenticação e Middleware
**Arquivos:** `lib/jwt.ts`, `lib/auth.ts`, `middleware.ts`, `app/api/auth/*/route.ts`, `lib/validations/auth.schema.ts`

- JWT com access token (15min) + refresh token (7d) usando biblioteca `jose`
- Login com validação de email+password+tenantSlug
- Registro de novo tenant com transação PostgreSQL
- Middleware Next.js protegendo rotas por role (KITCHEN, OWNER, MANAGER)
- Refresh automático de token
- Logout com limpeza de cookies

---

### Módulo 3 — CRUD de Cardápio
**Arquivos:** `lib/validations/product.schema.ts`, `services/category.service.ts`, `services/product.service.ts`, `app/api/categories/*/route.ts`, `app/api/products/*/route.ts`, `components/platform/menu/*.tsx`, páginas do cardápio

- CRUD completo de categorias com reordenação drag-and-drop
- CRUD completo de produtos com controle de estoque
- PromoPrice validado (sempre < price)
- Bloqueio ao deletar categoria com produtos ativos
- Alerta de estoque mínimo
- Filtros: busca, categoria, ativos/inativos

---

### Módulo 4 — Bot WhatsApp (Evolution API v2)
**Arquivos:** `lib/whatsapp.ts`, `services/whatsapp/templates.ts`, `services/whatsapp/bot.service.ts`, `app/api/webhooks/whatsapp/route.ts`

- Integração com Evolution API v2 (self-hosted)
- Máquina de estado completa:
  - WELCOME → COLLECTING_NAME → COLLECTING_ADDRESS → SHOWING_MENU
  - SHOWING_MENU → SELECTING_CATEGORY → SELECTING_PRODUCT → BUILDING_ORDER
  - CONFIRMING_ORDER → WAITING_PAYMENT → ORDER_COMPLETE
- Sessão expira em 24h de inatividade
- 3 inputs inválidos → transfere para atendente
- Cliente pode digitar "cancelar" ou "menu" de qualquer estado
- Decrementa estoque ao criar pedido

---

### Módulo 5 — KDS (Kitchen Display System)
**Arquivos:** `lib/pg-notify.ts`, `lib/sounds.ts`, `prisma/migrations/add_kds_trigger.sql`, `app/api/kds/stream/route.ts`, `services/kds.service.ts`, `app/api/kds/orders/[id]/status/route.ts`, `components/platform/kds/KitchenBoard.tsx`, `components/platform/kds/OrderTicket.tsx`, página KDS

- Real-time via PostgreSQL LISTEN/NOTIFY (sem polling)
- Trigger SQL que notifica mudanças de status nos pedidos
- 3 colunas: Novos | Em Preparo | Prontos
- Timer por pedido (verde < 15min, amarelo 15-25min, vermelho > 25min)
- Som de notificação ao chegar novo pedido (Web Audio API)
- Detecção de novos pedidos via Set de IDs no SSE
- Tela fullscreen (modo cozinha)

---

### Módulo 6 — QR Code e Cardápio Público
**Arquivos:** `services/qr-code.service.ts`, `app/api/qr-code/tables/route.ts`, `app/(public)/menu/[tenantSlug]/page.tsx`, `app/(public)/table/[tenantSlug]/[tableNumber]/page.tsx`, `components/public/*.tsx`, página de gestão de QR Codes

- Geração de QR Code por mesa e cardápio geral
- Cardápio público mobile-first com SEO
- Filtro por categoria, indicadores (vegan, sem glúten, promoção)
- Pedido na mesa com carrinho + checkout
- Pagamento via PIX (QR Code) ou na hora
- Exportar QR Codes em PDF para impressão A4
- Segurança: não expor dados internos, respeitar showInQRCode

---

### Módulo 7 — Dashboard e Pedidos
**Arquivos:** `services/analytics.service.ts`, `services/order.service.ts`, `app/(platform)/[tenantSlug]/dashboard/page.tsx`, `app/(platform)/[tenantSlug]/orders/page.tsx`, `app/(platform)/[tenantSlug]/orders/[id]/page.tsx`

- Dashboard com métricas: total hoje, receita, ticket médio, pendentes
- Gráficos: pedidos por hora (LineChart), canais (PieChart) — Recharts
- Kanban de pedidos com colunas de status
- Atualização em tempo real
- OrderNumber sequencial com `SELECT ... FOR UPDATE` (anti race condition)
- Timeline de status, ações por role

---

### Módulo 8 — Stripe e Assinaturas
**Arquivos:** `lib/stripe.ts`, `services/stripe.service.ts`, `app/api/webhooks/stripe/route.ts`, `app/api/payment/stripe/*/route.ts`, `app/api/payment/pix/create/route.ts`, página de assinatura

- Planos: FREE (50 pedidos/mês), BASIC (R$97), PRO (R$197), ENTERPRISE (R$497)
- Trial de 14 dias
- Stripe Checkout Session + Customer Portal
- Webhooks: checkout.completed, invoice.payment_succeeded/failed, subscription.deleted
- Se PAST_DUE → alerta; se CANCELED → suspende tenant em 3 dias
- Geração de PIX estático/dinâmico para pedidos

---

### Módulo 9 — CRM de Clientes e Fidelidade
**Arquivos:** `services/loyalty.service.ts`, `services/customer.service.ts`, páginas de clientes e fidelidade

- Regras de fidelidade:
  - 1 ponto = R$1 gasto
  - 100 pontos = R$5 de desconto
  - Pontos expiram em 365 dias
  - Níveis: BRONZE (0-499), SILVER (500-999), GOLD (1000-2499), PLATINUM (2500+)
- CRM com busca, filtros por nível, churn risk (>30 dias sem pedir)
- Extrato de pontos, histórico de pedidos
- Integração com bot: earnPoints ao finalizar, redeemPoints no checkout

---

### Módulo 10 — Refinamentos Finais
**Arquivos:** `components/platform/Sidebar.tsx`, `components/platform/Header.tsx`, `__tests__/*`, `app/api/health/route.ts`, `app/sw.ts`, `public/manifest.json`, `public/icons/*.svg`, `docs/DEPLOY.md`, `docs/WHATSAPP_SETUP.md`, `APP.md`

- Sidebar responsiva com badges de notificação
- Header com status WhatsApp online/offline
- Testes Jest: JWT, fidelidade, pedidos, bot
- Health check com teste de conexão ao banco
- PWA com @serwist/next: service worker, cache offline, manifest
- Ícones PWA em SVG (192x192 e 512x512) com theme-color verde
- Metadados apple-web-app para iOS
- Documentação de deploy (Vercel + Neon.tech)
- Guia de setup da Evolution API v2 com Docker Compose
- APP.md: plano de app instalado (Electron/Tauri/PWA)

---

### Módulo 11 — Design System
**Arquivos:** `components/ui/*.tsx`, `components/platform/*.tsx`, globals.css

- Componentes base: Button, Card, Input, Badge, Modal, Toast, Icons
- Sidebar com ícones SVG, Header com avatar
- Ver `docs-generated/modulos/MODULO-11-DESIGN.md` para detalhes.

### Módulo 12 — Refinamentos Visuais ✅ (15/05/2026)
**Arquivos:** `postcss.config.mjs`, `app/layout.tsx`, `components/platform/dashboard/*.tsx`, `components/platform/Sidebar.tsx`, `components/platform/HeaderWrapper.tsx`, `components/platform/kds/*.tsx`, `components/platform/orders/*.tsx`, `components/platform/menu/*.tsx`, `components/platform/categories/*.tsx`

Redesign visual completo do painel:
- Paleta Slate + Emerald, dark mode
- StatsCards com gradientes e animações
- SalesChart com PieChart + legenda
- Sidebar com 11 ícones SVG
- Header com avatar e dropdown
- KitchenBoard com glass effect
- OrderKanban com filter pills
- ProductList/CategoryList refinados
- PostCSS config na raiz + Tailwind CDN

> Ver `docs-generated/modulos/MODULO-12-VISUAL.md` para detalhes.

---

## 🧱 Stack Tecnológica

| Categoria | Tecnologia |
|-----------|-----------|
| Framework | Next.js 15 + App Router |
| Linguagem | TypeScript (strict) |
| Banco | PostgreSQL (Neon.tech / Supabase) |
| ORM | Prisma ORM |
| Auth | JWT (jose) + bcryptjs |
| UI | shadcn/ui + Tailwind CSS |
| Validação | Zod |
| Pagamentos | Stripe (assinaturas) + PIX |
| WhatsApp | Evolution API v2 (self-hosted) |
| Real-time | PostgreSQL LISTEN/NOTIFY |
| PWA | @serwist/next |
| App Desktop | Electron 33 + electron-builder |
| Deploy | Vercel / VPS Ubuntu 22.04 |

---

## ✅ Ordem de Implementação

Cada módulo depende do anterior. Siga estritamente esta ordem:

```
Módulo 1  →  Base (schema, prisma, seed)
    ↓
Módulo 2  →  Auth (login, registro, middleware)
    ↓
Módulo 3  →  Cardápio (categorias, produtos, CRUD)
    ↓
Módulo 4  →  WhatsApp (bot, Evolution API, webhook)
    ↓
Módulo 5  →  KDS (cozinha, real-time, pg_notify)
    ↓
Módulo 6  →  QR Code (cardápio público, mesas)
    ↓
Módulo 7  →  Dashboard (métricas, kanban de pedidos)
    ↓
Módulo 8  →  Stripe (assinaturas, planos, PIX)
    ↓
Módulo 9  →  CRM (clientes, fidelidade, pontos)
    ↓
Módulo 10 →  Refinamentos (testes, docs, rate-limit)
Módulo 11 →  Design System (componentes UI, ícones)
Módulo 12 →  Refinamentos Visuais (redesign completo do painel ✅)
```

---

## 🚀 Como Rodar o Projeto

### 1. Web App (Next.js) — Desenvolvimento

```bash
# Clone
git clone https://github.com/Tanattos18/saas-restaurante.git
cd saas-restaurante

# Instale dependências
npm install

# Configure variáveis de ambiente
copy .env.example .env
# Edite .env com DATABASE_URL, JWT secrets, etc.

# Rode migrations e seed (precisa de PostgreSQL)
npx prisma migrate dev --name init
npx prisma db seed

# Inicie servidor de desenvolvimento
npm run dev
```

Acesse `http://localhost:3000/login` — credenciais de teste:
```
Restaurante: restaurante-teste
Email:       admin@restaurante.com
Senha:       admin123
```

Na página de login, clique em **"🎯 Usar conta de teste"** para preencher automaticamente.

### Páginas do Painel Admin (após login)

| Rota | Descrição |
|------|-----------|
| `/{tenantSlug}/dashboard` | Dashboard com métricas e gráficos |
| `/{tenantSlug}/menu` | Gestão de produtos do cardápio |
| `/{tenantSlug}/categories` | Gestão de categorias (estilo iFood) |
| `/{tenantSlug}/orders` | Kanban de pedidos |
| `/{tenantSlug}/kds` | Kitchen Display System (tela da cozinha) |
| `/{tenantSlug}/qr-code` | Geração de QR Codes para mesas |
| `/{tenantSlug}/customers` | CRM de clientes |
| `/{tenantSlug}/loyalty` | Programa de fidelidade |
| `/{tenantSlug}/settings/subscription` | Planos e assinatura Stripe |

### Cardápio Público

| Rota | Descrição |
|------|-----------|
| `/{tenantSlug}` ou `/menu/{tenantSlug}` | Cardápio digital público |
| `/table/{tenantSlug}/{numero}` | Pedido direto na mesa |

### 2. PWA (Progressive Web App)

O PWA já está configurado com `@serwist/next`. Após fazer deploy:
- Abra o site no Chrome ou Edge
- Clique no ícone **Instalar** na barra de endereço
- O app abre em modo standalone (sem navegador)

Comandos úteis:
```bash
npm run build        # Gera service worker (public/sw.js)
npm run typecheck    # Verifica TypeScript
npm run lint         # Verifica ESLint
```

### 3. App Desktop (Electron) — Desenvolvimento

O Electron carrega o Next.js em http://localhost:3000 no modo dev.

```bash
# Terminal 1 — Iniciar Next.js (API + Frontend)
cd saas-restaurante
npm run dev

# Terminal 2 — Iniciar Electron (janela desktop)
cd app-desktop
npm install          # Primeira vez apenas
npm run dev
```

### 4. App Desktop (Electron) — Build Produção

Gera instaladores para Windows (.exe), macOS (.dmg) e Linux (.AppImage):

```powershell
# PowerShell
.\app-desktop\scripts\build.ps1 dist    # Gera instaladores
.\app-desktop\scripts\build.ps1 release # Gera + publica no GitHub
```

### 5. Comandos Rápidos

| Comando | O que faz |
|---------|-----------|
| `npm run dev` | Inicia Next.js em http://localhost:3000 |
| `npm run build` | Build de produção + service worker PWA |
| `npm run typecheck` | Verifica erros TypeScript |
| `npm run lint` | Verifica ESLint |
| `npm test` | Roda testes Jest |
| `npx prisma studio` | Abre Prisma Studio (banco) |
| `cd app-desktop && npm run dev` | Inicia Electron (precisa do Next.js rodando) |

---

## 📐 Convenções de Código

- **NUNCA** usar `any` — tipagem estrita sempre
- **NUNCA** extrair tenantId do client — sempre do JWT ou header `x-tenant-id`
- **SEMPRE** validar input com Zod antes de tocar no banco
- **SEMPRE** tratar erros com try/catch retornando `{ success, data?, error? }`
- `createTenantPrisma(tenantId)` recebe tenantId como parâmetro explícito
- Nomes de arquivos em kebab-case para rotas, camelCase para serviços
- Mensagens de commit em português, descritivas
