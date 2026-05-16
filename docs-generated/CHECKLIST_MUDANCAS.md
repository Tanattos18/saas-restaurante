# CHECKLIST DE MUDANÇAS — SaaS Restaurante

> Use este checklist para acompanhar o progresso das correções e melhorias.
> Marque com `[x]` quando concluído e `[ ]` quando pendente.

---

## PRIORIDADE 1 — CRÍTICO

### □ 1.1 Corrigir symlink do diretório `app/`

**Problema:** `app/` e `src/frontend/app/` são cópias independentes (deveriam ser symlink). O `layout.tsx` já divergiu — um usa tema verde, outro roxo.

**Solução:** Decidir qual diretório é a fonte da verdade e criar o symlink:

```powershell
Remove-Item -Recurse -LiteralPath "app"
New-Item -ItemType SymbolicLink -Path "app" -Target "src/frontend/app"
```

Após criar o symlink, verificar se as cores do `layout.tsx` estão consistentes (definir um padrão: roxo ou verde).

**Arquivos:** `app/`, `src/frontend/app/`
**Estimativa:** 1h

---

### □ 1.2 Corrigir race condition no orderNumber

**Problema:** A transação do Prisma gera o `orderNumber` lendo o último pedido, mas o `create` do pedido é feito FORA da transação. Entre a leitura e a criação, outra requisição pode pegar o mesmo número.

**Solução:** Mover o `prisma.order.create` para DENTRO da `$transaction`:

```typescript
const order = await prisma.$transaction(async (tx) => {
  const lastOrder = await tx.order.findFirst({
    where: { tenantId },
    orderBy: { orderNumber: 'desc' },
    select: { orderNumber: true },
  })
  const orderNumber = (lastOrder?.orderNumber ?? 0) + 1
  return tx.order.create({
    data: { ...data, orderNumber, tenantId }
  })
})
```

**Arquivo:** `src/backend/services/order.service.ts`
**Estimativa:** 1h

---

### □ 1.3 Corrigir N+1 queries na criação de pedidos

**Problema:** Para cada item do pedido, uma query `findUnique` separada é feita no banco.

**Solução:** Buscar todos os produtos em lote com `findMany`:

```typescript
const productIds = input.items.map(i => i.productId)
const products = await prisma.product.findMany({
  where: { id: { in: productIds } }
})
const productMap = new Map(products.map(p => [p.id, p]))
```

**Arquivo:** `src/backend/services/order.service.ts`
**Estimativa:** 1h

---

### □ 1.4 Completar tenant-prisma.ts — adicionar métodos faltantes

**Problema:** `findUnique`, `update`, `delete`, `upsert`, `findFirstOrThrow`, `findUniqueOrThrow` e `createMany` não têm filtro de tenantId, permitindo acesso cross-tenant.

**Solução:** Adicionar todos os métodos abaixo ao `$extends` no `tenant-prisma.ts`:

- [ ] `findUnique` — adicionar `where.tenantId = tenantId`
- [ ] `update` — adicionar `where.tenantId = tenantId`
- [ ] `delete` — adicionar `where.tenantId = tenantId`
- [ ] `upsert` — adicionar `where.tenantId = tenantId` no update e `tenantId` no create
- [ ] `findFirstOrThrow` — adicionar `where.tenantId = tenantId`
- [ ] `findUniqueOrThrow` — adicionar `where.tenantId = tenantId`
- [ ] `createMany` — injetar `tenantId` em cada registro do array

**Arquivo:** `src/backend/lib/tenant-prisma.ts`
**Estimativa:** 3h

---

### □ 1.5 Remover fallback de JWT secrets

**Problema:** Se `JWT_ACCESS_SECRET` não estiver definida, o código usa a string previsível `'fallback-access-secret-development-only'` como chave JWT.

**Solução:** Sempre lançar erro se a secret não estiver definida:

```typescript
const secret = process.env.JWT_ACCESS_SECRET
if (!secret) throw new Error('JWT_ACCESS_SECRET não configurada')
return new TextEncoder().encode(secret)
```

**Arquivo:** `src/backend/lib/jwt.ts`
**Estimativa:** 30min

---

### □ 1.6 Separar verifyToken para access e refresh tokens

**Problema:** `verifyToken()` tenta accessSecret primeiro, depois refreshSecret. Isso significa que refresh tokens (7 dias de validade) são aceitos como access tokens.

**Solução:** Criar duas funções separadas:

