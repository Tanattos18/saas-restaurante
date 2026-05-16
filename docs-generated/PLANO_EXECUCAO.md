# PLANO DE EXECUÇÃO — Checklist SaaS Restaurante

> Siga esta ordem rigorosamente. Cada passo depende do anterior.
> Marque `[x]` ao concluir cada etapa.

---

## FASE 0 — PREPARAÇÃO

### □ 0.1 Verificar o backup

```powershell
# Confirmar que o zip existe e está íntegro
Test-Path "_backup\backup-completo-16-05-2026.zip"
# Listar conteúdo para verificar
tar -tf "_backup\backup-completo-16-05-2026.zip" | Select-Object -First 10
```

### □ 0.2 Criar branch de trabalho

```powershell
git checkout -b fix/otimizacao-geral
```

### □ 0.3 Rodar build atual para registrar estado atual

```powershell
npm run build 2>&1 | Select-String "error|Error|fail|Fail"
```

> Guarde a saída para comparar depois.

---

## FASE 1 — CRÍTICO (Fazer primeiro, na ordem)

### Passo 1.1 — Corrigir symlink do diretório app/

**Importante:** Este passo é PRÉ-REQUISITO para todos os outros. Sem ele, qualquer edição pode ir para o diretório errado.

**Decisão:** Manter `src/frontend/app/` como fonte da verdade.

```powershell
# 1. Remover o diretório app/ atual
Remove-Item -Recurse -LiteralPath "app" -Force

# 2. Criar symlink
New-Item -ItemType SymbolicLink -Path "app" -Target "src/frontend/app"

# 3. Verificar
Get-Item "app" | Select-Object Name, LinkType, Target
# Deve mostrar: LinkType = SymbolicLink, Target = src/frontend/app

# 4. Verificar se o Next.js reconhece
npm run dev  # Deve funcionar sem erros
```

**Rollback se falhar:**
```powershell
Remove-Item -LiteralPath "app" -Force
Copy-Item -Recurse "src/frontend/app" -Destination "app"
```

---

### Passo 1.2 — Resolver divergência de cores no layout.tsx

**Arquivo:** `src/frontend/app/layout.tsx` (única fonte da verdade após o symlink)

```powershell
# Verificar o tema atual no layout (único arquivo que divergiu)
Select-String "theme-color" "app/layout.tsx"
```

**O que fazer:** Abrir `app/layout.tsx` e DECIDIR um tema único (recomendado: manter o roxo `#7c3aed` do `src/frontend/app/` que parece ser o tema oficial).

Se quiser o roxo (recomendado), o arquivo já está correto. Se quiser o verde, alterar:
- `theme-color`: `#059669`
- Cores do tailwind config: `#f8fafc`, `#0f172a`, etc.

---

### Passo 1.3 — Remover fallback de JWT secrets

**Arquivo:** `src/backend/lib/jwt.ts`

**O que fazer:** Localizar a função `getAccessSecret()` e `getRefreshSecret()`. Remover o fallback `?? 'fallback-access-secret-development-only'`. Substituir por throw puro.

**Código final esperado:**

```typescript
function getAccessSecret(): Uint8Array {
  const secret = process.env.JWT_ACCESS_SECRET
  if (!secret) throw new Error('JWT_ACCESS_SECRET não configurada')
  return new TextEncoder().encode(secret)
}

function getRefreshSecret(): Uint8Array {
  const secret = process.env.JWT_REFRESH_SECRET
  if (!secret) throw new Error('JWT_REFRESH_SECRET não configurada')
  return new TextEncoder().encode(secret)
}
```

---

### Passo 1.4 — Separar verifyToken em access e refresh

**Arquivo:** `src/backend/lib/jwt.ts`

**O que fazer:** Substituir a função `verifyToken` única por duas funções:

```typescript
export async function verifyAccessToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getAccessSecret())
    return payload as JwtPayload
  } catch {
    return null
  }
}

export async function verifyRefreshToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getRefreshSecret())
    return payload as JwtPayload
  } catch {
    return null
  }
}
```

