# 📖 Manual de Trabalho — SaaS Restaurante

## Como este projeto está sendo desenvolvido

---

## 1. Visão Geral do Fluxo

Cada módulo segue este ciclo rigorosamente:

```
1. PLANEJAMENTO → Revisar o que o módulo precisa (INDEX.md ou CHECKLIST.md)
2. CRIAÇÃO      → Escrever todos os arquivos do módulo
3. VALIDAÇÃO    → Rodar testes (Prisma + TypeScript)
4. CORREÇÃO     → Ajustar erros até 0
5. BACKUP       → Salvar cópia local + metadados
6. GIT          → Commit, tag, push para GitHub
7. DOCUMENTAÇÃO → Criar MODULO-N-NOME.md na pasta modulos/
8. CHECKLIST    → Atualizar CHECKLIST.md com os itens concluídos
```

---

## 2. Stack Tecnológica (fixa, não alterar)

| Categoria | Tecnologia | Motivo |
|-----------|------------|--------|
| Framework | Next.js 15 + App Router | SSR, API routes, file-based routing |
| Linguagem | TypeScript strict | `strict: true`, `noUncheckedIndexedAccess: true` |
| ORM | Prisma 6 | `$extends` para multi-tenant, migrations |
| Auth | JWT (jose) | `jose` é nativo Edge, não precisa de `jsonwebtoken` |
| Banco | PostgreSQL | LISTEN/NOTIFY para real-time |
| UI | Tailwind CSS v4 + shadcn/ui | CSS nativo, sem `tailwind.config.ts` |
| Validação | Zod | Schemas em `lib/validations/` |
| WhatsApp | Evolution API v2 | self-hosted, HTTP REST |
| Pagamentos | Stripe | Assinaturas dos restaurantes |
| Real-time | PostgreSQL LISTEN/NOTIFY | Sem custo extra, <100ms latência |

---

## 3. Como criar arquivos

### Problema conhecido: colchetes `[]` no caminho

No Windows PowerShell 5.1, caminhos com `[id]` ou `[tenantSlug]` **quebram** o `Set-Content` e `New-Item` porque `[]` são caracteres curinga do PowerShell.

**Sempre usar este padrão** para arquivos em pastas com colchetes:

```powershell
$root = "C:\Users\Joás Santana\Documents\SaaS\PROMPT SISTEMA — SaaS Restaurante\saas-restaurante"

$content = @'
... código aqui ...
'@

[System.IO.File]::WriteAllText("$root\app\api\products\[id]\route.ts", $content, [System.Text.UTF8Encoding]::new($false))
```

Para pastas SEM colchetes, `Set-Content` funciona normalmente:

```powershell
Set-Content -Path "pasta\arquivo.ts" -Value $content -Encoding UTF8
```

### Estrutura de pastas do projeto

```
saas-restaurante/
├── app/                    # Next.js App Router
│   ├── (auth)/             # Login, register, forgot-password
│   ├── (platform)/         # Área logada (dashboard, menu, kds...)
│   ├── (public)/           # Cardápio público (menu, table)
│   └── api/                # API REST (Route Handlers)
├── components/             # React components
│   ├── ui/                 # shadcn/ui
│   ├── platform/           # Componentes da área logada
│   └── public/             # Componentes do cardápio público
├── lib/                    # Utilitários (prisma, jwt, auth, whatsapp, pg-notify)
├── services/               # Lógica de negócio (cada domínio em um arquivo)
├── hooks/                  # Custom hooks React
├── types/                  # Tipos TypeScript
├── prisma/                 # Schema, migrations, seed
├── modulos/                # Documentação de cada módulo
├── _backup/                # Backups físicos
├── docs/                   # Documentação de deploy
├── __tests__/              # Testes Jest
├── .env.example            # Template de variáveis de ambiente
├── middleware.ts           # Next.js Middleware (auth + RBAC)
├── CHECKLIST.md            # Acompanhamento de progresso
├── INDEX.md                # Roadmap geral
└── MANUAL-DE-TRABALHO.md   # Este arquivo
```

---

## 4. Padrões de Código (REGRAS INVARIÁVEIS)

### 4.1. Nunca usar `any`

Proibido em todo o código. Alternativas:
- `unknown` com type narrowing
- `Record<string, unknown>` para objetos genéricos
- Tipos explícitos em todos os parâmetros e retornos

### 4.2. Retorno de API sempre `{ success, data?, error? }`

