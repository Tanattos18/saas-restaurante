# ORDEM DE TESTES — SaaS Restaurante

> Sequência de testes para validar cada correção e garantir que nada quebrou.
> Execute na ordem abaixo após cada fase de mudanças.

---

## FASE DE PREPARAÇÃO

### Antes de qualquer mudança

```powershell
# 1. Build atual (registrar estado)
npm run build 2>&1 | Select-String "error|Error" | Tee-Object -FilePath "build-inicial.log"

# 2. Testes atuais
npm test 2>&1 | Tee-Object -FilePath "testes-iniciais.log"

# 3. Lint atual
npm run lint 2>&1 | Tee-Object -FilePath "lint-inicial.log"

# 4. Typecheck atual
npm run typecheck 2>&1 | Tee-Object -FilePath "typecheck-inicial.log"
```

**Critério de aceite:** Logs salvos para comparação futura.

---

## PÓS-FASE 1 — CORREÇÕES CRÍTICAS

### □ Teste 1.1 — Build

```powershell
npm run build 2>&1
```

**Esperado:** ✅ Compila sem errors (warnings são aceitáveis)  
**Se falhar:** Verificar erros de compilação no output

---

### □ Teste 1.2 — TypeScript

```powershell
npm run typecheck 2>&1
```

**Esperado:** ✅ Sem saída (sucesso)  
**Se falhar:** Corrigir erros de tipo apontados

---

### □ Teste 1.3 — Testes unitários

```powershell
npm test 2>&1
```

**Esperado:** ✅ Todos os testes passando  
**Se falhar:** Identificar suite com falha e corrigir

---

### □ Teste 1.4 — Lint

```powershell
npm run lint 2>&1
```

**Esperado:** ✅ Sem errors (warnings são aceitáveis)  
**Se falhar:** Corrigir erros de lint apontados

---

### □ Teste 1.5 — Verificar symlink app/

```powershell
Get-Item "app" | Select-Object Name, LinkType, Target
```

**Esperado:** ✅ `LinkType = SymbolicLink`, `Target` aponta para `src/frontend/app`  
**Se falhar:** Recriar symlink (ver Passo 1.1 do plano)

---

### □ Teste 1.6 — Verificar JWT

```powershell
# Verificar que verifyToken não existe mais (foi substituído)
Select-String -Path "src" -Pattern "export async function verifyToken" -SimpleMatch
```

**Esperado:** ✅ Nenhum resultado (função renomeada)  
**Se falhar:** Verificar se ainda há referência a `verifyToken` que não foi atualizada

---

### □ Teste 1.7 — Verificar tenant-prisma

Verificar manualmente que os métodos adicionados no `tenant-prisma.ts` estão presentes:

```powershell
Select-String -Path "src/backend/lib/tenant-prisma.ts" -Pattern "async (findUnique|update|delete|upsert|findFirstOrThrow|findUniqueOrThrow|createMany)"
```

**Esperado:** ✅ 7 métodos listados  
**Se falhar:** Adicionar métodos faltantes

---

## PÓS-FASE 2 — SEGURANÇA E PERFORMANCE

### □ Teste 2.1 — Layout sem CDN

```powershell
Select-String "cdn.tailwindcss" "app/layout.tsx"
```

**Esperado:** ✅ Nenhum resultado  
**Se falhar:** Remover linha do CDN

---

### □ Teste 2.2 — CSS consolidado

```powershell
Select-String "dangerouslySetInnerHTML" "app/layout.tsx"
```

**Esperado:** ✅ Nenhum resultado (style inline removido)  
**Se falhar:** Remover bloco `<style>` do layout

---

### □ Teste 2.3 — Animações no globals.css

```powershell
Select-String "@keyframes" "app/globals.css"
```

**Esperado:** ✅ 5 keyframes encontrados (fade-in-up, fade-in, scale-in, pulse-soft, ping-soft)  
**Se falhar:** Mover animações do layout para globals.css

---

### □ Teste 2.4 — Build completo

```powershell
npm run build 2>&1
```

**Esperado:** ✅ Compila sem errors  
**Se falhar:** Verificar erros de compilação

---

### □ Teste 2.5 — Testes

```powershell
npm test 2>&1
```

**Esperado:** ✅ Todos passando  
**Se falhar:** Corrigir testes

---

### □ Teste 2.6 — Verificar 'use client' removido

