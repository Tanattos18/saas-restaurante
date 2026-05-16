# REGRAS DE DESENVOLVIMENTO — SaaS Restaurante

> Regras e convenções para manter a qualidade, segurança e consistência do código.
> Todo desenvolvedor deve seguir estas regras ao contribuir com o projeto.

---

## 1. ARQUITETURA

### 1.1. Diretório `app/` é SYMLINK

`app/` é um symlink apontando para `src/frontend/app/`.

```
app -> src/frontend/app/   (SYMLINK — NÃO CRIE ARQUIVOS AQUI DIRETAMENTE)
```

**Regra:** Sempre edite os arquivos em `src/frontend/app/`. O symlink propaga automaticamente.

**Verificação:**
```powershell
Get-Item "app" | Select-Object LinkType
# Deve retornar: SymbolicLink
```

---

### 1.2. Tema padrão: Roxo

O tema oficial do projeto é roxo (`#7c3aed`).

```css
/* globals.css — tema claro */
:root {
  --primary: #7c3aed;
  --background: #faf5ff;
  --foreground: #1e1b4b;
}
```

**Regra:** Não alterar cores do tema sem aprovação. Toda animação `@keyframes` deve ficar em `globals.css`, nunca inline no layout.

---

### 1.3. CSS único e consolidado

**Regra:** Todo CSS fica em `src/frontend/app/globals.css`. 
- ❌ Proibido `<style dangerouslySetInnerHTML>` no layout
- ❌ Proibido `<script>` com `tailwind.config` (Tailwind v4 usa `@theme`)
- ❌ Proibido CDN do Tailwind (já compilado via PostCSS)
- ✅ Usar `@import "tailwindcss"` e `@theme inline` no globals.css

---

## 2. SEGURANÇA

### 2.1. JWT — Secrets sempre obrigatórias

```typescript
// ✅ CORRETO
const secret = process.env.JWT_ACCESS_SECRET
if (!secret) throw new Error('JWT_ACCESS_SECRET não configurada')
return new TextEncoder().encode(secret)
```

```typescript
// ❌ PROIBIDO — fallback hardcoded
const secret = process.env.JWT_ACCESS_SECRET ?? 'fallback-dev-only'
```

**Regra:** Nunca usar fallback de secrets. Sempre lançar erro se a env var não estiver definida.

---

### 2.2. Access token ≠ Refresh token

```typescript
// ✅ CORRETO
import { verifyAccessToken, verifyRefreshToken } from '@/lib/jwt'

// No middleware:
const payload = await verifyAccessToken(token)

// Na rota de refresh:
const payload = await verifyRefreshToken(token)
```

```typescript
// ❌ PROIBIDO — função única que aceita ambos
const payload = await verifyToken(token)
```

**Regra:** Usar `verifyAccessToken` para autenticação de rotas e `verifyRefreshToken` apenas para renovação de tokens.

---

### 2.3. JWT expiration lê do ambiente

```typescript
// ✅ CORRETO
const expiresIn = process.env.JWT_ACCESS_EXPIRES_IN || '15m'
```

```typescript
// ❌ PROIBIDO — valor hardcoded sem fallback de ambiente
setExpirationTime('15m')
```

**Regra:** Usar env vars com fallback razoável. Valores hardcoded só com aprovação.

---

### 2.4. pg-notify — escape sempre

```typescript
// ✅ CORRETO
function escapeLiteral(str: string): string {
  return "'" + str.replace(/\\/g, '\\\\').replace(/'/g, "''").replace(/\n/g, '\\n') + "'"
}
function escapeIdentifier(str: string): string {
  return '"' + str.replace(/"/g, '""') + '"'
}
await c.query(`NOTIFY ${escapeIdentifier(channel)}, ${escapeLiteral(payload)}`)
```

```typescript
// ❌ PROIBIDO — escape manual incompleto
const escaped = payload.replace(/'/g, "''")
await c.query(`NOTIFY "${channel}", '${escaped}'`)
```

**Regra:** Sempre usar `escapeLiteral` + `escapeIdentifier` no `notify()`.

---

### 2.5. document.write() proibido

```typescript
// ✅ CORRETO
win.document.body.innerHTML = html
```

```typescript
// ❌ PROIBIDO
win.document.write(html)
```

**Regra:** `document.write()` é proibido. Usar `innerHTML` ou bibliotecas apropriadas.

---

## 3. MULTI-TENANCY

### 3.1. Sempre usar createTenantPrisma

```typescript
// ✅ CORRETO
import { createTenantPrisma } from '@/backend/lib/tenant-prisma'
const db = createTenantPrisma(tenantId)
const orders = await db.order.findMany({ ... })  // Filtra tenantId automaticamente
```