Toda API route deve retornar neste formato:

```typescript
{ success: true, data: { ... } }           // Sucesso
{ success: false, error: "Mensagem" }      // Erro
```

### 4.3. Validar input com Zod antes de tocar no banco

```typescript
const parsed = schema.safeParse(body)
if (!parsed.success) {
  return NextResponse.json(
    { success: false, error: parsed.error.errors[0]?.message },
    { status: 400 }
  )
}
```

### 4.4. Tratar erros com try/catch

Toda route handler deve ter try/catch. Logar o erro com `console.error` e retornar 500.

### 4.5. Multi-tenant: tenantId sempre do servidor

- **Nunca** extrair tenantId do client (body, query params)
- Sempre do JWT (via `getAuthContext()`) ou header `x-tenant-id`
- Prisma recebe tenantId como **parâmetro explícito** via `createTenantPrisma(tenantId)`

### 4.6. Serviços seguem o padrão factory

```typescript
export function productService(tenantId: string) {
  const db = createTenantPrisma(tenantId)
  return {
    async list() { return db.product.findMany() },
    async create(data) { return db.product.create({ data: { tenantId, ...data } }) },
  }
}
```

### 4.7. Service + Route Pattern

- **Services** (`services/*.ts`) contêm lógica de negócio pura
- **Routes** (`app/api/*/route.ts`) contêm apenas HTTP handling (parse, validação, response)
- Services nunca tocam em `request`, `response`, `cookies`, `headers`

---

## 5. Processo de Validação

Após criar todos os arquivos de um módulo, rodar nesta ordem:

```powershell
# 1. Validar schema Prisma
$env:DATABASE_URL = "postgresql://user:pass@localhost:5432/saas-restaurante"
npx prisma validate

# 2. Verificar erros de TypeScript
npx tsc --noEmit
```

**Nunca commitar com erros de TypeScript.** Se houver erros, corrigir até `tsc --noEmit` retornar sem saída.

### Erros comuns e soluções:

| Erro | Causa | Solução |
|------|-------|---------|
| `Type 'X' is not assignable to type 'Y'` | Tipo incompatível | Ajustar tipo ou usar cast com `as` |
| `Object is possibly 'undefined'` | Chamada após findUnique | Usar `!` ou early return |
| `Property 'tenantId' is missing` | Service sem tenantId | Adicionar `{ tenantId, ...data }` no create |
| `Module '"./x"' has no exported member` | Export faltando | Adicionar `export` na interface/função |
| `BOM / Unicode BOM` | PowerShell adicionou BOM | Remover com `[System.IO.File]::WriteAllText` |

---

## 6. Backup Local

### Estrutura

```
_backup/
├── backup.ps1              # Script de gerenciamento
├── modulo1_2026-05-14_122713/   # Cópia completa do módulo 1
│   ├── _metadata.json      # Metadados (data, git commit, versões)
│   └── ...                 # Cópia de todos os arquivos
├── modulo2_2026-05-14_123311/
└── ...
```

### Como criar backup

```powershell
.\_backup\backup.ps1 criar             # Cria backup automático
.\_backup\backup.ps1 criar "modulo-x"  # Backup nomeado
.\_backup\backup.ps1 listar            # Lista backups
.\_backup\backup.ps1 restaurar "modulo1_..."  # Restaura (cuidado!)
```

Ou manualmente (padrão usado até agora):

```powershell
$data = Get-Date -Format "yyyy-MM-dd_HHmmss"
$dest = "_backup\moduloN_$data"
New-Item -ItemType Directory -Path $dest -Force | Out-Null
Get-ChildItem -Path "." -Exclude @('node_modules', '.next', '.git', '_backup', '*.log', 'package-lock.json') | ForEach-Object {
    if ($_.PSIsContainer) { Copy-Item -Path $_.FullName -Destination $dest -Recurse -Force }
    else { Copy-Item -Path $_.FullName -Destination $dest -Force }
}
```

---

## 7. Git Workflow

### Commits

```powershell
git add -A
git commit -m "tipo: descrição curta

- bullet points das mudanças
- cada arquivo principal listado"
```

**Tipos de commit:**
- `feat:` — nova funcionalidade (módulo completo)
- `fix:` — correção de bug
- `chore:` — tarefa de manutenção
- `docs:` — documentação
- `refactor:` — refatoração

### Tags (pontos de restauração)

Sempre criar uma tag por módulo concluído:

