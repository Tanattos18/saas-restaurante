# ANÁLISE COMPLETA DO PROJETO — SaaS Restaurante

> **Data:** 16/05/2026
> **Escopo:** Análise estrutural, código-fonte, dependências, segurança, performance e boas práticas.

---

## SUMÁRIO

1. [RESUMO EXECUTIVO](#1-resumo-executivo)
2. [PROBLEMAS CRÍTICOS](#2-problemas-críticos)
3. [PROBLEMAS DE SEGURANÇA](#3-problemas-de-segurança)
4. [PROBLEMAS DE ARQUITETURA](#4-problemas-de-arquitetura)
5. [PROBLEMAS DE PERFORMANCE](#5-problemas-de-performance)
6. [PROBLEMAS DE CÓDIGO](#6-problemas-de-código)
7. [ARQUIVOS DUPLICADOS E REDUNDÂNCIA](#7-arquivos-duplicados-e-redundância)
8. [DEPENDÊNCIAS](#8-dependências)
9. [BANCO DE DADOS (PRISMA)](#9-banco-de-dados-prisma)
10. [MULTI-TENANCY](#10-multi-tenancy)
11. [PLANO DE AÇÃO PRIORIZADO](#11-plano-de-ação-priorizado)
12. [ESTIMATIVA DE ESFORÇO](#12-estimativa-de-esforço)

---

## 1. RESUMO EXECUTIVO

O projeto **saas-restaurante** é uma aplicação Next.js 15 + React 19 multi-tenant para gestão de restaurantes com módulos de cardápio digital, KDS (Kitchen Display System), pedidos via WhatsApp, CRM, fidelidade e assinaturas (Stripe).

### Métricas Gerais

| Métrica | Valor |
|---|---|
| Arquivos fonte (excluindo node_modules, .next, .git) | ~250-300 |
| Arquivos TypeScript/TSX | ~170 |
| Componentes React | ~40+ |
| Rotas de API | ~40 |
| Snapshots de backup (_backup/) | ~20+ diretórios |
| Arquivos CSS | ~5 |
| Diretórios vazios (só .gitkeep) | ~15 |

### Pontos Fortes

- Arquitetura multi-tenant bem planejada com `tenant-prisma.ts`
- Migrations do Prisma organizadas
- Separação clara entre backend (services) e frontend (components)
- Uso correto do padrão singleton para Prisma Client
- Estrutura de pastas bem definida

### Pontos Críticos

1. **Diretórios `app/` duplicados** — `app/` e `src/frontend/app/` são cópias independentes (deveriam ser symlink). `layout.tsx` já divergiu entre eles.
2. **Secrets JWT com fallback hardcoded** — Em desenvolvimento, usa `'fallback-access-secret-development-only'` se a env var não existir.
3. **Race condition na geração de orderNumber** — `create` do pedido está fora da transação que gera o número.
4. **N+1 queries na criação de pedidos** — Para cada item, uma consulta separada ao banco.
5. **Tailwind CDN em produção** — Carregando Tailwind via CDN mesmo com PostCSS já configurado.
6. **Multi-tenancy incompleto** — `findUnique`, `update`, `delete`, `upsert` não têm filtro de tenantId.

---

## 2. PROBLEMAS CRÍTICOS

### 2.1. Diretórios `app/` Duplicados (CRÍTICO)

**Arquivos:** `app/` (raiz) e `src/frontend/app/`

O `README.md` linha 143 afirma que `app/` é um **symlink** para `src/frontend/app/`. **Isso é falso** — `app/` é um diretório real e independente.

**87 arquivos existem em ambos os diretórios**, sendo que:
- **82 são idênticos** byte-a-byte (incluindo `globals.css` e `page.tsx`)
- **1 tem diferença de conteúdo real**: `layout.tsx`
  - `app/layout.tsx`: usa tema **verde** (`#059669`, `#f8fafc`, `#0f172a`)
  - `src/frontend/app/layout.tsx`: usa tema **roxo** (`#7c3aed`, `#faf5ff`, `#1e1b4b`)
- **4 têm diferenças de line-ending ou newline** (CRLF vs LF)

**Impacto:** O Next.js lê da raiz `app/`. Qualquer edição em `src/frontend/app/` é ignorada. As cores já divergiram — uma futura edição em um diretório sem o outro causará bugs.

**Solução:** Decidir qual diretório é a fonte da verdade e criar o symlink:
```powershell
# Se src/frontend/app/ for a fonte:
Remove-Item -Recurse -LiteralPath "app"
New-Item -ItemType SymbolicLink -Path "app" -Target "src/frontend/app"
```

---

### 2.2. Race Condition na Criação de Pedidos (CRÍTICO)

**Arquivo:** `src/backend/services/order.service.ts`

```typescript
// A transação APENAS lê o lastOrderNumber
const orderNumber = await prisma.$transaction(async (tx) => {
  const lastOrder = await tx.order.findFirst({
    where: { tenantId },
    orderBy: { orderNumber: 'desc' },
    select: { orderNumber: true },
  })
  return (lastOrder?.orderNumber ?? 0) + 1
})

// O create é feito FORA da transação!!!
const created = await db.order.create({
  data: { orderNumber, ... }
})
```

**Problema:** Entre o fim da transação e o `create`, outra requisição pode obter o mesmo `orderNumber`, causando **violação de unique constraint** ou **ordens com mesmo número**.

**Solução:** Mover o `create` para dentro da transação.

---

### 2.3. N+1 Queries em Order Service (CRÍTICO)

**Arquivo:** `src/backend/services/order.service.ts`

```typescript
for (const item of input.items) {
  const product = await prisma.product.findUnique({ where: { id: item.productId } })
  // ...
}
```

**Problema:** Para cada item no pedido, uma query separada. Se o pedido tem 20 itens, são 21+ queries.

**Solução:** Usar `findMany` com `Promise.all` ou batch:
```typescript
const productIds = input.items.map(i => i.productId)
const products = await prisma.product.findMany({
  where: { id: { in: productIds } }
})
const productMap = new Map(products.map(p => [p.id, p]))
```

---

### 2.4. Multi-Tenancy Incompleto no tenant-prisma.ts (CRÍTICO)

**Arquivo:** `src/backend/lib/tenant-prisma.ts`

Métodos **NÃO sobrescritos** na extensão do Prisma:

| Método | Risco |
|---|---|
| `findUnique` | Pode retornar registro de outro tenant |
| `update` | Pode atualizar registro de outro tenant |
| `delete` | Pode deletar registro de outro tenant |
| `upsert` | Pode criar/atualizar fora do tenant |
| `findFirstOrThrow` | Pode retornar registro de outro tenant |
| `findUniqueOrThrow` | Pode retornar registro de outro tenant |
| `createMany` | Não injeta tenantId nos registros |

**Apenas** `findMany`, `count`, `updateMany` e `deleteMany` foram sobrescritos.

**Solução:** Adicionar todos os métodos faltantes ao `$extends`.

---

## 3. PROBLEMAS DE SEGURANÇA

### 3.1. Fallback de JWT Secrets Hardcoded (ALTO)

**Arquivo:** `src/backend/lib/jwt.ts`

```typescript
const secret = process.env.JWT_ACCESS_SECRET
if (!secret) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error(...)
  }
  console.warn('...')
}
return new TextEncoder().encode(secret ?? 'fallback-access-secret-development-only')
```

**Problema:** Se `NODE_ENV` não estiver definida (ou estiver como `'development'`), a string previsível `'fallback-access-secret-development-only'` é usada como chave JWT. Qualquer um que conheça essa string pode forjar tokens JWT válidos.

**Solução:** Sempre lançar erro se a secret não estiver definida, independente do ambiente:
```typescript
if (!secret) throw new Error('JWT_ACCESS_SECRET não configurada')
```

### 3.2. Refresh Token Usado como Access Token (MÉDIO)

**Arquivo:** `src/backend/lib/jwt.ts` — `verifyToken()`

```typescript
try {
  const { payload } = await jwtVerify(token, getAccessSecret())
  return payload as JwtPayload
} catch {
  try {
    const { payload } = await jwtVerify(token, getRefreshSecret()) // ← AQUI
    return payload as JwtPayload
  } catch {
    return null
  }
}
```

**Problema:** Se a verificação com `accessSecret` falhar, tenta com `refreshSecret`. Isso significa que refresh tokens (que expiram em **7 dias**) podem ser usados como access tokens em qualquer rota que use `verifyToken`.

**Solução:** `verifyToken` deve aceitar um parâmetro opcional `type: 'access' | 'refresh'` e usar a secret correspondente.

### 3.3. Injeção SQL Potencial em pg-notify.ts (MÉDIO)

**Arquivo:** `src/backend/lib/pg-notify.ts`

```typescript
const escaped = payload.replace(/'/g, "''")
await c.query(`NOTIFY "${channel}", '${escaped}'`)
```

**Problema:** A string só escapa aspas simples. Caracteres como `\`, `\n`, ou outros especiais do PostgreSQL não são escapados. O nome do canal também é interpolado diretamente.

**Solução:** Usar `pg-format` ou parâmetros nomeados.

### 3.4. document.write() no QR Code (MÉDIO)

**Arquivo:** `src/frontend/app/(platform)/[tenantSlug]/qr-code/page.tsx`

```typescript
win.document.write(html)
```

**Problema:** `document.write()` é deprecated e inseguro. Se o HTML contiver conteúdo controlado pelo usuário, abre brecha para XSS.

**Solução:** Usar `window.open()` + `win.document.body.innerHTML` ou biblioteca de impressão adequada.

### 3.5. console.warn/error Expõe Informações em Produção (BAIXO)

`console.warn` e `console.error` em `jwt.ts`, `whatsapp.ts`, `pg-notify.ts` podem vazar informações internas em logs de produção.

---

## 4. PROBLEMAS DE ARQUITETURA

### 4.1. Config do Next.js Duplicada

- `next.config.ts` (raiz) — **ativa**, usada pelo Next.js
- `config/next.config.ts` — **morta**, nunca lida

As configurações são diferentes:
- Raiz: `withSerwistInit({ disable: true })`, `outputFileTracingRoot`
- `config/`: sem essas opções

**Solução:** Remover `config/next.config.ts` se não for usada.

### 4.2. Service Worker Desabilitado mas Dependência Instalada

**Arquivo:** `next.config.ts`

```typescript
withSerwistInit({ disable: true })
```

`@serwist/next` e `serwist` estão no `package.json` e no `node_modules`, mas o service worker está desabilitado. Isso adiciona peso desnecessário ao build.

**Solução:** Remover `@serwist/next` e `serwist` do `package.json` se o PWA não for usado, ou habilitar o service worker.

### 4.3. middleware.ts com Re-export Desnecessário

**Arquivo:** `middleware.ts` (raiz)

```typescript
export { middleware } from '@/backend/middleware'
```

Funciona, mas adiciona um nível de indireção sem benefício claro. O Next.js poderia ler diretamente de `src/backend/middleware.ts`.

### 4.4. PostCSS Config Duplicada

- `postcss.config.mjs` (raiz, ESM)
- `config/postcss.config.js` (CommonJS)

Ambos carregam `@tailwindcss/postcss`. O Next.js usa apenas o da raiz.

**Solução:** Remover `config/postcss.config.js`.

### 4.5. Diretórios de API Vazios

Vários endpoints de API têm apenas `.gitkeep` sem `route.ts`:

```
app/api/chat/send/.gitkeep
app/api/chat/sessions/.gitkeep
app/api/health/.gitkeep
app/api/kds/stream/.gitkeep
app/api/payment/pix/create/.gitkeep
app/api/payment/stripe/create-checkout/.gitkeep
app/api/payment/stripe/portal/.gitkeep
app/api/webhooks/stripe/.gitkeep
app/api/webhooks/whatsapp/.gitkeep
app/api/qr-code/tables/.gitkeep
```

**Solução:** Implementar os endpoints ou remover os diretórios.

---

## 5. PROBLEMAS DE PERFORMANCE

### 5.1. Tailwind CDN em Produção (ALTO)

**Arquivo:** `app/layout.tsx` (ambas as cópias)

```jsx
<script src="https://cdn.tailwindcss.com" />
```

**Impacto:**
- Gera **todas** as classes Tailwind client-side (centenas de KB)
- Atraso na renderização inicial (bloqueia o primeiro paint)
- Redundante: o PostCSS já compila apenas as classes usadas no CSS final

**Solução:** Remover o script CDN. Usar apenas `@import "tailwindcss"` no `globals.css`.

### 5.2. CSS Duplicado em Múltiplos Lugares (MÉDIO)

As mesmas variáveis CSS e animações `@keyframes` estão definidas em **3 lugares**:
1. `app/globals.css` — `:root`, `.dark`, `@theme inline`
2. `app/layout.tsx` — `<style dangerouslySetInnerHTML>`
3. `src/frontend/app/layout.tsx` — `<style dangerouslySetInnerHTML>`

**Solução:** Consolidar tudo em `globals.css` e remover os `<style>` inline.

### 5.3. Prefetch Excessivo na Sidebar (BAIXO)

**Arquivo:** `src/frontend/components/platform/Sidebar.tsx`

A sidebar tem 12 links `<Link>`. O Next.js prefetcha **todos** por padrão, baixando dados de 12 páginas ao carregar o dashboard.

**Solução:** Adicionar `prefetch={false}` em links de páginas menos visitadas (configurações, equipe, financeiro).

### 5.4. useEffect sem AbortController (MÉDIO)

**Arquivo:** `src/frontend/components/platform/HeaderWrapper.tsx`

```typescript
useEffect(() => {
  Promise.all([
    fetch('/api/tenant/me').then((r) => r.json()),
    fetch('/api/auth/me').then((r) => r.json()),
  ]).then(...)
}, [])
```

**Problema:** Se o componente desmontar antes das requisições, `setState` é chamado em componente desmontado (memory leak potencial em React 19+).

**Solução:** Usar `AbortController`:
```typescript
useEffect(() => {
  const ac = new AbortController()
  fetch('/api/tenant/me', { signal: ac.signal }).then(...)
  return () => ac.abort()
}, [])
```

### 5.5. 'use client' Desnecessário em Componentes Presentacionais (BAIXO)

Componentes que **não** usam hooks, eventos, ou browser APIs estão marcados como `'use client'`:

- `src/frontend/components/ui/Badge.tsx`
- `src/frontend/components/ui/Card.tsx`
- `src/frontend/components/ui/Button.tsx`
- `src/frontend/components/ui/Input.tsx`
- `src/frontend/components/ui/Textarea.tsx`

**Impacto:** Esses componentes são forçados a ser renderizados no cliente, aumentando o bundle JS e impedindo a renderização no servidor.

**Solução:** Remover `'use client'` desses componentes.

---

## 6. PROBLEMAS DE CÓDIGO

### 6.1. Casts `as any` e `as never` Generalizados

Encontrados em múltiplos arquivos:

| Arquivo | Linha | Código |
|---|---|---|
| `order.service.ts` | Diversas | `where as never`, `channel as never`, `status as never` |
| `user.service.ts` | 35 | `data.role as any` |
| `user.service.ts` | 45 | `data as any` |
| `dashboard/page.tsx` | 59 | `recentOrders as any` |
| `SalesChart.tsx` | 40 | `{ active, payload, label }: any` |
| `stripe.ts` | `apiVersion: '2025-02-24' as never` |

**Impacto:** Anula a segurança de tipos do TypeScript. Erros que poderiam ser capturados em compilação viram erros em runtime.

### 6.2. Catch Silencioso Generalizado

```typescript
// Em vários arquivos:
catch { setError('Erro de conexão') }
// Ou pior:
.catch(() => {})
```

**Problema:** O erro original é perdido. Mensagens genéricas como `'Erro de conexão'` não ajudam no debugging.

**Solução:** Sempre logar o erro original e propagar informações relevantes.

### 6.3. Encoding Corrompido na Sidebar

**Arquivo:** `src/frontend/components/platform/Sidebar.tsx`

```typescript
{ href: 'menu', label: 'Card�pio', icon: IconMenu },
{ href: 'settings', label: 'Configura��es', icon: IconSettings },
```

**Problema:** Acentuação corrompida. Deveria ser `'Cardápio'` e `'Configurações'`.

**Solução:** Re-salvar o arquivo com encoding UTF-8 sem BOM.

### 6.4. Nomes e Planos Hardcoded na Sidebar

```typescript
<p className="text-xs font-semibold text-foreground">Plano PRO</p>
<p className="text-[11px] text-muted-foreground mt-0.5">Restaurante Teste</p>
```

**Problema:** Nome do restaurante e plano vêm de dados mockados/hardcoded. Deveriam vir do contexto de autenticação ou API.

### 6.5. useEffect sem Lista de Dependências

**Arquivo:** `HeaderWrapper.tsx` — `useEffect(() => {...}, [])` está correto (só executa uma vez), mas o padrão de usar funções dentro do `useEffect` sem `useCallback` pode causar re-renders desnecessários em outros lugares.

### 6.6. Retorno de Erro Sem Informação no WhatsappService

**Arquivo:** `src/backend/services/whatsapp-config.service.ts`

```typescript
catch (e: any) { return { success: false, error: e?.message || 'Erro de conexão' } }
```

**Problema:** Perde o stack trace e informações contextuais do erro.

### 6.7. Order Service não usa Input Validation com Enums

```typescript
channel: input.channel as never,  // string genérica
type: input.type as never,         // string genérica
```

Os campos `channel` e `type` em `CreateOrderInput` são `string` quando deveriam ser `OrderChannel` e `OrderType` dos enums do Prisma.

---

## 7. ARQUIVOS DUPLICADOS E REDUNDÂNCIA

### 7.1. Diretório `_backup/` — ~20+ Snapshots

Contém cópias completas do projeto em vários estados:
- `_backup/1-primeira-parte/`, `_backup/2-parte2/`, `_backup/modulo1/`, ..., `_backup/modulo11/`
- `_backup/som-kds/`, `_backup/pwa/`, `_backup/readme-app/`, `_backup/redesign-visual-completo/`

**Estimativa de tamanho:** 100+ MB a 500+ MB

**Recomendação:** Manter no máximo 2-3 snapshots recentes ou migrar para git tags/branches.

### 7.2. Arquivos Duplicados Fora do app/

| Arquivo | Duplicata | Tamanho |
|---|---|---|
| `postcss.config.mjs` (raiz) | `config/postcss.config.js` | ~100 bytes cada |
| `next.config.ts` (raiz) | `config/next.config.ts` | ~600 bytes cada |
| `public/sw.js` | `src/frontend/public/sw.js` | ~200 KB (gerado) |
| `public/icons/` | `src/frontend/public/icons/` | .gitkeep (vazio) |
| `public/images/` | `src/frontend/public/images/` | .gitkeep (vazio) |
| `public/manifest.json` | `src/frontend/public/manifest.json` | ~500 bytes |

### 7.3. Arquivos .gitkeep Desnecessários

~15 diretórios contêm apenas `.gitkeep`, muitos deles desnecessários (diretórios de API não implementados).

### 7.4. Dependências Potencialmente Não Utilizadas

| Dependência | Motivo |
|---|---|
| `@upstash/ratelimit` | Nenhum import encontrado no código |
| `@upstash/redis` | Nenhum import encontrado no código |
| `ts-node` | Projeto usa `tsx` para executar TypeScript |
| `tailwindcss-animate` | Nenhum uso encontrado (animações são CSS puras) |

---

## 8. DEPENDÊNCIAS

### 8.1. Versões Desatualizadas

| Pacote | Versão Atual | Versão no Projeto | Nota |
|---|---|---|---|
| `zod` | v4.x | ^3.24.0 | Zod v4 é a versão corrente |
| `typescript` | 5.8+ | ^5.7.0 | Minor desatualizado |
| `lucide-react` | Muitas releases | ^0.475.0 | Muito desatualizado |
| `react-hook-form` | Mais recente | ^7.54.0 | Minor desatualizado |
| `electron` (app-desktop) | 35+ | ^33.0.0 | Desatualizado |

### 8.2. Inconsistências

| Pacote | Versão | Problema |
|---|---|---|
| `@dnd-kit/core` | ^6.3.1 | `@dnd-kit/sortable` está em ^10.0.0 — versões muito distantes entre si da mesma lib |

---

## 9. BANCO DE DADOS (PRISMA)

### 9.1. Indexes Faltantes

| Tabela | Coluna | Justificativa |
|---|---|---|
| `ChatMessage` | `customerId` | Usado em joins para buscar sessões |
| `InventoryLog` | `inventoryItemId` | FK sem index |
| `LoyaltyTransaction` | `orderId` | FK sem index |

### 9.2. Missing Cascade Deletes

- `Order.customer`: **Cascade** ao deletar Customer deleta pedidos — deveria ser `SetNull`
- `InventoryItem.product`: sem `onDelete: SetNull` — ao deletar Product com inventory items, falha

### 9.3. Array `currentOrderIds` Como Anti-Pattern

```prisma
currentOrderIds String[]
```

Armazenar IDs como array em PostgreSQL relacional é um anti-pattern. Deveria ser uma tabela de junção `KitchenDeviceOrder`.

### 9.4. Campos JSON Sem Indexação

`Tenant.settings`, `ChatSession.context`, `ChatMessage.metadata`, `KitchenDevice.settings` como `Json?` — não podem ser indexados ou consultados eficientemente.

### 9.5. Missing Unique Constraints

- `Product.name` deveria ser `@@unique([tenantId, name])`
- `Category.name` deveria ser `@@unique([tenantId, name])`

---

## 10. MULTI-TENANCY

### 10.1. Problemas no tenant-prisma.ts

Conforme detalhado na seção 2.4, vários métodos do Prisma não têm filtro de tenantId. Além disso:

```typescript
async create({ args, query }) {
  if (typeof args.data === 'object' && !Array.isArray(args.data)) {
    (args.data as Record<string, unknown>).tenantId = tenantId
  }
  return query(args)
}
```

- `createMany` não é tratado
- O `as Record<string, unknown>` tira a segurança de tipos
- A verificação `typeof args.data === 'object' && !Array.isArray(args.data)` pode falhar para certos tipos de dados do Prisma

### 10.2. AuthContext é Reparsado em Cada Rota

O middleware já valida o JWT e injeta nos headers, mas `getAuthContext()` em cada server component redecodifica o JWT. Seria mais eficiente usar os headers injetados diretamente.

---

## 11. PLANO DE AÇÃO PRIORIZADO

### Prioridade 1 — CORREÇÕES CRÍTICAS (Fazer Imediatamente)

| # | Tarefa | Arquivos | Esforço |
|---|---|---|---|
| 1.1 | Criar symlink `app` → `src/frontend/app/` e resolver divergência de cores | `app/`, `src/frontend/app/` | 1h |
| 1.2 | Corrigir race condition do orderNumber (mover create para dentro da transação) | `order.service.ts` | 1h |
| 1.3 | Corrigir N+1 na criação de pedidos | `order.service.ts` | 1h |
| 1.4 | Completar tenant-prisma.ts (findUnique, update, delete, upsert, createMany) | `tenant-prisma.ts` | 3h |
| 1.5 | Remover fallback de JWT secrets (sempre lançar erro) | `jwt.ts` | 30min |
| 1.6 | Separar verifyToken para access e refresh tokens | `jwt.ts` | 1h |

### Prioridade 2 — SEGURANÇA E PERFORMANCE (Fazer em Seguida)

| # | Tarefa | Arquivos | Esforço |
|---|---|---|---|
| 2.1 | Remover Tailwind CDN do layout | `layout.tsx` | 30min |
| 2.2 | Consolidar CSS (remover <style> inline, manter só globals.css) | `layout.tsx`, `globals.css` | 1h |
| 2.3 | Adicionar AbortController nos useEffects com fetch | `HeaderWrapper.tsx` e similares | 2h |
| 2.4 | Corrigir pg-notify (escapar payload corretamente) | `pg-notify.ts` | 1h |
| 2.5 | Remover 'use client' de componentes presentacionais | `Badge.tsx`, `Card.tsx`, `Button.tsx`, etc. | 1h |
| 2.6 | Substituir document.write() no QR code | `qr-code/page.tsx` | 1h |

### Prioridade 3 — LIMPEZA E REFATORAÇÃO (Fazer Quando Possível)

| # | Tarefa | Esforço |
|---|---|---|
| 3.1 | Remover diretório `_backup/` (manter só snapshots recentes) | 1h |
| 3.2 | Remover arquivos de config duplicados | 30min |
| 3.3 | Limpar diretórios de API vazios | 30min |
| 3.4 | Remover dependências não utilizadas (`@upstash/*`, `ts-node`, `tailwindcss-animate`) | 1h |
| 3.5 | Corrigir encoding da sidebar (`Card�pio` → `Cardápio`) | 30min |
| 3.6 | Remover `console.warn`/`console.error` de libs (ou usar logger) | 2h |

### Prioridade 4 — MELHORIAS DE LONGO PRAZO

| # | Tarefa | Esforço |
|---|---|---|
| 4.1 | Atualizar Zod para v4 | 4h |
| 4.2 | Adicionar indexes no banco (FKs sem index) | 1h |
| 4.3 | Criar tabela de junção KitchenDeviceOrder (em vez de array) | 4h |
| 4.4 | Adicionar unique constraints (Product.name + tenant, Category.name + tenant) | 1h |
| 4.5 | Implementar endpoints de API pendentes (chat, webhooks, etc.) | 8h+ |
| 4.6 | Refatorar casts `as any`/`as never` para tipos corretos | 4h |
| 4.7 | Usar env vars para JWT expiration (`JWT_ACCESS_EXPIRES_IN`, `JWT_REFRESH_EXPIRES_IN`) | 30min |
| 4.8 | Extrair hardcoded plan name e restaurant name da sidebar para props/context | 30min |
| 4.9 | Adicionar error boundaries e loading states no root layout | 2h |

---

## 12. ESTIMATIVA DE ESFORÇO TOTAL

| Prioridade | Tarefas | Estimativa |
|---|---|---|
| P1 — Críticas | 6 tarefas | ~8h |
| P2 — Segurança/Performance | 6 tarefas | ~7h |
| P3 — Limpeza | 6 tarefas | ~5h |
| P4 — Longo Prazo | 9 tarefas | ~25h |
| **Total** | **27 tarefas** | **~45h** |

---

## CONCLUSÃO

O projeto tem uma **base sólida** com boa arquitetura multi-tenant, mas sofre de problemas de **manutenção** (diretórios duplicados que já divergiram), **segurança** (JWT com fallback, refresh token como access token), **performance** (N+1, Tailwind CDN, CSS duplicado), e **qualidade de código** (casts `as any`, catch silencioso, encoding corrompido).

As correções de prioridade 1 e 2 devem ser feitas **imediatamente** antes de qualquer novo desenvolvimento, pois afetam a segurança e integridade dos dados. As prioridades 3 e 4 podem ser distribuídas ao longo do tempo.