**Impacto:** Atualizar importações em:
- `src/backend/middleware.ts` — trocar `verifyToken` por `verifyAccessToken`
- `src/frontend/app/api/auth/refresh/route.ts` — trocar por `verifyRefreshToken`
- `src/frontend/app/api/auth/login/route.ts` — trocar por `verifyAccessToken` (se usado)
- `src/backend/lib/auth.ts` — atualizar `getAuthContext` se usar `verifyToken`

**Verificar usos:**
```powershell
Select-String -Path "src/backend" -Pattern "verifyToken"
Select-String -Path "src/frontend" -Pattern "verifyToken"
```

---

### Passo 1.5 — Corrigir race condition e N+1 no order.service.ts

**Arquivo:** `src/backend/services/order.service.ts`

**O que fazer (2 correções no mesmo arquivo):**

**Correção A — N+1:** Substituir o loop de `findUnique` por `findMany` em lote:

```typescript
// ANTES (N+1):
for (const item of input.items) {
  const product = await prisma.product.findUnique({ where: { id: item.productId } })
  // ...
}

// DEPOIS (2 queries no total):
const productIds = input.items.map(i => i.productId)
const products = await prisma.product.findMany({
  where: { id: { in: productIds }, tenantId }
})
const productMap = new Map(products.map(p => [p.id, p]))
```

**Correção B — Race condition:** Mover o `create` para DENTRO da transação:

