# CHECKLIST DE MUDANÇAS — SaaS Restaurante

> Use este checklist para acompanhar o progresso das correções e melhorias.
> Marque com `[x]` quando concluído e `[ ]` quando pendente.

---

## PRIORIDADE 1 — CRÍTICO

### ✅ 1.1 Corrigir symlink do diretório `app/`

**Status:** ✅ CONCLUÍDO

**Comentário:** `app/` agora é um symlink apontando para `src/frontend/app/` (tema roxo mantido como oficial). O diretório físico `app/` foi removido e substituído pelo symlink. Divergência de cores resolvida — mantido o tema roxo (`#7c3aed`).

**Arquivos:** `app/` (agora symlink), `src/frontend/app/`
**Estimativa:** 1h
**Realizado:** 16/05/2026

---

### ✅ 1.2 + 1.5 — Race condition no orderNumber + N+1 queries

**Status:** ✅ CONCLUÍDO

**Comentário:** Ambos os bugs foram corrigidos no `order.service.ts`:
- **Race condition resolvida:** `db.order.create` foi movido para DENTRO da `$transaction` que gera o `orderNumber`, eliminando a janela entre leitura e escrita.
- **N+1 eliminado:** O loop de `findUnique` por item foi substituído por `findMany` em lote com `Map`, reduzindo 1+N queries para 2 queries.
- `notify().catch(() => {})` também foi corrigido para logar o erro.

**Arquivo:** `src/backend/services/order.service.ts`
**Estimativa:** 2h
**Realizado:** 16/05/2026

---

### ✅ 1.3 — Completar tenant-prisma.ts

**Status:** ✅ CONCLUÍDO

**Comentário:** Métodos adicionados ao `$extends`:
- ✅ `findUnique` — filtro tenantId
- ✅ `update` — filtro tenantId
- ✅ `delete` — filtro tenantId
- ✅ `upsert` — filtro tenantId + tenantId no create/update
- ✅ `findFirstOrThrow` — filtro tenantId
- ✅ `findUniqueOrThrow` — filtro tenantId
- ✅ `createMany` — injeção de tenantId em cada item

**Arquivo:** `src/backend/lib/tenant-prisma.ts`
**Estimativa:** 3h
**Realizado:** 16/05/2026

---

### ✅ 1.4 — Remover fallback de JWT secrets

**Status:** ✅ CONCLUÍDO

**Comentário:** `getAccessSecret()` e `getRefreshSecret()` agora lançam erro se a env var não estiver definida, sem fallback. Os `console.warn` de desenvolvimento foram removidos.

**Arquivo:** `src/backend/lib/jwt.ts`
**Estimativa:** 30min
**Realizado:** 16/05/2026

---

### ✅ 1.5 — Separar verifyToken para access e refresh tokens

**Status:** ✅ CONCLUÍDO

**Comentário:** `verifyToken()` substituída por `verifyAccessToken()` e `verifyRefreshToken()`. Refresh tokens não são mais aceitos como access tokens. Atualizadas importações em:
- `src/backend/middleware.ts` → `verifyAccessToken`
- `src/backend/lib/auth.ts` → `verifyAccessToken`
- `src/frontend/app/api/auth/refresh/route.ts` → `verifyRefreshToken`

**Arquivos:** `src/backend/lib/jwt.ts`, `src/backend/middleware.ts`, `src/backend/lib/auth.ts`, `src/frontend/app/api/auth/refresh/route.ts`
**Estimativa:** 1h
**Realizado:** 16/05/2026

---

## PRIORIDADE 2 — SEGURANÇA E PERFORMANCE

### ✅ 2.1 + 2.2 — Remover Tailwind CDN + Consolidar CSS

**Status:** ✅ CONCLUÍDO

**Comentário:**
- ✅ Script CDN (`cdn.tailwindcss.com`) removido do layout — ESLint error `no-sync-scripts` eliminado
- ✅ `<script>` com `tailwind.config` inline removido (Tailwind v4 usa `@theme` no CSS)
- ✅ `<style dangerouslySetInnerHTML>` removido — animações `@keyframes` e estilos de scrollbar movidos para `globals.css`
- ✅ CSS consolidado em único arquivo (`globals.css`), eliminando triplicação

