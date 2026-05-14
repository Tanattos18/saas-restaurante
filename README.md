# 🍽️ SaaS Restaurante

**Sistema multi-tenant de gestão para restaurantes** com atendimento via WhatsApp, tela de cozinha (KDS) e cardápio digital via QR Code.

---

## 📋 Índice

- [Visão Geral](#-visão-geral)
- [Funcionalidades](#-funcionalidades)
- [Stack Tecnológica](#-stack-tecnológica)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Módulos](#-módulos)
- [Como Instalar](#-como-instalar)
- [Como Usar](#-como-usar)
- [API Routes](#-api-routes)
- [Deploy](#-deploy)
- [Licença](#-licença)

---

## 🎯 Visão Geral

SaaS Restaurante é uma plataforma B2B que permite que restaurantes e lanchonetes gerenciem seu negócio digitalmente. Cada restaurante é um "tenant" (inquilino) com isolamento total de dados.

### Para quem é?
- Donos de restaurantes/lanchonetes que querem digitalizar o negócio
- Clientes que fazem pedidos via WhatsApp ou QR Code na mesa
- Cozinheiros que precisam visualizar pedidos em tempo real

### Principais funcionalidades
- **Multi-tenant**: cada restaurante tem seu subdomínio (ex: `burgerking.app.com`)
- **Bot WhatsApp**: atendimento automático com máquina de estados
- **KDS** (Kitchen Display System): tela da cozinha em tempo real
- **Cardápio Digital**: acessível via QR Code na mesa
- **CRM + Fidelidade**: programa de pontos e níveis
- **Assinaturas**: planos mensais via Stripe
- **Dashboard**: métricas e gráficos do restaurante

---

## ✨ Funcionalidades

### 🏪 Gestão do Restaurante
- Cadastro de produtos e categorias com drag-and-drop
- Controle de estoque com alerta de mínimo
- Preços promocionais e variações
- Cardápio digital público com SEO

### 💬 Bot WhatsApp (Evolution API v2)
- Atendimento automático 24h
- Fluxo completo: cadastro → cardápio → pedido → pagamento
- Sessão expira em 24h
- 3 entradas inválidas → transferência para atendente
- Comandos globais: "cancelar" e "menu"

### 👨‍🍳 KDS (Kitchen Display System)
- 3 colunas: Pendentes | Em Preparo | Prontos
- Atualização em tempo real via PostgreSQL LISTEN/NOTIFY
- Timer colorido (verde <15min, amarelo 15-25min, vermelho >25min)
- Botão contextual por status
- Modo fullscreen

### 📱 Cardápio Público + QR Code
- Design mobile-first
- Filtro por categoria com tabs
- Badges: vegano, sem glúten, promoção
- Carrinho de compras e checkout
- QR Code por mesa (gera PNG/PDF)

### ⭐ CRM e Fidelidade
- Programa de pontos: R$1 = 1 ponto
- Resgate: 100 pontos = R$5 de desconto
- Níveis: Bronze, Prata, Ouro, Platina
- Detecção de churn (clientes >30 dias sem pedir)

### 💳 Assinaturas (Stripe)
- Planos: FREE (50 pedidos/mês), BASIC (R$97), PRO (R$197), ENTERPRISE (R$497)
- Trial de 14 dias
- Limite de pedidos por plano
- Customer Portal para gerenciar assinatura

---

## 🧱 Stack Tecnológica

| Categoria | Tecnologia | Versão |
|-----------|------------|--------|
| **Framework** | Next.js 15 (App Router) | ^15.2 |
| **Linguagem** | TypeScript (strict) | ^5.7 |
| **Banco** | PostgreSQL | 16+ |
| **ORM** | Prisma ORM | ^6.5 |
| **Autenticação** | JWT (jose) + bcryptjs | ^6.0 |
| **UI** | Tailwind CSS v4 + shadcn/ui | ^4.0 |
| **Validação** | Zod | ^3.24 |
| **Pagamentos** | Stripe | ^17.0 |
| **WhatsApp** | Evolution API v2 | REST |
| **Real-time** | PostgreSQL LISTEN/NOTIFY | Nativo |
| **Cache/Redis** | Upstash (opcional) | - |
| **QR Code** | qrcode + pdfkit | ^1.5 |
| **Gráficos** | Recharts | ^2.15 |
| **Testes** | Jest + Testing Library | ^29 |

### Por que estas escolhas?

| Decisão | Motivo |
|---------|--------|
| **Next.js 15** | SSR, API Routes nativas, Server Components |
| **JWT próprio** | Controle total do multi-tenant (não NextAuth) |
| **Tailwind v4** | CSS nativo, sem config, mais rápido |
| **PostgreSQL LISTEN/NOTIFY** | Real-time sem custo extra, <100ms latência |
| **Evolution API** | Open-source, self-hosted, confiável no Brasil |
| **Prisma $extends** | Isolamento multi-tenant type-safe |

---

## 📂 Estrutura do Projeto

```
saas-restaurante/
│
├── app/                              # Next.js App Router
│   ├── (auth)/                       # Login, registro, recuperar senha
│   ├── (platform)/                   # Área logada do restaurante
│   │   └── [tenantSlug]/             # Subdomínio: burgerking.app.com
│   │       ├── dashboard/            # Métricas e gráficos
│   │       ├── menu/                 # CRUD de produtos
│   │       ├── orders/               # Kanban de pedidos
│   │       ├── kds/                  # Tela da cozinha (fullscreen)
│   │       ├── customers/            # CRM de clientes
│   │       ├── loyalty/              # Programa de fidelidade
│   │       ├── qr-code/              # Gestão de QR Codes
│   │       ├── settings/             # Configurações + assinatura
│   │       └── ...                   # categories, financial, inventory
│   ├── (public)/                     # Cardápio público (sem auth)
│   │   ├── menu/[slug]/              # Cardápio digital
│   │   └── table/[slug]/[n]/         # Pedido na mesa
│   └── api/                          # API REST
│       ├── auth/                     # login, register, refresh, logout, me
│       ├── categories/               # CRUD + reorder
│       ├── products/                 # CRUD + toggle + stock
│       ├── orders/                   # CRUD + status
│       ├── kds/                      # SSE stream + devices + status
│       ├── menu/                     # Cardápio público
│       ├── qr-code/                  # Geração de QR Codes
│       ├── payment/                  # Stripe + PIX
│       └── webhooks/                 # WhatsApp + Stripe
│
├── components/                       # Componentes React
│   ├── ui/                           # shadcn/ui
│   ├── platform/                     # Sidebar, Header, dashboard, kds, orders...
│   └── public/                       # ProductCard, Cart, Checkout, MenuViewer
│
├── lib/                              # Biblioteca e utilitários
│   ├── prisma.ts                     # Singleton Prisma
│   ├── tenant-prisma.ts              # Factory com auto-filtro tenantId
│   ├── jwt.ts                        # Sign/verify JWT (jose)
│   ├── auth.ts                       # getAuthContext, getTokenFromRequest
│   ├── whatsapp.ts                   # Cliente Evolution API
│   ├── stripe.ts                     # Instância + planos
│   ├── pg-notify.ts                  # PostgreSQL LISTEN/NOTIFY
│   └── validations/                  # Schemas Zod
│
├── services/                         # Lógica de negócio
│   ├── auth.service.ts               # Autenticação
│   ├── tenant.service.ts             # CRUD tenants
│   ├── category.service.ts           # CRUD categorias
│   ├── product.service.ts            # CRUD produtos
│   ├── order.service.ts              # Pedidos + limite de plano
│   ├── customer.service.ts           # CRM clientes
│   ├── kds.service.ts                # KDS + dispositivos
│   ├── analytics.service.ts          # Métricas e gráficos
│   ├── stripe.service.ts             # Stripe webhooks
│   ├── loyalty.service.ts            # Pontos e fidelidade
│   ├── qr-code.service.ts            # QR Codes
│   └── whatsapp/                     # Bot, templates, fluxos
│       ├── bot.service.ts            # Máquina de estado (11 estados)
│       ├── message.service.ts        # Envio de mensagens
│       ├── flow.service.ts           # Fluxos (menu, categorias)
│       └── templates.ts              # Templates de texto
│
├── middleware.ts                     # JWT + RBAC + headers tenant
├── prisma/
│   ├── schema.prisma                 # Schema do banco (15 modelos)
│   ├── migrations/                   # Migrations SQL
│   └── seed.ts                       # Dados de teste
│
├── __tests__/                        # Testes Jest
├── docs/                             # DEPLOY.md, WHATSAPP_SETUP.md
├── modulos/                          # Documentação de cada módulo
├── _backup/                          # Backups físicos (backup.ps1)
│
├── CHECKLIST.md                      # Acompanhamento de progresso
├── INDEX.md                          # Roadmap geral
└── MANUAL-DE-TRABALHO.md             # Guia de desenvolvimento
```

---

## 📦 Módulos

O projeto foi dividido em 10 módulos implementados sequencialmente:

| # | Módulo | O que faz |
|---|--------|-----------|
| 1 | **Base** | Schema Prisma (15 modelos, 18 enums), singleton, factory tenant, seed |
| 2 | **Autenticação** | JWT (jose), login/register, middleware com RBAC (roles) |
| 3 | **Cardápio** | CRUD de categorias e produtos, estoque, promoções |
| 4 | **Bot WhatsApp** | Máquina de estado com 11 estados, Evolution API v2 |
| 5 | **KDS** | Tela da cozinha com PostgreSQL LISTEN/NOTIFY |
| 6 | **QR Code** | Cardápio público, pedido na mesa, impressão de QR Codes |
| 7 | **Dashboard** | Métricas, kanban de pedidos, gráficos Recharts |
| 8 | **Stripe** | Assinaturas, planos, PIX, webhooks |
| 9 | **CRM** | Clientes, fidelidade (pontos e níveis), churn |
| 10 | **Refinamentos** | Sidebar, Header, testes, docs, health check |

---

## 🚀 Como Instalar

### Pré-requisitos

- Node.js 20.x LTS ou superior
- PostgreSQL 16+
- npm ou yarn
- (Opcional) Docker para Evolution API

### Passo a passo

```bash
# 1. Clone o repositório
git clone https://github.com/Tanattos18/saas-restaurante.git
cd saas-restaurante

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com suas configurações (DATABASE_URL, JWT secrets, etc.)

# 4. Rode as migrations do banco
npx prisma migrate dev --name init

# 5. Popule com dados de teste
npx prisma db seed

# 6. Inicie o servidor de desenvolvimento
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

### Credenciais de teste (após seed)

```
Restaurante: restaurante-teste
Email:       admin@restaurante.com
Senha:       admin123
```

---

## 🎮 Como Usar

### Fluxo completo

```
1. Acesse /register → crie um restaurante
2. Faça login em /login
3. Adicione categorias e produtos no menu
4. Gere QR Codes para as mesas
5. Clientes escaneiam o QR Code e fazem pedidos
6. Pedidos aparecem no kanban e no KDS
7. Cozinha atualiza o status (Aceitar → Preparar → Pronto)
8. Cliente recebe notificação no WhatsApp
```

### Mãos na massa

#### Gerenciar Cardápio
1. Vá em **Cardápio** no menu lateral
2. Clique em **Novo Produto**
3. Preencha nome, preço, categoria e salve
4. Use o toggle para ativar/desativar produtos

#### Bot WhatsApp (requer Evolution API)
1. Configure a Evolution API (veja `docs/WHATSAPP_SETUP.md`)
2. Cliente envia mensagem para o número do restaurante
3. Bot responde automaticamente: nome → endereço → cardápio → pedido

#### Tela da Cozinha
1. Vá em **Cozinha (KDS)**
2. Clique em **Registrar Dispositivo** (salva no localStorage)
3. Pedidos aparecem em tempo real nas colunas
4. Clique em **Aceitar → Iniciar Preparo → Pronto**

#### Dashboard
- Veja métricas do dia: pedidos, receita, ticket médio
- Gráfico de pedidos por hora e por canal
- Últimos pedidos com status

---

## 🌐 API Routes

### Autenticação
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/auth/login` | Login (email + password + tenantSlug) |
| POST | `/api/auth/register` | Criar novo tenant |
| POST | `/api/auth/refresh` | Renovar access token |
| POST | `/api/auth/logout` | Limpar cookies |
| GET | `/api/auth/me` | Dados do usuário logado |

### Cardápio
| Método | Rota | Descrição |
|--------|------|-----------|
| GET/POST | `/api/categories` | Listar/criar categorias |
| GET/PATCH/DELETE | `/api/categories/[id]` | CRUD de categoria |
| POST | `/api/categories/reorder` | Reordenar categorias |
| GET/POST | `/api/products` | Listar/criar produtos |
| GET/PATCH/DELETE | `/api/products/[id]` | CRUD de produto |
| POST | `/api/products/[id]/toggle` | Ativar/desativar |
| POST | `/api/products/[id]/stock` | Atualizar estoque |

### Pedidos
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/orders` | Criar pedido (público) |
| PATCH | `/api/orders/[id]/status` | Atualizar status |

### KDS
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/kds/stream?deviceCode=X` | SSE em tempo real |
| POST | `/api/kds/devices` | Registrar dispositivo |
| PATCH | `/api/kds/orders/[id]/status` | Atualizar status |

### Pagamentos
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/payment/stripe/create-checkout` | Checkout Stripe |
| POST | `/api/payment/stripe/portal` | Customer Portal |
| POST | `/api/payment/pix/create` | Gerar código PIX |

### Webhooks
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/webhooks/whatsapp` | Mensagens WhatsApp |
| POST | `/api/webhooks/stripe` | Eventos Stripe |

### Público (sem auth)
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/menu/[slug]` | Cardápio público |
| GET | `/api/qr-code/tables?tables=1,2,3` | QR Codes |
| GET | `/api/health` | Health check |

---

## ☁️ Deploy

### Opção 1: Vercel (Frontend + API)

```bash
npm i -g vercel
vercel --prod
```

Configure as variáveis de ambiente no Vercel.

### Opção 2: VPS Ubuntu

```bash
# Instalar Node.js, PostgreSQL, nginx
# Buildar o projeto
npm run build
# Iniciar com PM2
npm i -g pm2
pm2 start npm --name "saas" -- start
```

### Banco de Dados

Recomendado: [Neon.tech](https://neon.tech) (serverless PostgreSQL)
Alternativas: Supabase, Railway, AWS RDS

### Variáveis de Ambiente

```env
DATABASE_URL=postgresql://...
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
EVOLUTION_API_URL=https://evo.seusite.com
EVOLUTION_API_KEY=...
EVOLUTION_INSTANCE_NAME=saas
NEXT_PUBLIC_APP_URL=https://app.seusite.com
```

Veja `docs/DEPLOY.md` para instruções detalhadas.

---

## 🧪 Testes

```bash
npm test              # Rodar testes Jest
npm run typecheck     # TypeScript check
npm run lint          # ESLint
```

---

## 📊 Status do Projeto

| Métrica | Valor |
|---------|-------|
| Módulos implementados | 10/10 |
| Itens concluídos | 83/93 (89%) |
| Tags de backup | 11 (v0.1 a v1.0) |
| TypeScript | 0 erros |
| Prisma | Schema válido |

---

## 🤝 Como Contribuir

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'feat: adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

---

## 📄 Licença

Este projeto é privado. Todos os direitos reservados.

---

**Desenvolvido com ❤️ para restaurantes brasileiros.**