```typescript
// ANTES:
const orderNumber = await prisma.$transaction(async (tx) => {
  const lastOrder = await tx.order.findFirst({ ... })
  return (lastOrder?.orderNumber ?? 0) + 1
})
const created = await db.order.create({ data: { orderNumber, ... } })

// DEPOIS:
const created = await prisma.$transaction(async (tx) => {
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

**Testar:**
```powershell
npm run build  # Verificar se compila
```

---

### Passo 1.6 — Completar tenant-prisma.ts

**Arquivo:** `src/backend/lib/tenant-prisma.ts`

**O que fazer:** Adicionar os métodos faltantes ao `$extends`. Seguir o mesmo padrão dos existentes.

**Métodos a adicionar (um por vez, testando cada):**

```
1. findUnique      → where.tenantId = tenantId
2. update          → where.tenantId = tenantId  
3. delete          → where.tenantId = tenantId
4. upsert          → where.tenantId = tenantId (update) + tenantId no create
5. findFirstOrThrow → where.tenantId = tenantId
6. findUniqueOrThrow → where.tenantId = tenantId
7. createMany      → injetar tenantId em cada item do array data
```

**Padrão para cada método:**

```typescript
async findUnique({ args, query }) {
  if (args.where?.id) {
    args.where = { ...args.where, tenantId }
  }
  return query(args)
},
```

**Testar após cada método:**
```powershell
npm run build  # Não deve quebrar nada se seguiu o padrão
```

---

## FASE 2 — SEGURANÇA E PERFORMANCE

### Passo 2.1 — Remover Tailwind CDN

**Arquivo:** `app/layout.tsx`

**O que fazer:** Remover a linha:
```html
<script src="https://cdn.tailwindcss.com" />
```

**Verificar:**
```powershell
Select-String "cdn.tailwindcss" "app/layout.tsx"
# Não deve encontrar nada
```

---

### Passo 2.2 — Consolidar CSS

**Arquivo:** `app/layout.tsx` e `app/globals.css`

**O que fazer:**
1. Mover TODOS os `@keyframes` do `<style>` inline para o `globals.css`
2. Remover o bloco `<style dangerouslySetInnerHTML={{ __html: ... }}>` inteiro do layout

**Verificar se as animações ainda funcionam** rodando o app e navegando.

---

### Passo 2.3 — Adicionar AbortController nos useEffects

**Arquivo:** `src/frontend/components/platform/HeaderWrapper.tsx`

**O que fazer:**

```typescript
useEffect(() => {
  const ac = new AbortController()
  
  Promise.all([
    fetch('/api/tenant/me', { signal: ac.signal }).then(r => r.json()),
    fetch('/api/auth/me', { signal: ac.signal }).then(r => r.json()),
  ])
    .then(([tenantData, userData]) => {
      setTenantName(tenantData?.name ?? '')
      setUserName(userData?.name ?? '')
      setLoading(false)
    })
    .catch((err) => {
      if (err.name !== 'AbortError') {
        console.error('Erro ao carregar dados do usuário:', err)
        setLoading(false)
      }
    })

  return () => ac.abort()
}, [])
```

**Verificar em toda a codebase** outros `useEffect` com fetch que precisam da mesma correção:
```powershell
Select-String -Path "src/frontend" -Pattern "useEffect.*fetch|fetch.*useEffect"
```

---

### Passo 2.4 — Corrigir pg-notify

**Arquivo:** `src/backend/lib/pg-notify.ts`

**O que fazer:** Substituir o escape manual por uma função mais robusta:

```typescript
function escapeLiteral(str: string): string {
  return "'" + str.replace(/\\/g, '\\\\').replace(/'/g, "''").replace(/\n/g, '\\n') + "'"
}

function escapeIdentifier(str: string): string {
  return '"' + str.replace(/"/g, '""') + '"'
}

// Uso:
await c.query(`NOTIFY ${escapeIdentifier(channel)}, ${escapeLiteral(payload)}`)
```

**Testar:**
```powershell
npm run build
```

---

### Passo 2.5 — Remover 'use client' desnecessário

**Arquivos:**
- `src/frontend/components/ui/Badge.tsx`
- `src/frontend/components/ui/Card.tsx`
- `src/frontend/components/ui/Button.tsx`
- `src/frontend/components/ui/Input.tsx`
- `src/frontend/components/ui/Textarea.tsx`

**O que fazer:** Em cada arquivo, remover a primeira linha `'use client'`.

**Verificar:** Rodar `npm run build` e ver se algum componente pai reclama.

**Rollback se necessário:** Se um componente pai usar hooks (onClick, useState) neste componente, adicionar `'use client'` de volta.

---

### Passo 2.6 — Substituir document.write() no QR Code

**Arquivo:** `src/frontend/app/(platform)/[tenantSlug]/qr-code/page.tsx`

**O que fazer:** Localizar o `win.document.write()` e substituir por:

```typescript
const win = window.open('', '_blank')
if (win) {
  win.document.body.innerHTML = htmlContent
  win.document.close()
  win.print()
}
```

---

## FASE 3 — LIMPEZA

### Passo 3.1 — Limpar _backup/

**O que fazer:** Manter só o backup mais recente + 2 anteriores:

```powershell
Get-ChildItem -LiteralPath "_backup" -Directory | Sort-Object LastWriteTime -Descending | Select-Object -Skip 3 | ForEach-Object {
  Remove-Item -Recurse -LiteralPath $_.FullName -Force -WhatIf
}
# Rodar sem -WhatIf depois de confirmar
```

**Ou:** Manter só o zip que acabamos de criar e deletar todo o resto:

```powershell
Get-ChildItem -LiteralPath "_backup" -Directory | Remove-Item -Recurse -Force
```

---

### Passo 3.2 — Remover configs duplicadas

```powershell
Remove-Item -LiteralPath "config/next.config.ts" -Force
Remove-Item -LiteralPath "config/postcss.config.js" -Force
```

---

### Passo 3.3 — Limpar APIs vazias

**Decidir:** Implementar ou remover cada endpoint vazio.

**Para remover (se não forem usar agora):**

```powershell
$emptyApis = @(
  "app/api/chat/send",
  "app/api/chat/sessions",
  "app/api/health",
  "app/api/kds/stream",
  "app/api/payment/pix/create",
  "app/api/payment/stripe/create-checkout",
  "app/api/payment/stripe/portal",
  "app/api/webhooks/stripe",
  "app/api/webhooks/whatsapp",
  "app/api/qr-code/tables"
)

foreach ($api in $emptyApis) {
  $path = "$api"
  if (Test-Path $path) {
    # Verificar se só tem .gitkeep
    $files = Get-ChildItem -LiteralPath $path -File
    if ($files.Count -eq 1 -and $files[0].Name -eq ".gitkeep") {
      Remove-Item -Recurse -LiteralPath $path -Force
      Write-Host "Removido: $path"
    }
  }
}
```

**Verificar também em src/frontend/app/api/ (mas com o symlink, será automático)**

---

### Passo 3.4 — Remover dependências não utilizadas

```powershell
npm uninstall @upstash/ratelimit @upstash/redis ts-node tailwindcss-animate
npm install  # Para atualizar package-lock.json
```

**Confirmar que nenhum import quebrou:**
```powershell
Select-String -Path "src" -Pattern "@upstash|ts-node|tailwindcss-animate"
# Não deve encontrar nada
```

---

### Passo 3.5 — Corrigir encoding da sidebar

**Arquivo:** `src/frontend/components/platform/Sidebar.tsx`

**O que fazer:** Abrir o arquivo e substituir:
- `Card�pio` → `Cardápio`
- `Configura��es` → `Configurações`

**Verificar encoding:**
```powershell
# Confirmar que o arquivo está em UTF-8
$bytes = [System.IO.File]::ReadAllBytes("src/frontend/components/platform/Sidebar.tsx")
$encoding = [System.Text.Encoding]::UTF8.GetString($bytes)
$encoding -match "Cardápio"  # Deve retornar True
```

---

### Passo 3.6 — Remover console.* de produção (ou criar logger)

**Opção A — Rápida:** Envolver em check de ambiente:

```typescript
if (process.env.NODE_ENV !== 'production') {
  console.warn('...')
}
```

**Opção B — Correta:** Criar logger estruturado (ver Passo 4.13).

**Arquivos para verificar:**
```powershell
Select-String -Path "src/backend/lib" -Pattern "console\.(warn|error|log)"
```

---

## FASE 4 — MELHORIAS DE LONGO PRAZO (Fazer depois das fases 1-3)

### Passo 4.1 — Atualizar Zod para v4

```powershell
npm install zod@latest
npm run build  # Verificar breaking changes
```

**Ajustar schemas se necessário:**
- `src/backend/lib/validations/auth.schema.ts`
- `src/backend/lib/validations/order.ts`
- `src/backend/lib/validations/product.schema.ts`

---

### Passo 4.2 — Adicionar indexes no Prisma

**Arquivo:** `src/backend/prisma/schema.prisma`

Adicionar nos modelos:

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

**Gerar migration:**
```powershell
npx prisma migrate dev --name add_indexes
```

---

### Passo 4.3 — Criar tabela KitchenDeviceOrder

**Arquivo:** `src/backend/prisma/schema.prisma`

1. Adicionar novo modelo:
```prisma
model KitchenDeviceOrder {
  id        String   @id @default(cuid())
  deviceId  String
  orderId   String
  addedAt   DateTime @default(now())
  device    KitchenDevice @relation(fields: [deviceId], references: [id], onDelete: Cascade)
  order     Order         @relation(fields: [orderId], references: [id], onDelete: Cascade)
  @@index([deviceId])
  @@index([orderId])
}
```

2. Remover `currentOrderIds String[]` do `KitchenDevice`

3. Atualizar `kds.service.ts` para usar a nova relação

4. Rodar migration:
```powershell
npx prisma migrate dev --name create_kitchen_device_order
```

---

### Passo 4.4 — Unique constraints

**Arquivo:** `src/backend/prisma/schema.prisma`

```prisma
model Product {
  @@unique([tenantId, name])
}

model Category {
  @@unique([tenantId, name])
}
```

```powershell
npx prisma migrate dev --name add_unique_constraints
```

---

### Passo 4.5 — Implementar endpoints pendentes

Prioridade sugerida:
1. `health` — mais simples, útil para monitoramento
2. `webhooks/stripe` — necessário para pagamentos
3. `payment/stripe/create-checkout` — necessário para assinaturas
4. `payment/pix/create` — se for usar PIX
5. `webhooks/whatsapp` — necessário para WhatsApp
6. `chat/send` e `chat/sessions` — integração WhatsApp
7. `kds/stream` — tempo real no KDS
8. `qr-code/tables` — gerenciamento de mesas

---

### Passo 4.6 — Refatorar casts `as any` e `as never`

**Buscar ocorrências:**
```powershell
Select-String -Path "src" -Pattern "as any|as never"
```

**Corrigir cada uma**, substituindo pelo tipo correto (usar `Prisma.OrderStatus` em vez de `as never`, etc.)

---

### Passo 4.7 — Usar env vars para JWT expiration

**Arquivo:** `src/backend/lib/jwt.ts`

```typescript
const accessExpiresIn = process.env.JWT_ACCESS_EXPIRES_IN || '15m'
const refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || '7d'
```

Substituir os valores hardcoded `'15m'` e `'7d'`.

---

### Passo 4.8 — Extrair dados hardcoded da sidebar

**Arquivo:** `src/frontend/components/platform/Sidebar.tsx`

**Props a adicionar:**
```typescript
interface SidebarProps {
  tenantSlug: string
  tenantName: string
  planName: string
  pendingOrdersCount?: number
}
```

**No PlatformLayout, passar os dados reais:**

```typescript
<Sidebar 
  tenantSlug={auth.tenantSlug}
  tenantName={tenant?.name ?? 'Restaurante'}
  planName={tenant?.plan ?? 'Plano PRO'}
  pendingOrdersCount={pendingCount}
/>
```

---

### Passo 4.9 — Error boundaries e loading states

**Criar arquivos:**

1. `app/error.tsx`:
```typescript
'use client'
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold text-red-600">Algo deu errado</h2>
        <p className="text-muted-foreground">{error.message}</p>
        <button onClick={reset} className="px-4 py-2 bg-primary text-white rounded">
          Tentar novamente
        </button>
      </div>
    </div>
  )
}
```

2. `app/loading.tsx`:
```typescript
export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
    </div>
  )
}
```

3. `app/(platform)/error.tsx` — similar, mas com layout da plataforma
4. `app/(platform)/loading.tsx` — similar, mas com layout da plataforma

---

### Passo 4.10 — prefetch={false} na sidebar

**Arquivo:** `src/frontend/components/platform/Sidebar.tsx`

Adicionar `prefetch={false}` nos links menos importantes:
- `settings`, `team`, `financial`, `inventory`, `whatsapp-config`

Manter prefetch padrão nos principais:
- `dashboard`, `menu`, `orders`, `kds`

---

### Passo 4.11 — Corrigir cascade delete

**Arquivo:** `src/backend/prisma/schema.prisma`

```prisma
customer Customer? @relation(fields: [customerId], references: [id], onDelete: SetNull)
```

```powershell
npx prisma migrate dev --name fix_customer_cascade
```

---

### Passo 4.12 — Avaliar serwist/service worker

**Decisão:** Manter ou remover?

- Se for usar PWA: remover `disable: true` do `next.config.ts`
- Se não for usar: `npm uninstall @serwist/next serwist` e remover config

---

### Passo 4.13 — Criar logger estruturado

**Arquivo novo:** `src/backend/lib/logger.ts`

```typescript
type LogLevel = 'info' | 'warn' | 'error' | 'debug'

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  context?: unknown
  error?: string
}