```powershell
# Listar componentes que ainda têm 'use client' desnecessário
Get-ChildItem -Path "src/frontend/components/ui" -Filter "*.tsx" | ForEach-Object {
  $content = Get-Content $_.FullName -First 1
  if ($content -eq "'use client'") {
    Write-Host "$($_.Name) ainda tem 'use client'"
  }
}
```

**Esperado:** ✅ Badge.tsx, Card.tsx, Button.tsx, Input.tsx, Textarea.tsx NÃO têm 'use client'  
**Se falhar:** Remover 'use client' desses arquivos

---

## PÓS-FASE 3 — LIMPEZA

### □ Teste 3.1 — Verificar builds após limpeza

```powershell
npm run typecheck 2>&1
npm run build 2>&1
```

**Esperado:** ✅ Ambos passando  
**Se falhar:** Verificar se alguma dependência removida quebrou imports

---

### □ Teste 3.2 — Dependências não utilizadas

```powershell
Select-String -Path "src" -Pattern "@upstash/ratelimit|@upstash/redis|ts-node|tailwindcss-animate" -SimpleMatch
```

**Esperado:** ✅ Nenhum import encontrado no código fonte  
**Se falhar:** Reinstalar dependência se estiver sendo usada

---

### □ Teste 3.3 — Verificar APIs removidas

Se removeu diretórios de API vazios:

```powershell
# Verificar se as rotas removidas não são acessadas em lugar nenhum
Select-String -Path "src" -Pattern "chat/send|chat/sessions" -SimpleMatch
```

**Esperado:** ✅ Nenhuma referência a rotas removidas  
**Se falhar:** Manter diretório se referenciado em algum lugar

---

### □ Teste 3.4 — Encoding dos arquivos

```powershell
# Verificar que não há encoding corrompido
npm run build 2>&1 | Select-String "valid UTF-8"
```

**Esperado:** ✅ Nenhum erro de UTF-8  
**Se falhar:** Re-encode dos arquivos corrompidos

---

## PÓS-FASE 4 — MELHORIAS LONGO PRAZO

### □ Teste 4.1 — Zod v4

```powershell
npm run typecheck 2>&1
npm test 2>&1
```

**Esperado:** ✅ Sem erros de tipo e todos os testes passando  
**Se falhar:** Ajustar schemas Zod para compatibilidade v4

---

### □ Teste 4.2 — Prisma migrate (indexes + constraints)

```powershell
npx prisma migrate dev --name add_indexes 2>&1
npx prisma migrate dev --name add_unique_constraints 2>&1
npx prisma generate 2>&1
npm run build 2>&1
```

**Esperado:** ✅ Migrations criadas, Prisma gerado, build passa  
**Se falhar:** Verificar conflitos de schema

---

### □ Teste 4.3 — KitchenDeviceOrder

```powershell
npx prisma migrate dev --name create_kitchen_device_order 2>&1
npm run build 2>&1
npm test 2>&1
```

**Esperado:** ✅ Migrations + build + testes  
**Se falhar:** Verificar se `kds.service.ts` foi atualizado para usar nova relação

---

### □ Teste 4.4 — Endpoints de API

```powershell
# Para cada endpoint implementado, testar chamada HTTP
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health

# Ou testar com imports (teste unitário)
npm test 2>&1
```

**Esperado:** ✅ Endpoints retornam status esperado (200, 201, etc.)  
**Se falhar:** Verificar lógica do endpoint

---

### □ Teste 4.5 — Error boundaries

```powershell
npm run build 2>&1
```

**Esperado:** ✅ Build passa (error boundaries são detectados pelo Next.js)  
**Verificação manual:** Navegar para rota inexistente e ver se error boundary aparece

---

### □ Teste 4.6 — Sidebar com props

```powershell
npm run build 2>&1
Select-String "Plano PRO" "src/frontend/components/platform/Sidebar.tsx"
```

**Esperado:** ✅ Build passa + "Plano PRO" NÃO aparece hardcoded no Sidebar.tsx  
**Se falhar:** Verificar se ainda há valores hardcoded

---

### □ Teste 4.7 — Logger estruturado

```powershell
npm run typecheck 2>&1
```

**Esperado:** ✅ Sem erros de tipo  
**Verificação manual:** Rodar app e verificar se logs aparecem no console

---

## TESTE DE REGRESSÃO COMPLETO

> Execute APÓS todas as fases estarem concluídas.

### □ Regressão 1 — Pipeline completo