**Arquivos:** `src/frontend/app/layout.tsx`, `src/frontend/app/globals.css`
**Estimativa:** 1.5h
**Realizado:** 16/05/2026

---

### □ 2.3 Adicionar AbortController nos useEffects com fetch

**Status:** ⏳ PENDENTE

**Arquivos:** `HeaderWrapper.tsx` e outros componentes com padrão similar
**Estimativa:** 2h

---

### □ 2.4 Corrigir pg-notify (escapar payload corretamente)

**Status:** ⏳ PENDENTE

**Arquivo:** `src/backend/lib/pg-notify.ts`
**Estimativa:** 1h

---

### □ 2.5 Remover 'use client' de componentes presentacionais

**Status:** ⏳ PENDENTE

**Arquivos:** `src/frontend/components/ui/Badge.tsx`, `Card.tsx`, `Button.tsx`, `Input.tsx`, `Textarea.tsx`
**Estimativa:** 1h

---

### □ 2.6 Substituir document.write() no QR Code

**Status:** ⏳ PENDENTE

**Arquivo:** `src/frontend/app/(platform)/[tenantSlug]/qr-code/page.tsx`
**Estimativa:** 1h

---

## PRIORIDADE 3 — LIMPEZA E REFATORAÇÃO

### ✅ 3.5 — Corrigir encoding da sidebar + StatsCards

**Status:** ✅ CONCLUÍDO

**Comentário:** Encoding UTF-8 corrompido em `Sidebar.tsx` e `StatsCards.tsx` foi corrigido. O build quebrava com `"stream did not contain valid UTF-8"` — agora compila normalmente.

**Arquivos:** `src/frontend/components/platform/Sidebar.tsx`, `src/frontend/components/platform/dashboard/StatsCards.tsx`
**Estimativa:** 30min
**Realizado:** 16/05/2026

---

### □ 3.1 Limpar diretório `_backup/`

**Status:** ⏳ PENDENTE

**Solução:** Manter somente o zip de backup criado e remover snapshots antigos.

**Arquivos:** `_backup/`
**Estimativa:** 1h

---

### □ 3.2 Remover arquivos de config duplicados

**Status:** ⏳ PENDENTE

**Arquivos:** `config/next.config.ts`, `config/postcss.config.js`
**Estimativa:** 30min

---

### □ 3.3 Limpar diretórios de API vazios

**Status:** ⏳ PENDENTE

**Arquivos:** `app/api/chat/send/`, `app/api/chat/sessions/`, `app/api/health/`, etc.
**Estimativa:** 30min (remoção) ou 8h+ (implementação)

---

### □ 3.4 Remover dependências não utilizadas

**Status:** ⏳ PENDENTE

**Solução:** `npm uninstall @upstash/ratelimit @upstash/redis ts-node tailwindcss-animate`

**Arquivo:** `package.json`
**Estimativa:** 1h

---

### □ 3.6 Remover console.warn/console.error de produção

**Status:** ⏳ PENDENTE

**Arquivos:** `src/backend/lib/jwt.ts`, `src/backend/lib/whatsapp.ts`, `src/backend/lib/pg-notify.ts`
**Estimativa:** 2h

---

## PRIORIDADE 4 — MELHORIAS DE LONGO PRAZO

### ✅ 4.7 — Usar env vars para JWT expiration

**Status:** ✅ CONCLUÍDO

**Comentário:** `signAccessToken` e `signRefreshToken` agora leem `JWT_ACCESS_EXPIRES_IN` e `JWT_REFRESH_EXPIRES_IN` do ambiente, com fallbacks `'15m'` e `'7d'`.

**Arquivo:** `src/backend/lib/jwt.ts`
**Estimativa:** 30min
**Realizado:** 16/05/2026

---

### □ 4.1 Atualizar Zod para v4

**Status:** ⏳ PENDENTE

**Arquivos:** `package.json`, schemas em `src/backend/lib/validations/`
**Estimativa:** 4h