function log(level: LogLevel, message: string, context?: unknown, error?: unknown) {
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    context: context ?? undefined,
    error: error instanceof Error ? error.message : (error as string) ?? undefined,
  }
  
  if (process.env.NODE_ENV === 'production') {
    // Em produção, log estruturado para aggregators (Datadog, Grafana, etc.)
    console.log(JSON.stringify(entry))
  } else {
    const prefix = `[${entry.timestamp}] [${level.toUpperCase()}]`
    const details = [entry.context, entry.error].filter(Boolean).join(' | ')
    console[level](`${prefix} ${entry.message}${details ? ` — ${details}` : ''}`)
  }
}

export const logger = {
  info: (message: string, context?: unknown) => log('info', message, context),
  warn: (message: string, context?: unknown) => log('warn', message, context),
  error: (message: string, error?: unknown) => log('error', message, undefined, error),
  debug: (message: string, context?: unknown) => log('debug', message, context),
}
```

**Substituir todos os `console.*`** nos arquivos de `src/backend/lib/` e `src/backend/services/`.

---

### Passo 4.14 — Validação com enums do Prisma

**Arquivo:** `src/backend/lib/validations/order.ts`

```typescript
import { OrderChannel, OrderType } from '@prisma/client'
import { z } from 'zod'

export const createOrderSchema = z.object({
  channel: z.nativeEnum(OrderChannel),
  type: z.nativeEnum(OrderType),
  customerId: z.string().optional(),
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().min(1),
    notes: z.string().optional(),
  })).min(1),
  // ...
})
```

Aplicar o schema no `order.service.ts`.

---

## FASE 5 — VALIDAÇÃO FINAL

### Passo 5.1 — Build

```powershell
npm run build
```

**Critério de aceite:** Build passa sem errors e sem warnings.

### Passo 5.2 — Lint

```powershell
npm run lint
```

**Critério de aceite:** Sem erros de lint.

### Passo 5.3 — Testes

```powershell
npm test
```

**Critério de aceite:** Testes existentes continuam passando.

### Passo 5.4 — Commit

```powershell
git add -A
git commit -m "fix: correções críticas de segurança, performance e arquitetura"
```

---

## ORDEM DE EXECUÇÃO (Resumo)

```
FASE 0: Preparação
  ├── 0.1 Verificar backup ✓ (já feito)
  ├── 0.2 Criar branch
  └── 0.3 Rodar build atual

