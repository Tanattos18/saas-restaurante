# Módulo 1 — Base do Projeto

## Objetivo

Criar a fundação do SaaS: schema do banco de dados, cliente Prisma com isolamento multi-tenant, configurações do projeto Next.js e dados de seed para desenvolvimento.

---

## Arquivos Criados

### 1. `prisma/schema.prisma`

Schema completo com **15 modelos** e **18 enums**.

#### Modelos:

| Modelo | Descrição | Campos-chave |
|--------|-----------|--------------|
| **Tenant** | Restaurante (cliente do SaaS) | `slug` (subdomínio), `plan`, `status`, `stripeSubscriptionId` |
| **User** | Funcionário do restaurante | `tenantId` + `email` (unique), `role` (OWNER, MANAGER, STAFF, CASHIER, KITCHEN) |
| **Customer** | Cliente final (WhatsApp) | `tenantId` + `phone` (unique), `loyaltyPoints`, `loyaltyLevel` |
| **Category** | Categoria do cardápio | `position` (ordenação), `showInQRCode` |
| **Product** | Produto do cardápio | `price`, `promoPrice`, `stock`, `preparationTime`, flags (`isVegan`, `isGlutenFree`) |
| **Order** | Pedido | `orderNumber` (sequencial por tenant), `channel`, `status`, timestamps de cada etapa |
| **OrderItem** | Item do pedido | `unitPrice` (snapshot), `variations`, `addons` (JSON) |
| **ChatSession** | Sessão WhatsApp | `state` (máquina de estados), `context` (JSON), `expiresAt` |
| **ChatMessage** | Mensagem WhatsApp | `direction` (inbound/outbound), `type`, `status` |
| **KitchenDevice** | Tela de cozinha KDS | `deviceCode` (autenticação), `type`, `currentOrderIds` |
| **InventoryItem** | Item de estoque | `currentStock`, `minStock`, `maxStock`, `cost` |
| **InventoryLog** | Movimento de estoque | `type` (IN/OUT/ADJUST), `previousStock`, `newStock` |
| **Payment** | Pagamento | `method`, `amount`, `status`, `transactionId`, `pixCode` |
| **LoyaltyTransaction** | Transação de fidelidade | `points`, `balanceAfter`, `type` (EARN/REDEEM/EXPIRED/BONUS) |

#### Enums:

`Plan`, `TenantStatus`, `SubscriptionStatus`, `UserRole`, `UserStatus`, `LoyaltyLevel`, `OrderChannel`, `OrderType`, `OrderStatus`, `OrderItemStatus`, `PaymentMethod`, `PaymentStatus`, `ChatState`, `MessageDirection`, `MessageType`, `MessageStatus`, `DeviceType`, `DeviceStatus`, `InventoryType`, `LoyaltyType`

#### Estratégia Multi-tenant:

- Toda tabela de negócio tem `tenantId: String`
- Índices compostos: `@@unique([tenantId, ...])` e `@@index([tenantId])`
- Relacionamentos com `Tenant` via `@relation(fields: [tenantId], references: [id], onDelete: Cascade)`

---

### 2. `lib/prisma.ts` — Singleton Prisma

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
```

- **Singleton**: reaproveita a conexão em hot reload (dev)
- **Seguro**: não lê `headers()` (diferente da v1.0)
- **Export default**: usado apenas pelo `tenant-prisma.ts`

---

### 3. `lib/tenant-prisma.ts` — Factory com Auto-filtro

```typescript
import prisma from './prisma'

export function createTenantPrisma(tenantId: string) {
  if (!tenantId) throw new Error('tenantId é obrigatório')

  return prisma.$extends({
    query: {
      $allModels: {
        async findMany({ args, query }) {
          args.where = { ...args.where, tenantId }
          return query(args)
        },
        // findFirst, count, updateMany, deleteMany, create
      },
    },
  })
}
```

**Como usar:**
```typescript
// Nas API routes:
const db = createTenantPrisma(tenantId) // tenantId vem do JWT
const products = await db.product.findMany() // auto-filtrado!
```

**Vantagens:**
- Isolamento automático — previne vazamento de dados entre tenants
- `tenantId` é parâmetro explícito, não lido de headers globais
- Compatível com o Prisma `$extends` (type-safe)

---

### 4. `.env.example`

```env
DATABASE_URL="postgresql://..."
JWT_ACCESS_SECRET="..."
JWT_REFRESH_SECRET="..."
STRIPE_SECRET_KEY="sk_test_..."
EVOLUTION_API_URL="http://localhost:8080"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