```typescript
export async function verifyAccessToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getAccessSecret())
    return payload as JwtPayload
  } catch { return null }
}

export async function verifyRefreshToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getRefreshSecret())
    return payload as JwtPayload
  } catch { return null }
}
```

E atualizar o middleware para usar apenas `verifyAccessToken`.

**Arquivos:** `src/backend/lib/jwt.ts`, `src/backend/middleware.ts`
**Estimativa:** 1h

---

## PRIORIDADE 2 — SEGURANÇA E PERFORMANCE

### □ 2.1 Remover Tailwind CDN do layout

**Problema:** `<script src="https://cdn.tailwindcss.com" />` carrega Tailwind via CDN, mesmo com PostCSS já compilando o CSS. Gera todas as classes client-side, prejudicando performance.

**Solução:** Remover a linha do CDN do `layout.tsx`. O PostCSS já compila o Tailwind via `@import "tailwindcss"` no `globals.css`.

**Arquivo:** `app/layout.tsx`
**Estimativa:** 30min

---

### □ 2.2 Consolidar CSS (remover `<style>` inline)

**Problema:** As mesmas variáveis CSS e animations estão definidas em 3 lugares: `globals.css`, `<style>` no `app/layout.tsx` e `<style>` no `src/frontend/app/layout.tsx`.

**Solução:** Mover todas as definições de `@keyframes` e custom properties para o `globals.css`. Remover os blocos `<style dangerouslySetInnerHTML>` de ambos os layouts.

**Arquivos:** `app/layout.tsx`, `app/globals.css`
**Estimativa:** 1h

---

### □ 2.3 Adicionar AbortController nos useEffects com fetch

**Problema:** `HeaderWrapper.tsx` faz fetch em `useEffect` sem `AbortController`. Se o componente desmontar antes da resposta, `setState` é chamado em componente desmontado.

**Solução:** Adicionar `AbortController` e limpar no return do `useEffect`:

```typescript
useEffect(() => {
  const ac = new AbortController()
  fetch('/api/tenant/me', { signal: ac.signal }).then(...)
  fetch('/api/auth/me', { signal: ac.signal }).then(...)
  return () => ac.abort()
}, [])
```

**Arquivos:** `HeaderWrapper.tsx` e outros componentes com padrão similar
**Estimativa:** 2h

---

### □ 2.4 Corrigir pg-notify (escapar payload corretamente)

**Problema:** A função `notify` só escapa aspas simples (`'`), deixando brecha para injeção SQL via payload.

**Solução:** Usar `pg-format` ou uma função de escape mais robusta:

```typescript
import { format } from 'pg-format'
await c.query(format('NOTIFY %I, %L', channel, payload))
```

Ou usar escapes manuais para `\`, `'`, `\n`:

```typescript
const escaped = payload.replace(/\\/g, '\\\\').replace(/'/g, "''").replace(/\n/g, '\\n')
```

**Arquivo:** `src/backend/lib/pg-notify.ts`
**Estimativa:** 1h

---

### □ 2.5 Remover 'use client' de componentes presentacionais

**Problema:** `Badge.tsx`, `Card.tsx`, `Button.tsx`, `Input.tsx`, `Textarea.tsx` têm `'use client'` mas não usam hooks, eventos ou browser APIs.

**Solução:** Remover a diretiva `'use client'` desses componentes. Testar se ainda funcionam como server components.

**Arquivos:** `src/frontend/components/ui/Badge.tsx`, `Card.tsx`, `Button.tsx`, `Input.tsx`, `Textarea.tsx`
**Estimativa:** 1h

---

### □ 2.6 Substituir document.write() no QR Code

**Problema:** Uso de `win.document.write()` para impressão de QR codes — função deprecated e insegura.

**Solução:** Usar `window.open()` + `innerHTML` ou uma biblioteca de impressão:

```typescript
const win = window.open('', '_blank')
if (win) {
  win.document.body.innerHTML = html
  win.print()
}
```

**Arquivo:** `src/frontend/app/(platform)/[tenantSlug]/qr-code/page.tsx`
**Estimativa:** 1h

---

## PRIORIDADE 3 — LIMPEZA E REFATORAÇÃO

### □ 3.1 Limpar diretório `_backup/`

**Problema:** ~20+ snapshots de backup ocupando 100+ MB a 500+ MB.

**Solução:** Manter no máximo 2-3 snapshots recentes. Migrar versões importantes para git tags.

