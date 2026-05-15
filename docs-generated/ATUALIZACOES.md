# 📝 Atualizações e Mudanças Recentes

**Última atualização:** 15/05/2026

---

## 🔄 Status do Projeto

O projeto está **~95% implementado**. Todos os 10 módulos principais possuem funcionalidades Core implementadas.

---

## ✅ Funcionalidades Implementadas (por módulo)

### Módulo 1 — Base do Projeto ✅
- Schema Prisma com 15 modelos + 18 enums
- Singleton Prisma seguro
- Factory `createTenantPrisma(tenantId)` com auto-injeção de tenantId
- Seed com dados de teste
- Variáveis de ambiente configuradas

### Módulo 2 — Autenticação ✅
- JWT com access token (15min) + refresh token (7d)
- Login com tenantSlug + email + password
- Registro de novo tenant
- Middleware com RBAC por role
- Refresh token automático
- Logout
- **Botão "Usar conta de teste" na página de login** (adição reciente)

### Módulo 3 — CRUD Cardápio ✅
- CRUD completo de categorias
- **Interface de categorias estilo iFood** (Grid de cards, ícones emoji, toggle)
- CRUD completo de produtos
- Controle de estoque com alertas
- PromoPrice validado
- API routes completas

### Módulo 4 — Bot WhatsApp ✅
- Integração Evolution API v2
- Webhook para recebimento de mensagens
- Máquina de estados completa
- Sessão expira em 24h
- Tratamento de erros (3 falhas → humano)
- Comandos "cancelar" e "menu"

### Módulo 5 — KDS ✅
- Real-time via PostgreSQL LISTEN/NOTIFY
- KitchenBoard com 3 colunas
- Timer colorido (verde/amarelo/vermelho)
- Som de notificação (Web Audio API)
- Registro de dispositivos
- Fullscreen mode

### Módulo 6 — QR Code ✅
- Geração de QR Codes por mesa
- Cardápio público mobile-first
- Filtros por categoria
- Indicadores (vegan, sem glúten, promoção)
- Carrinho de compras
- Checkout público
- Pagamento PIX

### Módulo 7 — Dashboard ✅
- Métricas (total pedidos, receita, ticket médio, pendentes)
- Gráficos com Recharts
- Kanban de pedidos
- OrderNumber sequencial (anti race condition)
- Timeline de status

### Módulo 8 — Stripe ✅
- Integração Stripe completa
- Checkout Session
- Customer Portal
- Webhooks
- Geração PIX
- Página de assinatura

### Módulo 9 — CRM e Fidelidade ✅
- Programa de fidelidade (pontos)
- Earn/Redeem points
- Expiração de pontos (365 dias)
- CRM de clientes
- Histórico de transações

### Módulo 10 — Refinamentos ✅
- Health check endpoint
- Sidebar responsiva
- Header com informações
- PWA com @serwist/next
- Service worker com cache offline
- Manifest + ícones
- Electron App (estrutura completa)
- Documentação de deploy

---

## 🆕 Alterações Recentes (14/05/2026)

### 1. Interface de Categorias Estilo iFood
**Arquivos criados/modificados:**
- `components/platform/categories/CategoryList.tsx` — Grid de cards com ícones emoji, busca, toggle
- `components/platform/categories/CategoryForm.tsx` — Formulário com seletor de emojis
- `app/(platform)/[tenantSlug]/categories/page.tsx` — Página com banner gradiente laranja
- `app/(platform)/[tenantSlug]/categories/new/page.tsx` — Nova categoria
- `app/(platform)/[tenantSlug]/categories/[id]/page.tsx` — Editar categoria
- `app/api/categories/[id]/route.ts` — Adicionado endpoint de toggle

**Características:**
- Grid responsivo (1-4 colunas)
- Cards com ícone emoji colorido
- Toggle para ativar/desativar
- Busca por nome
- Botão editar e excluir
- Banner gradiente laranja (estilo iFood)

### 2. Botão "Usar Conta de Teste"
**Arquivos modificados:**
- `app/(auth)/login/page.tsx` — Login principal
- `src/frontend/app/(auth)/login/page.tsx` — Login alternativo