```typescript
// ❌ PROIBIDO — usar prisma direto sem filtro de tenant (a menos que seja cross-tenant)
import prisma from '@/backend/lib/prisma'
const orders = await prisma.order.findMany({ ... })  // Pode retornar dados de outros tenants
```

**Regra:** Operações dentro de um tenant SEMPRE usam `createTenantPrisma(tenantId)`. O `prisma` direto só é usado para operações cross-tenant (ex: verificar plano do tenant).

---

### 3.2. Métodos cobertos pelo tenant-prisma

O `$extends` cobre estes métodos com filtro automático de `tenantId`:

| Método | Filtro tenantId |
|---|---|
| `findMany` | ✅ Automático |
| `findFirst` | ✅ Automático |
| `findUnique` | ✅ Automático (se where por id) |
| `findFirstOrThrow` | ✅ Automático |
| `findUniqueOrThrow` | ✅ Automático (se where por id) |
| `count` | ✅ Automático |
| `create` | ✅ Injeta tenantId |
| `createMany` | ✅ Injeta tenantId |
| `update` | ✅ Automático (se where por id) |
| `updateMany` | ✅ Automático |
| `delete` | ✅ Automático (se where por id) |
| `deleteMany` | ✅ Automático |
| `upsert` | ✅ Automático + injeta tenantId |

**Regra:** Se precisar de um método não listado, adicione ao `$extends` em `tenant-prisma.ts`.

---

## 4. PERFORMANCE

### 4.1. N+1 queries — proibido

```typescript
// ✅ CORRETO — batch query
const productIds = input.items.map(i => i.productId)
const products = await prisma.product.findMany({
  where: { id: { in: productIds } }
})
const productMap = new Map(products.map(p => [p.id, p]))
```

```typescript
// ❌ PROIBIDO — N+1 queries em loop
for (const item of input.items) {
  const product = await prisma.product.findUnique({ where: { id: item.productId } })
}
```

**Regra:** Nunca fazer queries dentro de loops. Usar `findMany` com `in` + `Map`.

---

### 4.2. Transações atômicas

```typescript
// ✅ CORRETO — create dentro da transação
const result = await prisma.$transaction(async (tx) => {
  const orderNumber = (await tx.order.findFirst({ ... })) + 1
  return tx.order.create({ data: { orderNumber, ... } })
})
```

```typescript
// ❌ PROIBIDO — gerar ID fora, criar fora (race condition)
const orderNumber = await prisma.$transaction(async (tx) => { ... })
return db.order.create({ data: { orderNumber, ... } })  // ← FORA DA TRANSAÇÃO
```

**Regra:** Operações que dependem de leitura + escrita atômica DEVEM estar dentro da mesma transação.

---

### 4.3. use client — só quando necessário

```typescript
// ✅ PODE ser server component (sem 'use client')
// Componentes que só renderizam JSX, sem hooks ou eventos
```

```typescript
// ✅ PRECISA de 'use client'
// Componentes com: useState, useEffect, useRef, forwardRef, onClick, onSubmit, etc.
```

**Regra:** Não adicionar `'use client'` a menos que o componente use hooks, eventos ou browser APIs.

---

### 4.4. AbortController em fetch no useEffect

```typescript
// ✅ CORRETO
useEffect(() => {
  const ac = new AbortController()
  fetch('/api/data', { signal: ac.signal }).then(...)
  return () => ac.abort()
}, [])
```

```typescript
// ❌ PROIBIDO — sem cleanup, memory leak potencial
useEffect(() => {
  fetch('/api/data').then(...)
}, [])
```

**Regra:** Todo `fetch` dentro de `useEffect` deve usar `AbortController` com cleanup.

---

## 5. CÓDIGO

### 5.1. Proibido `as any` e `as never`

```typescript
// ✅ CORRETO — tipar corretamente
role: data.role as UserRole,
where: where as Prisma.OrderWhereInput,
```

```typescript
// ❌ PROIBIDO
role: data.role as any,
where: where as never,
```

**Regra:** Nunca usar `as any` ou `as never`. Usar o tipo específico do Prisma ou criar uma interface.

---

### 5.2. Catch silencioso — proibido

```typescript
// ✅ CORRETO
.catch((err) => {
  console.error('[contexto] Erro ao fazer X:', err)
  setError('Mensagem amigável')
})
```

```typescript
// ❌ PROIBIDO
.catch(() => {})
.catch(() => setError('Erro de conexão'))  // Perde a causa real
```

**Regra:** Todo `.catch()` deve logar o erro original com contexto. Nunca engolir erros.

---

### 5.3. Console.* com contexto

```typescript
// ✅ CORRETO
console.error('[pg-notify] Erro ao escutar canais:', err)
console.error('[Evolution API] Erro:', status, body)
```