```powershell
# Exemplo: manter só os 3 mais recentes
Get-ChildItem -LiteralPath "_backup" | Sort-Object LastWriteTime -Descending | Select-Object -Skip 3 | Remove-Item -Recurse -Force
```

**Arquivos:** `_backup/`
**Estimativa:** 1h

---

### □ 3.2 Remover arquivos de config duplicados

**Problema:** `config/next.config.ts` (nunca lido), `config/postcss.config.js` (nunca lido).

**Solução:** Remover os arquivos mortos de `config/`:

```
config/next.config.ts       → REMOVER
config/postcss.config.js    → REMOVER
```

**Arquivos:** `config/next.config.ts`, `config/postcss.config.js`
**Estimativa:** 30min

---

### □ 3.3 Limpar diretórios de API vazios

**Problema:** Vários endpoints de API têm apenas `.gitkeep` sem `route.ts`:

- `app/api/chat/send/`
- `app/api/chat/sessions/`
- `app/api/health/`
- `app/api/kds/stream/`
- `app/api/payment/pix/create/`
- `app/api/payment/stripe/create-checkout/`
- `app/api/payment/stripe/portal/`
- `app/api/webhooks/stripe/`
- `app/api/webhooks/whatsapp/`
- `app/api/qr-code/tables/`

**Solução:** Implementar os endpoints OU remover os diretórios.

**Arquivos:** Diretórios listados acima (em `app/` e `src/frontend/app/`)
**Estimativa:** 30min (remoção) ou 8h+ (implementação)

---

### □ 3.4 Remover dependências não utilizadas

**Problema:** `@upstash/ratelimit`, `@upstash/redis`, `ts-node`, `tailwindcss-animate` estão no `package.json` mas não são usados no código.

**Solução:** Remover do `package.json`:

```bash
npm uninstall @upstash/ratelimit @upstash/redis ts-node tailwindcss-animate
```

**Arquivo:** `package.json`
**Estimativa:** 1h

---

### □ 3.5 Corrigir encoding da sidebar

**Problema:** Labels `'Card�pio'` e `'Configura��es'` estão com acentuação corrompida.

**Solução:** Re-salvar o arquivo `Sidebar.tsx` com encoding UTF-8 sem BOM. Corrigir para `'Cardápio'` e `'Configurações'`.

**Arquivo:** `src/frontend/components/platform/Sidebar.tsx`
**Estimativa:** 30min

---

### □ 3.6 Remover console.warn/console.error de produção

**Problema:** `console.warn` e `console.error` em `jwt.ts`, `whatsapp.ts`, `pg-notify.ts` podem expor informações internas e não são adequados para logging em produção.

**Solução:** Substituir por um logger estruturado ou remover. Exemplo:

```typescript
// Criar src/backend/lib/logger.ts
export const logger = {
  error: (message: string, error?: unknown) => {
    console.error(JSON.stringify({ level: 'error', message, timestamp: new Date().toISOString(), error }))
  },
  warn: (message: string, context?: unknown) => {
    console.warn(JSON.stringify({ level: 'warn', message, timestamp: new Date().toISOString(), context }))
  }
}
```

Ou usar uma lib como `pino` ou `winston`.

**Arquivos:** `src/backend/lib/jwt.ts`, `src/backend/lib/whatsapp.ts`, `src/backend/lib/pg-notify.ts`
**Estimativa:** 2h

---

## PRIORIDADE 4 — MELHORIAS DE LONGO PRAZO

### □ 4.1 Atualizar Zod para v4

**Problema:** Projeto usa Zod ^3.24.0, mas Zod v4 já está disponível com melhorias de performance e tipos.

**Solução:** Atualizar e ajustar schemas se necessário:

```bash
npm install zod@latest
```

Verificar quebras de compatibilidade nos schemas de validação.

**Arquivos:** `package.json`, schemas em `src/backend/lib/validations/`
**Estimativa:** 4h

---

### □ 4.2 Adicionar indexes no banco de dados

**Problema:** FKs sem index: `ChatMessage.customerId`, `InventoryLog.inventoryItemId`, `LoyaltyTransaction.orderId`.

**Solução:** Adicionar indexes no schema.prisma:

```prisma
model ChatMessage {
  @@index([customerId])
}
model InventoryLog {
  @@index([inventoryItemId])
}
model LoyaltyTransaction {
  @@index([orderId])
}
```

Rodar `npx prisma migrate dev` após as alterações.

**Arquivo:** `src/backend/prisma/schema.prisma`
**Estimativa:** 1h