**Funcionalidade:**
- Botão abaixo do formulário de login
- Preenche automaticamente:
  - Restaurante: `restaurante-teste`
  - Email: `admin@restaurante.com`
  - Senha: `admin123`

### 3. API de Categories Expandida
**Arquivo modificado:**
- `app/api/categories/[id]/route.ts`

**Adição:**
- Endpoint PATCH com action: `toggle` para ativar/desativar categoria

---

## 🆕 Alterações Recentes (15/05/2026)

### 1. Redesign Visual Completo do Painel
**Escopo:** Todos os componentes da área logada foram refinados visualmente.

#### Design System Atualizado
- **Paleta de cores:** Slate + Emerald (verde #059669) como cor primária, substituindo o cinza neutro
- **Tema escuro:** Variáveis CSS customizadas para dark mode completo
- **Animações:** `fade-in`, `fade-in-up`, `scale-in`, `pulse-soft` em toda a interface
- **Scrollbar customizada:** Mais sutil, integrada ao design

#### Componentes Refatorados

| Componente | Melhorias |
|------------|-----------|
| **StatsCards** | Gradientes, ícones SVG, animação de valor numérico, entrada em cascata, indicador pulse nos pendentes |
| **SalesChart** | Gráfico de barras com gradiente, PieChart por canal com legenda, tooltips estilizados |
| **RecentOrders** | Dots de status, ícone de canal, horário, link para detalhe, hover com elevação |
| **Sidebar** | SVG icons (lucide-style), indicador ativo com barra verde, badge de notificação animado |
| **HeaderWrapper** | Avatar com iniciais, dropdown animado, badge de plano estilizado, loading skeleton |
| **OrderKanban** | Filter pills com toggle visual, colunas com header gradiente, empty state |
| **OrderCard** | Badge de canal, status dot, contagem de itens, hover elevado |
| **KitchenBoard** | Header com glass effect, status pulse, colunas gradientes, empty state |
| **OrderTicket** | Ícones SVG, destaque para observações, botão de ação contextual |
| **KitchenTimer** | Pulsing animation para tempos críticos (>25min) |
| **ProductList** | Input com ícone de busca, toggle estilizado, badge "Promo", hover na linha |
| **CategoryList** | Grid responsivo, busca com ícone, toggle suave, transições |
| **StockAlert** | Design refinado com ícone de alerta, cores amarelo/âmbar |

#### Páginas Atualizadas
- `app/(platform)/[tenantSlug]/dashboard/page.tsx` — Cabeçalho com data, status online, layout refinado
- `app/(platform)/[tenantSlug]/orders/page.tsx` — Layout consistente com animação
- `app/(platform)/[tenantSlug]/categories/page.tsx` — Design simplificado (removido banner laranja)
- `app/(platform)/[tenantSlug]/menu/page.tsx` — Cards com sombra
- `app/(platform)/[tenantSlug]/kds/page.tsx` — Tela de registro com gradiente e ícone

#### Correção de Pipeline CSS
- Adicionado `postcss.config.mjs` na raiz do projeto (estava apenas em `config/`)
- Adicionado Tailwind CDN como fallback no `layout.tsx` para garantir renderização imediata
- Custom properties CSS para cores, animações e scrollbar inline no layout

### 2. Novos Arquivos Criados
- `postcss.config.mjs` — Configuração PostCSS para Tailwind v4 na raiz do projeto

### 3. Arquivos Substituídos (sync entre app/ e src/frontend/app/)
Sincronizadas as páginas duplicadas entre `app/` e `src/frontend/app/`:
- `layout.tsx` (root)
- `(platform)/layout.tsx`
- `(platform)/[tenantSlug]/dashboard/page.tsx`
- `(platform)/[tenantSlug]/orders/page.tsx`
- `(platform)/[tenantSlug]/categories/page.tsx`
- `(platform)/[tenantSlug]/menu/page.tsx`
- `(platform)/[tenantSlug]/kds/page.tsx`
- `globals.css`

---

O projeto possui duas estruturas de app:
1. `src/frontend/app/` — Estrutura principal (usada atualmente)
2. `app/` — Estrutura alternativa/legacy

### Pastas principais em `src/frontend/app/(platform)/[tenantSlug]/`:
```
├── dashboard/         # Dashboard com métricas
├── menu/              # Gestão de produtos
│   ├── page.tsx       # Lista de produtos
│   ├── new/           # Novo produto
│   └── [id]/          # Editar produto
├── categories/        # Gestão de categorias (NOVO!)
│   ├── page.tsx       # Lista de categorias
│   ├── new/           # Nova categoria
│   └── [id]/          # Editar categoria
├── orders/            # Kanban de pedidos
├── kds/               # Kitchen Display System
├── qr-code/           # Geração de QR Codes
├── customers/         # CRM de clientes
├── loyalty/           # Programa de fidelidade
└── settings/          # Configurações
    └── subscription/  # Assinatura Stripe
```

---

## 🔧 Como Testar as Novas Funcionalidades

### 1. Login Automático
1. Acesse `http://localhost:3000/login`
2. Clique em **"🎯 Usar conta de teste"**
3. O formulário será preenchido automaticamente
4. Clique em **"Entrar"**

### 2. Categorias (Novo)
1. Após login, vá para `/restaurante-teste/categories`
2. Você verá o novo layout estilo iFood
3. Teste criar nova categoria
4. Teste editar categoria existente
5. Teste toggle de ativar/desativar

### 3. Menu (Produtos)
1. Vá para `/restaurante-teste/menu`
2. Teste criar novo produto
3. Teste editar produto existente

---

## 📋 Variáveis de Ambiente Necessárias

Crie um arquivo `.env` na raiz do projeto:

```env
# Banco de Dados
DATABASE_URL="postgresql://user:password@host:5432/db"

# JWT (OBRIGATÓRIO)
JWT_ACCESS_SECRET="sua-chave-access-minimo-32-caracteres"
JWT_REFRESH_SECRET="sua-chave-refresh-minimo-32-caracteres"

# Evolution API (WhatsApp)
EVOLUTION_API_URL="https://seu-servidor-evolution.com"
EVOLUTION_API_KEY="sua-api-key"
EVOLUTION_INSTANCE_NAME="seu-numero-whatsapp"

# Stripe (Opcional - para assinaturas)
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Redis (Opcional - rate limiting)
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."
```

---

## 🚀 Como Executar

```bash
# Instalar dependências
npm install

# Criar banco e executar seed
npx prisma migrate dev --name init
npx prisma db seed

# Iniciar servidor
npm run dev
```

Acesse: `http://localhost:3000/login`

---

## 📊 Métricas do Projeto

| Métrica | Valor |
|---------|-------|
| Arquivos TypeScript | 100+ |
| API Routes | 25+ |
| Services | 13+ |
| Componentes React | 40+ |
| Páginas | 16+ |
| Cobertura de módulos | ~95% |

---

## 📝 Notas Importantes

1. **Estrutura dual:** O projeto tem duas pastas `app/` (raiz e `src/frontend/`). A documentação pode mentionar ambas.

2. **Credenciais de teste:** Sempre use o botão "Usar conta de teste" para login rápido.

3. **Categorias:** A página de categorias foi recentemente atualizada com interface estilo iFood.

4. **Backup:** Backups são salvos em `_backup/` com script `backup.ps1`.

---

---

## 🆕 Correções (15/05/2026 — 2ª rodada)

### 1. Middleware — APIs Públicas Liberadas
**Problema:** `/api/menu` e `/api/orders` bloqueados para clientes não autenticados.
**Correção:** Adicionados à lista `publicApiPrefixes` no middleware.

### 2. ProductList — Decimal do Prisma
**Problema:** `TypeError: product.price.toFixed is not a function` porque Prisma retorna Decimal como string.
**Correção:** `Number(product.price).toFixed(2)` em todo o ProductList.

### 3. QR Code — URL com localhost
**Problema:** `.env` com `NEXT_PUBLIC_APP_URL="http://localhost:3000"` sobrescrevia o host real.
**Correção:** Prioridade invertida — host real primeiro, env var como fallback.
**Arquivo:** `app/api/qr-code/tables/route.ts`

### 4. Páginas Faltantes Criadas
Criadas 6 páginas que estavam com 404:
- `/inventory`, `/financial`, `/financial/reports`
- `/settings`, `/settings/team`, `/settings/whatsapp`

---

> **Próximas atualizações:** Testes unitários, rate limiting, refinamentos finais para produção