FASE 1: Crítico (dependência: 0)
  ├── 1.1 Symlink app/ ← PRIMEIRO
  ├── 1.2 Resolver layout.tsx divergente
  ├── 1.3 JWT fallback
  ├── 1.4 Separar verifyToken
  ├── 1.5 Order service (race + N+1) — mesmo arquivo
  └── 1.6 tenant-prisma.ts completo

FASE 2: Segurança e Performance (dependência: 1)
  ├── 2.1 Remover Tailwind CDN
  ├── 2.2 Consolidar CSS
  ├── 2.3 AbortController
  ├── 2.4 pg-notify
  ├── 2.5 'use client'
  └── 2.6 QR code document.write

FASE 3: Limpeza (dependência: 1)
  ├── 3.1 Limpar _backup/
  ├── 3.2 Configs duplicadas
  ├── 3.3 APIs vazias
  ├── 3.4 Dependências não usadas
  ├── 3.5 Encoding sidebar
  └── 3.6 console.* em produção

FASE 4: Longo Prazo (dependência: 1,2,3 — pode fazer em qualquer ordem)
  ├── 4.1 Zod v4
  ├── 4.2 Indexes
  ├── 4.3 KitchenDeviceOrder
  ├── 4.4 Unique constraints
  ├── 4.5 Endpoints pendentes
  ├── 4.6 Refatorar casts
  ├── 4.7 JWT env vars
  ├── 4.8 Sidebar props
  ├── 4.9 Error boundaries
  ├── 4.10 prefetch={false}
  ├── 4.11 Cascade delete
  ├── 4.12 Serwist
  ├── 4.13 Logger
  └── 4.14 Validação com enums

FASE 5: Validação Final
  ├── 5.1 Build
  ├── 5.2 Lint
  ├── 5.3 Testes
  └── 5.4 Commit
```

---

## REGRAS GERAIS

1. **Commite após cada fase** (não após cada passo). Se algo quebrar, fica fácil reverter.
2. **Teste o build depois de cada passo da Fase 1** (são críticos).
3. **Nunca edite os dois `app/`** — com o symlink, editar `app/` já edita `src/frontend/app/`.
4. **Se um passo quebrar:** `git checkout .` para voltar ao último commit e tentar de novo.
5. **Não pule passos.** A ordem existe porque cada passo pode afetar o próximo.
6. **Mantenha o backup zipado seguro.** Só delete os snapshots de `_backup/` depois que todas as fases estiverem concluídas e validadas.