```powershell
git tag -a v0.N-moduloN -m "Backup: Modulo N concluido - Nome"
git push origin v0.N-moduloN
```

Se precisar atualizar uma tag existente:

```powershell
git tag -d v0.N-moduloN               # Deletar local
git push origin --delete v0.N-moduloN # Deletar remoto
git tag -a v0.N-moduloN -m "..."      # Recriar
git push origin v0.N-moduloN           # Enviar
```

### Push

```powershell
git push origin main
git push origin v0.N-moduloN   # Enviar tag
```

### Tags existentes (histórico):

| Tag | Módulo | Descrição |
|-----|--------|-----------|
| v0.1-estrutura-inicial | - | Estrutura de pastas + INDEX.md |
| v0.2-modulo1 | 1 | Base do Projeto (schema, prisma, seed) |
| v0.3-modulo2 | 2 | Autenticação e Middleware |
| v0.4-modulo3 | 3 | CRUD de Cardápio |
| v0.5-modulo4 | 4 | Bot WhatsApp |
| v0.6-modulo5 | 5 | KDS Kitchen Display System |

---

## 8. Documentação dos Módulos

Cada módulo concluído gera um arquivo em `modulos/`:

```
modulos/
├── MODULO-1-BASE.md
├── MODULO-2-AUTH.md
├── MODULO-3-CARDAPIO.md
├── MODULO-4-WHATSAPP.md
└── MODULO-5-KDS.md
```

Formato: explicar cada arquivo criado, o que faz, decisões técnicas, e como testar.

---

## 9. Acompanhamento (CHECKLIST.md)

O arquivo `CHECKLIST.md` na raiz contém todos os itens de todos os módulos.

Ao concluir um item: mudar de `🔴` para `🟢`
Ao concluir um módulo: atualizar a tabela de resumo no final

```markdown
| Módulo N — Nome | X | X | 100% |
| **Total** | **88** | **43** | **49%** |
```

---

## 10. Comandos Úteis

### Desenvolvimento

```bash
npm run dev          # Iniciar servidor Next.js
npm run build        # Build de produção
npm run typecheck    # TypeScript check
npm run lint         # ESLint
```

### Banco de Dados (precisa de PostgreSQL rodando)

```bash
npm run db:migrate   # Criar migration
npm run db:seed      # Popular banco
npm run db:studio    # Abrir Prisma Studio
npm run db:reset     # Resetar banco
```

### Git

```bash
git status           # Ver estado
git log --oneline    # Ver histórico
git tag -l           # Listar tags
git checkout v0.6-modulo5  # Restaurar ponto específico
```

---

## 11. Problemas Conhecidos e Soluções

### BOM (Byte Order Mark) em arquivos

**Sintoma:** Erro `Unexpected token '﻿'` ao rodar `prisma validate` ou `node`.
**Causa:** PowerShell `Set-Content` adiciona BOM UTF-8.
**Solução:**

```powershell
$content = Get-Content "arquivo" -Raw
[System.IO.File]::WriteAllText((Resolve-Path "arquivo"), $content, [System.Text.UTF8Encoding]::new($false))
```

### Colchetes em caminhos do PowerShell

**Sintoma:** `Set-Content` falha ou arquivo não é criado.
**Causa:** `[]` são caracteres curinga no PowerShell.
**Solução:** Usar `[System.IO.File]::WriteAllText` com caminho absoluto.

### Prisma + TypeScript com `$extends` create

**Sintoma:** `Property 'tenantId' is missing in type` ao chamar `db.x.create()`.
**Causa:** O `$extends` injeta tenantId em runtime, mas TypeScript não sabe disso.
**Solução:** Sempre passar `{ tenantId, ...data }` explicitamente nos creates.

---

## 12. Próximos Módulos (ordem fixa)

| # | Módulo | Dependente de |
|---|--------|---------------|
| 6 | QR Code e Cardápio Público | Módulo 3 (cardápio) |
| 7 | Dashboard e Pedidos | Módulo 3 (produtos) |
| 8 | Stripe e Assinaturas | Módulo 2 (auth) |
| 9 | CRM e Fidelidade | Módulo 4 (clientes WhatsApp) |
| 10 | Refinamentos Finais | Todos anteriores |

---

> **Última atualização:** 14/05/2026
> **Node.js:** v24.14.1 | **npm:** 11.11.0 | **Prisma:** 6.19.3
