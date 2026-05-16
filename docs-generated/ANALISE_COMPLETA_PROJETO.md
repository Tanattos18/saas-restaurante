# ANÁLISE COMPLETA DO PROJETO — SaaS Restaurante

> **Data:** 16/05/2026 (Atualizado pós-correções)
> **Escopo:** Análise estrutural, código-fonte, dependências, segurança, performance e boas práticas.

---

## SUMÁRIO

1. [RESUMO EXECUTIVO](#1-resumo-executivo)
2. [O QUE FOI CORRIGIDO](#2-o-que-foi-corrigido)
3. [PROBLEMAS CRÍTICOS](#3-problemas-críticos)
4. [PROBLEMAS DE SEGURANÇA](#4-problemas-de-segurança)
5. [PROBLEMAS DE ARQUITETURA](#5-problemas-de-arquitetura)
6. [PROBLEMAS DE PERFORMANCE](#6-problemas-de-performance)
7. [PROBLEMAS DE CÓDIGO](#7-problemas-de-código)
8. [ARQUIVOS DUPLICADOS E REDUNDÂNCIA](#8-arquivos-duplicados-e-redundância)
9. [DEPENDÊNCIAS](#9-dependências)
10. [BANCO DE DADOS (PRISMA)](#10-banco-de-dados-prisma)
11. [MULTI-TENANCY](#11-multi-tenancy)
12. [PLANO DE AÇÃO PRIORIZADO](#12-plano-de-ação-priorizado)
12. [ESTIMATIVA DE ESFORÇO](#12-estimativa-de-esforço)

---

## 1. RESUMO EXECUTIVO

O projeto **saas-restaurante** é uma aplicação Next.js 15 + React 19 multi-tenant para gestão de restaurantes com módulos de cardápio digital, KDS (Kitchen Display System), pedidos via WhatsApp, CRM, fidelidade e assinaturas (Stripe).

### Métricas Gerais (Pós-correção)

| Métrica | Valor |
|---|---|
| Arquivos fonte | ~250-300 |
| Arquivos TypeScript/TSX | ~170 |
| Componentes React | ~40+ |
| Rotas de API | ~40 |
| Snapshots de backup (_backup/) | 1 (zip) |
| Arquivos CSS | 1 (consolidado) |
| Diretórios vazios | 0 (removidos) |
| Dependências removidas | 4 |
| Testes passando | 6/6 |
| Build | ✅ Compilando |

### Pontos Fortes (mantidos)

- Arquitetura multi-tenant fortalecida com `tenant-prisma.ts` completo
- Migrations do Prisma organizadas
- Separação clara entre backend (services) e frontend (components)
- Padrão singleton para Prisma Client
- Estrutura de pastas desduplicada

### Pontos Críticos — Resolvidos na Fase 1

1. ✅ **Symlink `app/` → `src/frontend/app/`** — Diretório único, tema roxo mantido
2. ✅ **JWT sem fallback** — Secrets sempre validadas, throw se ausentes
3. ✅ **Race condition orderNumber** — `create` dentro da transação Prisma
4. ✅ **N+1 queries** — Batch `findMany` em vez de loop `findUnique`
5. ✅ **Tailwind CDN removido** — Apenas PostCSS compilation
6. ✅ **Multi-tenancy completo** — Todos os métodos Prisma com filtro tenantId

---

## 2. O QUE FOI CORRIGIDO (Fases 1-3)

### 5 Commits no branch `fix/otimizacao-geral`

| Commit | O que foi feito |
|---|---|
| `07487cd` | **Fase 1 — Crítico:** Symlink app/, JWT sem fallback + split verifyToken, order.service (race + N+1), tenant-prisma completo, CSS consolidado, encoding UTF-8 |
| `fff7ddf` | **Checklist:** Atualização do progresso |
| `3ff1385` | **Testes:** Correção dos testes JWT para nova API |
| `133d65b` | **Fase 2 — Seg/Perf:** AbortController, pg-notify, QR Code, documentação de testes |
| `c1d51a0` | **Fase 3 — Limpeza:** Dependências não usadas removidas, configs duplicadas, APIs vazias, _backup limpo, jest.config, console.error com contexto |

### Resumo de Correções por Categoria

**✅ Segurança:**
- JWT sem fallback secrets (sempre throw)
- `verifyToken` separado em `verifyAccessToken` + `verifyRefreshToken`
- SQL injection no `pg-notify` corrigido (escape de payload)
- `document.write()` substituído por `innerHTML` no QR Code
- `evolutionRequest` agora lança erro em vez de engolir

**✅ Arquitetura:**
- `app/` agora é symlink para `src/frontend/app/`
- CSS consolidado em único arquivo (`globals.css`), CDN e `dangerouslySetInnerHTML` removidos
- Configs duplicadas removidas (`config/next.config.ts`, `config/postcss.config.js`)
- Jest config convertido de TS para JS (independência de ts-node)

**✅ Multi-tenancy:**
- `tenant-prisma.ts` completo: findUnique, update, delete, upsert, findFirstOrThrow, findUniqueOrThrow, createMany

**✅ Performance:**
- N+1 queries eliminado no `order.service.ts` (batch findMany)
- Race condition do orderNumber eliminada (create dentro da transação)
- Tailwind CDN removido (já compilado via PostCSS)
- AbortController adicionado no fetch do HeaderWrapper

**✅ Limpeza:**
- 4 dependências removidas: `@upstash/ratelimit`, `@upstash/redis`, `ts-node`, `tailwindcss-animate`
- APIs placeholder removidas: `chat/send`, `chat/sessions`, `health`, `kds/stream`, etc.
- `_backup/` limpo: mantido apenas o zip de backup
- Encoding UTF-8 corrigido em `Sidebar.tsx` e `StatsCards.tsx`
- `console.error` com contexto em `pg-notify.ts` e `whatsapp.ts`

### O que ainda NÃO foi feito

**Prioridade 4 (Longo Prazo):**
- Zod v4 (atualmente v3)
- Indexes no banco (ChatMessage.customerId, etc.)
- Tabela KitchenDeviceOrder (em vez de array)
- Unique constraints (Product.name + tenant)
- Endpoints de API pendentes (health, webhooks, etc.)
- Refatorar casts `as any`/`as never`
- Error boundaries e loading states
- prefetch={false} na sidebar
- Cascade delete Order.customer
- Avaliar serwist/PWA
- Logger estruturado
- Validação com enums do Prisma

---

### 2.1. Diretórios `app/` Duplicados (✅ RESOLVIDO)

**Situação anterior:** `app/` e `src/frontend/app/` eram cópias independentes. `layout.tsx` havia divergido (verde vs roxo).

**O que foi feito:** `app/` foi removido e substituído por um symlink apontando para `src/frontend/app/`. Tema roxo mantido como oficial. Divergência de cores eliminada.

**Verificação:**
```powershell
Get-Item "app" | Select-Object Name, LinkType, Target
# LinkType = SymbolicLink, Target = src/frontend/app
```

---

### 2.2. Race Condition na Criação de Pedidos (✅ RESOLVIDO)

**Situação anterior:** `orderNumber` era gerado dentro de uma transação, mas o `create` era feito fora — janela para race condition.

**O que foi feito:** O `db.order.create` foi movido para DENTRO da `$transaction` que gera o `orderNumber`. A criação agora é atômica: gera o número e cria o pedido na mesma transação.

**Arquivo:** `src/backend/services/order.service.ts`

---

### 2.3. N+1 Queries em Order Service (✅ RESOLVIDO)

**Situação anterior:** Loop `for` com `findUnique` para cada item do pedido (1+N queries).

**O que foi feito:** Substituído por `findMany` em lote + `Map` para lookup O(1). Reduz de 1+N para 2 queries independente do número de itens.

**Arquivo:** `src/backend/services/order.service.ts`

---

### 2.4. Multi-Tenancy Incompleto no tenant-prisma.ts (✅ RESOLVIDO)

**Situação anterior:** Apenas `findMany`, `count`, `updateMany` e `deleteMany` tinham filtro de tenantId.

**O que foi feito:** Adicionados ao `$extends`:
- ✅ `findUnique` — filtro tenantId
- ✅ `update` — filtro tenantId
- ✅ `delete` — filtro tenantId
- ✅ `upsert` — filtro tenantId + tenantId no create/update
- ✅ `findFirstOrThrow` — filtro tenantId
- ✅ `findUniqueOrThrow` — filtro tenantId
- ✅ `createMany` — injeção de tenantId em cada item

**Arquivo:** `src/backend/lib/tenant-prisma.ts`

---

## 3. PROBLEMAS DE SEGURANÇA

### 3.1. Fallback de JWT Secrets Hardcoded (✅ RESOLVIDO)

**Situação anterior:** Fallback `'fallback-access-secret-development-only'` usado se env var não definida.

**O que foi feito:** `getAccessSecret()` e `getRefreshSecret()` agora lançam erro se a env var não estiver definida, sem exceção. `console.warn` removido.

**Arquivo:** `src/backend/lib/jwt.ts`

### 3.2. Refresh Token Usado como Access Token (✅ RESOLVIDO)

**Situação anterior:** `verifyToken()` tentava accessSecret primeiro, depois refreshSecret — refresh tokens de 7 dias eram aceitos como access tokens.

**O que foi feito:** `verifyToken()` substituída por `verifyAccessToken()` e `verifyRefreshToken()` separadas. Cada uma usa apenas a secret correspondente. Middleware e rotas atualizados para usar a função correta.

**Arquivo:** `src/backend/lib/jwt.ts`, `src/backend/middleware.ts`, `src/backend/lib/auth.ts`

### 3.3. Injeção SQL Potencial em pg-notify.ts (✅ RESOLVIDO)

**Situação anterior:** Escape manual que só tratava aspas simples (`'`).

**O que foi feito:** Criadas funções `escapeLiteral()` (trata `\`, `'`, `\n`) e `escapeIdentifier()` (trata `"`) usando funções dedicadas. NOTIFY agora usa ambas para segurança completa.

**Arquivo:** `src/backend/lib/pg-notify.ts`

### 3.4. document.write() no QR Code (✅ RESOLVIDO)

**Situação anterior:** `win.document.write()` usado para gerar HTML de impressão.

**O que foi feito:** Substituído por concatenação de string HTML + `win.document.body.innerHTML`. `document.write()` não é mais utilizado.

**Arquivo:** `src/frontend/app/(platform)/[tenantSlug]/qr-code/page.tsx`

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

### Prioridade 4 — MELHORIAS DE LONGO PRAZO (PENDENTES)

| # | Tarefa | Esforço | Status |
|---|---|---|---|
| 4.1 | Atualizar Zod para v4 | 4h | ⏳ |
| 4.2 | Adicionar indexes no banco (FKs sem index) | 1h | ⏳ |
| 4.3 | Criar tabela de junção KitchenDeviceOrder (em vez de array) | 4h | ⏳ |
| 4.4 | Adicionar unique constraints (Product.name + tenant, Category.name + tenant) | 1h | ⏳ |
| 4.5 | Implementar endpoints de API pendentes (chat, webhooks, etc.) | 8h+ | ⏳ |
| 4.6 | Refatorar casts `as any`/`as never` para tipos corretos | 4h | ⏳ |
| 4.7 | Usar env vars para JWT expiration | 30min | ✅ |
| 4.8 | Extrair hardcoded plan name e restaurant name da sidebar para props/context | 30min | ⏳ |
| 4.9 | Adicionar error boundaries e loading states no root layout | 2h | ⏳ |
| 4.10 | Prefetch={false} em links da sidebar | 30min | ⏳ |
| 4.11 | Corrigir cascade delete Order.customer | 1h | ⏳ |
| 4.12 | Avaliar remoção de @serwist/next e serwist | 1h | ⏳ |
| 4.13 | Criar logger estruturado | 3h | ⏳ |
| 4.14 | Validação de input com enums do Prisma | 1h | ⏳ |

---

## 12. ESTIMATIVA DE ESFORÇO (REAL vs. ESTIMADO)

| Prioridade | Tarefas | Estimado | Realizado | Pendente |
|---|---|---|---|---|
| P1 — Críticas | 6 tarefas | ~8h | ✅ 6/6 | 0 |
| P2 — Segurança/Performance | 6 tarefas | ~7h | ✅ 4/6 | 2 |
| P3 — Limpeza | 6 tarefas | ~5h | ✅ 5/6 | 1 |
| P4 — Longo Prazo | 14 tarefas | ~25h | ✅ 1/14 | 13 |
| **Total** | **32 tarefas** | **~45h** | **16 concluídas** | **16 pendentes** |

---

## CONCLUSÃO

**O que foi feito (Fases 1-3):** As correções críticas de segurança, arquitetura e performance foram implementadas. O symlink do `app/` foi criado, JWT está seguro sem fallbacks, a race condition e N+1 no order.service foram eliminados, o multi-tenancy está completo, Tailwind CDN e CSS duplicado foram removidos, dependências não utilizadas e configs mortas foram eliminadas.

**O que ainda precisa ser feito (Fase 4):** Melhorias de longo prazo como atualização do Zod, indexes no banco, tabela KitchenDeviceOrder, endpoints de API, refatoração de casts `as any`, error boundaries, logger estruturado, etc.

**Estado atual:** Build compila, 6/6 testes passam, typecheck sem erros, lint sem errors.