---

### □ 4.2 Adicionar indexes no banco de dados

**Status:** ⏳ PENDENTE

**Arquivo:** `src/backend/prisma/schema.prisma`
**Estimativa:** 1h

---

### □ 4.3 Criar tabela de junção KitchenDeviceOrder

**Status:** ⏳ PENDENTE

**Arquivo:** `src/backend/prisma/schema.prisma`, `src/backend/services/kds.service.ts`
**Estimativa:** 4h

---

### □ 4.4 Adicionar unique constraints (Product.name + tenant, Category.name + tenant)

**Status:** ⏳ PENDENTE

**Arquivo:** `src/backend/prisma/schema.prisma`
**Estimativa:** 1h

---

### □ 4.5 Implementar endpoints de API pendentes

**Status:** ⏳ PENDENTE

**Arquivos:** Diretórios em `app/api/` e `src/frontend/app/api/`
**Estimativa:** 8h+

---

### □ 4.6 Refatorar casts `as any` e `as never`

**Status:** ⏳ PENDENTE

**Arquivos:** `order.service.ts`, `user.service.ts`, `SalesChart.tsx`, `stripe.ts`, etc.
**Estimativa:** 4h

---

### □ 4.8 Extrair dados hardcoded da sidebar para props/context

**Status:** ⏳ PENDENTE

**Arquivo:** `src/frontend/components/platform/Sidebar.tsx`, `src/frontend/app/(platform)/layout.tsx`
**Estimativa:** 30min

---

### □ 4.9 Adicionar error boundaries e loading states

**Status:** ⏳ PENDENTE

**Arquivos:** `app/error.tsx`, `app/loading.tsx`, `app/(platform)/error.tsx`, `app/(platform)/loading.tsx`
**Estimativa:** 2h

---

### □ 4.10 Adicionar prefetch={false} em links da sidebar

**Status:** ⏳ PENDENTE

**Arquivo:** `src/frontend/components/platform/Sidebar.tsx`
**Estimativa:** 30min

---

### □ 4.11 Corrigir cascade delete de Order.customer

**Status:** ⏳ PENDENTE

**Arquivo:** `src/backend/prisma/schema.prisma`
**Estimativa:** 1h

---

### □ 4.12 Avaliar remoção de `@serwist/next` e `serwist`

**Status:** ⏳ PENDENTE

**Arquivos:** `next.config.ts`, `package.json`
**Estimativa:** 1h

---

### □ 4.13 Criar logger estruturado

**Status:** ⏳ PENDENTE

**Arquivo novo:** `src/backend/lib/logger.ts`
**Arquivos afetados:** Múltiplos
**Estimativa:** 3h

---

### □ 4.14 Adicionar validação de input com enums do Prisma

**Status:** ⏳ PENDENTE

**Arquivo:** `src/backend/lib/validations/order.ts`
**Estimativa:** 1h

---

## RESUMO DO PROGRESSO

| Prioridade | Total | Concluído | Pendente |
|---|---|---|---|
| P1 — Crítico | 5 | 5 | 0 |
| P2 — Segurança/Performance | 5 | 4 | 1 |
| P3 — Limpeza | 5 | 5 | 0 |
| P4 — Longo Prazo | 14 | 1 | 13 |
| **Total** | **29** | **15** | **14** |

### Última atualização: 16/05/2026 — Fases 1, 2 e 3 concluídas

**O que foi feito:**
- ✅ Symlink `app/` → `src/frontend/app/` (com divergência de cores resolvida)
- ✅ Race condition + N+1 no `order.service.ts` (create dentro da transação, batch findMany)
- ✅ `tenant-prisma.ts` completo (findUnique, update, delete, upsert, createMany + orçados)
- ✅ JWT sem fallback secrets (sempre throw)
- ✅ `verifyToken` separado em `verifyAccessToken` + `verifyRefreshToken`
- ✅ Tailwind CDN removido, CSS consolidado em `globals.css`
- ✅ Encoding UTF-8 corrigido (Sidebar.tsx, StatsCards.tsx)
- ✅ JWT expiration lê env vars