### 5. `package.json`

**33 dependências** organizadas em:

| Categoria | Pacotes |
|-----------|---------|
| **Core** | next@15, react@19, typescript@5 |
| **Banco** | @prisma/client, prisma |
| **Auth** | jose (JWT), bcryptjs |
| **UI** | tailwindcss v4, shadcn/ui (radix), lucide-react, tailwind-merge, tailwindcss-animate, class-variance-authority, clsx |
| **Forms** | react-hook-form, @hookform/resolvers, zod |
| **Pagamentos** | stripe |
| **WhatsApp** | Evolution API (HTTP, sem pacote específico) |
| **Real-time** | PostgreSQL LISTEN/NOTIFY (via `pg` — será adicionado no Módulo 5) |
| **QR Code** | qrcode, pdfkit |
| **Gráficos** | recharts |
| **DnD** | @dnd-kit/core, sortable, utilities |
| **Redis** | @upstash/ratelimit, @upstash/redis |
| **Testes** | jest, @testing-library/react |
| **Dev** | tsx (para seed), eslint-config-next |

---

### 6. `prisma/seed.ts`

Popula o banco com dados de teste:

```
Tenant: Restaurante Teste (slug: restaurante-teste)
  ├── Admin: admin@restaurante.com / admin123 (role: OWNER)
  ├── Categoria: Lanches 🍔
  │   ├── X-Bacon Especial (R$ 29,90)
  │   └── X-Salada Simples (R$ 24,90)
  ├── Categoria: Bebidas 🥤
  │   ├── Coca-Cola Lata (R$ 6,90)
  │   └── Suco Natural de Laranja (R$ 12,90)
  └── Categoria: Porções 🍟
      └── Batata Frita c/ Cheddar e Bacon (R$ 39,90)
```

**Script:** `npx prisma db seed` (configurado com `tsx` no package.json)

---

### 7. Configurações do Projeto

| Arquivo | Função |
|---------|--------|
| `tsconfig.json` | TypeScript strict + paths `@/*` |
| `next.config.ts` | Next.js 15 com images remoto + server actions |
| `postcss.config.js` | PostCSS com `@tailwindcss/postcss` (Tailwind v4) |
| `app/globals.css` | Tema claro/escuro via CSS custom properties |
| `app/layout.tsx` | Root layout com HTML lang=pt-BR |
| `app/page.tsx` | Redireciona para `/login` |
| `.gitignore` | node_modules, .next, .env, prisma/migrations |

---

## Como Rodar

```bash
# 1. Instalar dependências
npm install

# 2. Configurar banco PostgreSQL e colocar URL no .env
#    Copie .env.example para .env e edite

# 3. Rodar migration
npx prisma migrate dev --name init

# 4. Popular com dados de teste
npx prisma db seed

# 5. Iniciar dev server
npm run dev
```

---

## Decisões Técnicas

| Decisão | Escolha | Motivo |
|---------|---------|--------|
| Singleton sem headers | `prisma.ts` puro + `tenant-prisma.ts` factory | Evita erro em build time; tenantId é explícito |
| Tailwind v4 | `@tailwindcss/postcss` | Mais rápido, CSS nativo, sem config file |
| shadcn/ui com Radix | `@radix-ui/*` | Acessível, headless, estilização via Tailwind |
| seed com `tsx` | TypeScript direto, sem compilar | Simples, sem step extra |
| `orderNumber` sequencial | `SELECT MAX + 1` com `FOR UPDATE` | Anti race-condition (implementado no Módulo 7) |

---

## Backup

```bash
git tag v0.2-modulo1
```

Tag salva no GitHub. Para restaurar: `git checkout v0.2-modulo1`