```typescript
// ❌ PROIBIDO — sem contexto
console.error(err)
console.error('Evolution API error', status, text)
```

**Regra:** Todo `console.error`/`console.warn` deve ter um prefixo com o nome do módulo entre colchetes.

---

### 5.4. Validação com Zod + enums

```typescript
// ✅ CORRETO
import { OrderChannel, OrderType } from '@prisma/client'

export const createOrderSchema = z.object({
  channel: z.nativeEnum(OrderChannel),
  type: z.nativeEnum(OrderType),
})
```

```typescript
// ❌ PROIBIDO — string genérica
channel: z.string(),
```

**Regra:** Sempre usar `z.nativeEnum()` do Prisma para campos com enum, nunca `z.string()`.

---

## 6. ESTRUTURA DE ARQUIVOS

### 6.1. Organização

```
src/
  backend/
    lib/              # Utilitários (auth, jwt, prisma, stripe, whatsapp)
    middleware.ts     # JWT + RBAC middleware (único)
    prisma/           # Schema, migrations, seed
    services/         # Lógica de negócio (order, product, kds, etc.)
  frontend/
    app/              # Next.js App Router (via symlink em app/)
    components/
      platform/       # Componentes da área logada (Sidebar, Header, etc.)
      public/         # Componentes do cardápio público (Cart, MenuViewer, etc.)
      ui/             # Componentes genéricos (Button, Card, Input, Badge)
    hooks/            # Custom hooks
    types/            # Tipos TypeScript
    public/           # Assets estáticos (manifest.json, sw.js, icons, images)
config/               # Configs (jest, tsconfig base)
docs-generated/       # Documentação gerada (análise, checklist, planos)
```

### 6.2. O que NÃO deve existir

- ❌ Diretórios de API vazios (só `.gitkeep` — remover ou implementar)
- ❌ Configs duplicadas (`config/` só deve ter o que é necessário)
- ❌ `_backup/` com múltiplos snapshots (manter só o zip atual)
- ❌ Arquivos `.gitkeep` em diretórios que já têm código

---

## 7. GIT

### 7.1. Commits

```powershell
# Formato:
<tipo>: <descrição>

# Tipos:
feat:     # Nova funcionalidade
fix:      # Correção de bug
docs:     # Documentação
refactor: # Refatoração sem mudança de comportamento
perf:     # Melhoria de performance
security: # Correção de segurança
chore:    # Tarefas de manutenção
test:     # Testes
```

**Regra:** Commits atômicos (uma preocupação por commit). Mensagens em português.

### 7.2. Branches

```powershell
# Convenção:
<type>/<descrição-curta>

# Exemplos:
fix/otimizacao-geral
feat/modulo-pagamentos
refactor/order-service
security/jwt-secrets
```

**Regra:** Nunca commitar diretamente na `main`. Sempre usar branches.

---

## 8. TESTES

### 8.1. Obrigatórios antes do commit

```powershell
# Sequência mínima antes de cada commit:
npm run typecheck     # Sem erros de tipo
npm test              # Todos passando
npm run build         # Compilando sem errors
```

### 8.2. Escrevendo testes

- Testes unitários em `__tests__/` seguindo o padrão `*.test.ts`
- Mock de dependências externas (jose, stripe, etc.) em `__mocks__/`
- Usar `describe` + `it` para organização

```typescript
process.env.JWT_ACCESS_SECRET = 'test-secret'  // Sempre setar env vars no topo

import { minhaFuncao } from '@/backend/lib/algo'

describe('Algo', () => {
  it('deve fazer X quando Y', async () => {
    const result = await minhaFuncao(input)
    expect(result).toBe(expected)
  })
})
```

---

## 9. CICLO DE TRABALHO

### Ao iniciar uma tarefa

```powershell
git checkout main
git pull
git checkout -b <tipo>/<descricao>
```

### Durante o desenvolvimento

1. Seguir as regras acima
2. Rodar `typecheck + test + build` a cada mudança significativa
3. Commits pequenos e atômicos

### Ao finalizar

```powershell
git add -A
git commit -m "<tipo>: <descrição clara>"
git push -u origin <branch>
```

### Para fazer deploy

1. Criar PR no GitHub
2. Revisar código
3. Fazer merge para `main`
4. Build de produção

---

## 10. LEITURAS RECOMENDADAS

| Assunto | Arquivo |
|---|---|
| Checklist completo | `docs-generated/CHECKLIST_MUDANCAS.md` |
| Passo a passo das correções | `docs-generated/PLANO_EXECUCAO.md` |
| Ordem de testes | `docs-generated/ORDEM_TESTES.md` |
| Análise completa do projeto | `docs-generated/ANALISE_COMPLETA_PROJETO.md` |