```powershell
Write-Host "=== INÍCIO DA REGRESSÃO ===" -ForegroundColor Cyan

Write-Host "1/6 - Typecheck..." -NoNewline
$t = npm run typecheck 2>&1
if ($LASTEXITCODE -eq 0) { Write-Host " ✅" -ForegroundColor Green } else { Write-Host " ❌" -ForegroundColor Red; $t }

Write-Host "2/6 - Build..." -NoNewline
$b = npm run build 2>&1
if ($LASTEXITCODE -eq 0) { Write-Host " ✅" -ForegroundColor Green } else { Write-Host " ❌" -ForegroundColor Red; $b }

Write-Host "3/6 - Testes..." -NoNewline
$t2 = npm test 2>&1
if ($LASTEXITCODE -eq 0) { Write-Host " ✅" -ForegroundColor Green } else { Write-Host " ❌" -ForegroundColor Red; $t2 }

Write-Host "4/6 - Lint..." -NoNewline
$l = npm run lint 2>&1
$hasErrors = $l | Select-String "Error"
if (-not $hasErrors) { Write-Host " ✅" -ForegroundColor Green } else { Write-Host " ❌" -ForegroundColor Red; $l }

Write-Host "5/6 - Symlink..." -NoNewline
$s = Get-Item "app" | Select-Object -ExpandProperty LinkType
if ($s -eq "SymbolicLink") { Write-Host " ✅" -ForegroundColor Green } else { Write-Host " ❌" -ForegroundColor Red }

Write-Host "6/6 - JWT functions..." -NoNewline
$j = Select-String -Path "src/backend/lib/jwt.ts" -Pattern "verifyAccessToken|verifyRefreshToken"
if ($j.Count -ge 2) { Write-Host " ✅" -ForegroundColor Green } else { Write-Host " ❌" -ForegroundColor Red }

Write-Host "=== REGRESSÃO CONCLUÍDA ===" -ForegroundColor Cyan
```

**Esperado:** ✅ Todos os 6 checks verdes  
**Se falhar:** Corrigir o item que falhou antes de fazer deploy

---

## TESTE DE BUILD PARA DEPLOY

### □ Build final de produção

```powershell
# Clean build
Remove-Item -Recurse -LiteralPath ".next" -Force -ErrorAction SilentlyContinue
npm run build 2>&1
```

**Esperado:** ✅ Build limpo sem errors, todas as rotas listadas  
**Verificar:**
- Nenhum `Error` no output
- Nenhum `Failed to compile`
- Todas as rotas esperadas aparecem na tabela de rotas

---

## TABELA RESUMO DE TESTES

| Fase | Teste | Comando | Critério |
|---|---|---|---|
| Preparação | Build inicial | `npm run build` | Log salvo |
| Preparação | Testes iniciais | `npm test` | Log salvo |
| Pós-Fase 1 | Build | `npm run build` | ✅ Compila |
| Pós-Fase 1 | TypeScript | `npm run typecheck` | ✅ Sem erros |
| Pós-Fase 1 | Testes | `npm test` | ✅ 6/6 passam |
| Pós-Fase 1 | Lint | `npm run lint` | ✅ Sem errors |
| Pós-Fase 1 | Symlink | `Get-Item app` | ✅ É symlink |
| Pós-Fase 1 | JWT | `Select-String verifyToken` | ✅ Não existe mais |
| Pós-Fase 1 | tenant-prisma | `Select-String` métodos | ✅ 7 métodos |
| Pós-Fase 2 | Build | `npm run build` | ✅ Compila |
| Pós-Fase 2 | Testes | `npm test` | ✅ Passam |
| Pós-Fase 2 | CDN | `Select-String cdn.tailwindcss` | ✅ Não encontrado |
| Pós-Fase 2 | CSS inline | `Select-String dangerouslySetInnerHTML` | ✅ Não encontrado |
| Pós-Fase 2 | 'use client' | Check em ui/ | ✅ Só onde necessário |
| Pós-Fase 3 | Build pós-limpeza | `npm run build` | ✅ Compila |
| Pós-Fase 3 | Dependências | `Select-String @upstash` | ✅ Não usadas |
| Pós-Fase 4 | Migrations | `npx prisma migrate` | ✅ Criadas |
| Pós-Fase 4 | Build final | `npm run build` | ✅ Compila |
| Regressão | Completo | Script de regressão | ✅ 6/6 checks |
| Deploy | Clean build | `Remove-Item .next + build` | ✅ Sem errors |