---

### □ 4.3 Criar tabela de junção KitchenDeviceOrder

**Problema:** `KitchenDevice.currentOrderIds` armazena IDs como `String[]` (array), anti-pattern relacional.

**Solução:** Criar modelo de junção:

```prisma
model KitchenDeviceOrder {
  id               String   @id @default(cuid())
  deviceId         String
  orderId          String
  addedAt          DateTime @default(now())
  device           KitchenDevice @relation(fields: [deviceId], references: [id], onDelete: Cascade)
  order            Order @relation(fields: [orderId], references: [id], onDelete: Cascade)
  @@index([deviceId])
  @@index([orderId])
}

model KitchenDevice {
  // Remover currentOrderIds String[]
  orders KitchenDeviceOrder[]
}
```

Depois migrar os dados existentes e remover o campo `currentOrderIds`.

**Arquivo:** `src/backend/prisma/schema.prisma`, `src/backend/services/kds.service.ts`
**Estimativa:** 4h

---

### □ 4.4 Adicionar unique constraints (Product.name + tenant, Category.name + tenant)

**Problema:** Não há impedimento de criar dois produtos ou categorias com o mesmo nome no mesmo tenant.

**Solução:** Adicionar no schema.prisma:

```prisma
model Product {
  @@unique([tenantId, name])
}
model Category {
  @@unique([tenantId, name])
}
```

Rodar `npx prisma migrate dev`.

**Arquivo:** `src/backend/prisma/schema.prisma`
**Estimativa:** 1h

---

### □ 4.5 Implementar endpoints de API pendentes

**Problema:** Vários endpoints de API são placeholder (só .gitkeep).

**Solução:** Implementar os endpoints conforme a necessidade do negócio:

- [ ] `api/chat/send/route.ts` — enviar mensagem WhatsApp
- [ ] `api/chat/sessions/route.ts` — listar sessões de chat
- [ ] `api/health/route.ts` — health check
- [ ] `api/kds/stream/route.ts` — SSE para KDS em tempo real
- [ ] `api/payment/pix/create/route.ts` — criar cobrança PIX
- [ ] `api/payment/stripe/create-checkout/route.ts` — criar checkout Stripe
- [ ] `api/payment/stripe/portal/route.ts` — portal de assinatura Stripe
- [ ] `api/webhooks/stripe/route.ts` — webhook Stripe
- [ ] `api/webhooks/whatsapp/route.ts` — webhook WhatsApp
- [ ] `api/qr-code/tables/route.ts` — gerenciar mesas QR Code

**Arquivos:** Diretórios listados em `app/api/` e `src/frontend/app/api/`
**Estimativa:** 8h+

---

### □ 4.6 Refatorar casts `as any` e `as never`

**Problema:** Múltiplos `as any` e `as never` espalhados pelo código que anulam a segurança de tipos.

**Solução:** Substituir cada ocorrência pelo tipo correto:

| Arquivo | Ocorrência | Correção |
|---|---|---|
| `order.service.ts` | `where as never` | Tipar `where` corretamente com `Prisma.OrderWhereInput` |
| `order.service.ts` | `channel as never` | Usar enum `OrderChannel` |
| `order.service.ts` | `status as never` | Usar enum `OrderStatus` |
| `user.service.ts` | `data.role as any` | Tipar com `UserRole` |
| `user.service.ts` | `data as any` | Tipar com `Prisma.UserCreateInput` |
| `SalesChart.tsx` | `{ active, payload, label }: any` | Criar interface `CustomTooltipProps` |
| `stripe.ts` | `apiVersion as never` | Usar tipo `Stripe.StripeConfig` |

**Arquivos:** Múltiplos (listados acima)
**Estimativa:** 4h

---

### □ 4.7 Usar env vars para JWT expiration

**Problema:** `'15m'` e `'7d'` hardcoded no `jwt.ts`, ignorando `JWT_ACCESS_EXPIRES_IN` e `JWT_REFRESH_EXPIRES_IN` do `.env`.

**Solução:** Ler do ambiente:

```typescript
const accessExpiresIn = process.env.JWT_ACCESS_EXPIRES_IN || '15m'
const refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d'
```

**Arquivo:** `src/backend/lib/jwt.ts`
**Estimativa:** 30min

---

### □ 4.8 Extrair dados hardcoded da sidebar para props/context

**Problema:** `'Plano PRO'` e `'Restaurante Teste'` estão hardcoded na sidebar.

**Solução:** Passar como props ou buscar do contexto de autenticação:

```typescript
// Sidebar.tsx
interface SidebarProps {
  tenantSlug: string
  tenantName: string
  planName: string
  pendingOrdersCount: number
}
```

E atualizar o `PlatformLayout` para passar os dados reais.

**Arquivo:** `src/frontend/components/platform/Sidebar.tsx`, `src/frontend/app/(platform)/layout.tsx`
**Estimativa:** 30min

---

### □ 4.9 Adicionar error boundaries e loading states

**Problema:** O root layout não tem `error.tsx` ou `loading.tsx`. Se algo quebrar, o usuário vê tela branca.

**Solução:** Criar:

- `app/error.tsx` — error boundary global
- `app/loading.tsx` — loading state global
- `app/(platform)/error.tsx` — error boundary específico da plataforma
- `app/(platform)/loading.tsx` — loading state específico da plataforma

Exemplo de `app/error.tsx`:

```typescript
'use client'
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Algo deu errado</h2>
        <p className="text-muted-foreground">{error.message}</p>
        <button onClick={reset}>Tentar novamente</button>
      </div>
    </div>
  )
}
```

**Arquivos:** `app/error.tsx`, `app/loading.tsx`, `app/(platform)/error.tsx`, `app/(platform)/loading.tsx`
**Estimativa:** 2h

---

### □ 4.10 Adicionar prefetch={false} em links da sidebar

**Problema:** Todos os 12 links da sidebar são prefetchados ao carregar o dashboard, aumentando o bundle.

**Solução:** Adicionar `prefetch={false}` em links de páginas menos acessadas:

```typescript
<Link href={`/${tenantSlug}/settings`} prefetch={false}>...</Link>
```

Manter prefetch apenas no dashboard e pedidos (páginas principais).

**Arquivo:** `src/frontend/components/platform/Sidebar.tsx`
**Estimativa:** 30min

---

### □ 4.11 Corrigir cascade delete de Order.customer

**Problema:** `Order.customer` tem `onDelete: Cascade`. Deletar um cliente deleta todos os pedidos, o que geralmente não é desejado.

**Solução:** Alterar para `onDelete: SetNull` no schema:

```prisma
customer Customer? @relation(fields: [customerId], references: [id], onDelete: SetNull)
```

**Arquivo:** `src/backend/prisma/schema.prisma`
**Estimativa:** 1h (inclui migration)

---

### □ 4.12 Avaliar remoção de `@serwist/next` e `serwist`

**Problema:** Service worker está desabilitado via `disable: true`, mas as dependências estão instaladas.

**Solução:** Decidir: habilitar o service worker (PWA) ou remover as dependências.

- Se habilitar: remover `disable: true` do `next.config.ts` e configurar o `sw.ts`
- Se remover: `npm uninstall @serwist/next serwist` e remover a configuração do `next.config.ts`

**Arquivos:** `next.config.ts`, `package.json`
**Estimativa:** 1h

---

### □ 4.13 Criar logger estruturado

**Problema:** Logs inconsistentes (console.log, console.warn, console.error) espalhados pelo código.

**Solução:** Criar `src/backend/lib/logger.ts` com níveis (info, warn, error, debug) e formato JSON. Substituir todos os `console.*` por chamadas ao logger.

**Arquivo novo:** `src/backend/lib/logger.ts`
**Arquivos afetados:** Múltiplos
**Estimativa:** 3h

---

### □ 4.14 Adicionar validação de input com enums do Prisma

**Problema:** `CreateOrderInput` usa `string` para `channel` e `type` em vez dos enums `OrderChannel` e `OrderType`.

**Solução:** Usar `z.nativeEnum()` nos schemas Zod:

```typescript
import { OrderChannel, OrderType } from '@prisma/client'

export const createOrderSchema = z.object({
  channel: z.nativeEnum(OrderChannel),
  type: z.nativeEnum(OrderType),
  // ...
})
```

**Arquivo:** `src/backend/lib/validations/order.ts`
**Estimativa:** 1h

---

## RESUMO DO PROGRESSO

| Prioridade | Total | Concluído | Pendente |
|---|---|---|---|
| P1 — Crítico | 6 | 0 | 6 |
| P2 — Segurança/Performance | 6 | 0 | 6 |
| P3 — Limpeza | 6 | 0 | 6 |
| P4 — Longo Prazo | 14 | 0 | 14 |
| **Total** | **32** | **0** | **32** |
