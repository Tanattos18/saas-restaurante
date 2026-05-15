# Módulo 2 — Autenticação e Middleware

## Objetivo

Implementar o sistema completo de autenticação multi-tenant com JWT, middleware de proteção de rotas, login, registro e renovação de tokens.

---

## Como Testar

### Credenciais de Teste
O sistema inclui um botão **"🎯 Usar conta de teste"** na página de login que preenche automaticamente:
- **Restaurante:** `restaurante-teste`
- **Email:** `admin@restaurante.com`
- **Senha:** `admin123`

### Usuário Criado pelo Seed
O seed cria automaticamente:
- Tenant: `restaurante-teste`
- Usuário Owner: `admin@restaurante.com` / `admin123`
- Categorias e produtos de exemplo

---

## Arquivos Criados

### 1. `lib/jwt.ts`
- `signAccessToken(payload)` — JWT com expiração de 15 minutos (HS256)
- `signRefreshToken(payload)` — JWT com expiração de 7 dias (HS256)
- `verifyToken(token)` — valida contra access e refresh secret, retorna `JwtPayload | null` (nunca lança exceção)
- `JwtPayload`: `{ userId, tenantId, role, tenantSlug }`
- Usa biblioteca `jose` (não jsonwebtoken)

### 2. `lib/auth.ts`
- `getTokenFromRequest()` — lê cookie `access_token`
- `getAuthContext()` — decodifica e valida JWT, retorna `AuthContext | null`
- `AuthContext`: `{ userId, tenantId, role, tenantSlug }`

### 3. `lib/validations/auth.schema.ts`
- `loginSchema`: email, password, tenantSlug
- `registerSchema`: tenantName, tenantSlug (regex `[a-z0-9-]+`), ownerEmail, ownerPassword (min 8), ownerName

### 4. `middleware.ts`
- **Rotas públicas** (sem auth): `/login`, `/register`, `/forgot-password`, `/menu/*`, `/table/*`, `/api/health`, `/api/auth/*`, `/api/webhooks/*`
- **Rotas protegidas**: valida JWT, injeta headers (`x-tenant-id`, `x-user-id`, `x-user-role`, `x-tenant-slug`)
- **RBAC por prefixo**:
  - `/kds/*` → apenas KITCHEN, OWNER, MANAGER
  - `/financial/*` → apenas OWNER, MANAGER
  - `/settings/team/*` → apenas OWNER
- Se não autenticado: API → 401 JSON, página → redirect `/login?redirect=...`
- Matcher: todas as rotas exceto `_next/static`, `_next/image`, `favicon.ico`

### 5. `app/api/auth/login/route.ts`
- `POST { email, password, tenantSlug }`
- Valida com Zod → 400 se inválido
- Busca tenant por slug → 404 se não existir
- Verifica tenant ACTIVE → 403 se inativo
- Busca user por `[tenantId, email]` → 401 se não existir
- Compara bcrypt → 401 se senha errada
- Gera access + refresh tokens
- Salva `lastLoginAt` no user
- Seta cookies httpOnly:
  - `access_token` (15min)
  - `refresh_token` (7d)
- Retorna `{ user, tenant }`

### 6. `app/api/auth/register/route.ts`
- `POST { tenantName, tenantSlug, ownerEmail, ownerPassword, ownerName }`
- Valida com Zod → 400 se inválido
- Verifica slug único → 409 se existir
- Transaction: cria Tenant + User (OWNER) no mesmo bloco
- Trial de 14 dias para novos tenants
- Gera tokens e seta cookies (igual ao login)

### 7. `app/api/auth/refresh/route.ts`
- Lê `refresh_token` do cookie
- Valida com verifyToken
- Emite novo `access_token` (atualiza cookie)

### 8. `app/api/auth/logout/route.ts`
- Limpa cookies `access_token` e `refresh_token` (maxAge=0)

### 9. `app/api/auth/me/route.ts`
- Lê `getAuthContext()` do cookie
- Busca user completo + tenant no banco
- Retorna: id, name, email, role, phone, avatar, tenant (slug, name, plan, status, settings)

### 10. Páginas de Autenticação

#### `app/(auth)/layout.tsx`
- Layout centralizado com `max-w-md` em background muted

#### `app/(auth)/login/page.tsx`
- Formulário: restaurante (slug), email, senha
- Validação client-side
- Loading state no botão
- Links para cadastro e recuperar senha
- Redirect para `/[tenantSlug]/dashboard` após sucesso

#### `app/(auth)/register/page.tsx`
- Formulário: nome do restaurante, slug (auto-lowercase), nome, email, senha
- Slug com regex validation `[a-z0-9-]+`
- Redirect para `/[tenantSlug]/dashboard` após sucesso

#### `app/(auth)/forgot-password/page.tsx`
- Placeholder para recuperação de senha (TODO)
- Feedback visual de envio

---

## Fluxo de Autenticação

```
Browser                          Next.js                       Banco
  │                                │                             │
  │  POST /api/auth/login          │                             │
  │  {email, password, slug}       │                             │
  │ ──────────────────────────────►│                             │
  │                                │  SELECT Tenant WHERE slug   │
  │                                │ ───────────────────────────►│
  │                                │ ◄───────────────────────────│
  │                                │  SELECT User [tenantId,email]│
  │                                │ ───────────────────────────►│
  │                                │ ◄───────────────────────────│
  │                                │  bcrypt.compare             │
  │                                │  SignJWT (access + refresh) │
  │                                │  UPDATE lastLoginAt         │
  │                                │ ───────────────────────────►│
  │ ◄──────────────────────────────│                             │
  │ Set-Cookie: access_token(15m)  │                             │
  │ Set-Cookie: refresh_token(7d)  │                             │
  │ { user, tenant }               │                             │
  │                                │                             │
  │  GET /[slug]/dashboard         │                             │
  │  Cookie: access_token=...      │                             │
  │ ──────────────────────────────►│                             │
  │                                │  middleware.ts              │
  │                                │  verifyToken(access_token)  │
  │                                │  headers: x-tenant-id       │
  │                                │  headers: x-user-role       │
  │                                │  NextResponse.next()        │
  │ ◄──────────────────────────────│                             │
```

## Segurança

- Tokens armazenados em cookies **httpOnly** (não acessíveis via JS)
- **secure** em produção (HTTPS)
- **sameSite: lax** (previne CSRF)
- Access token: 15 minutos (curta duração)
- Refresh token: 7 dias
- Refresh tokens podem ser revogados (basta deletar o cookie)
- NUNCA extrai tenantId do client — sempre do JWT
- NUNCA usa `any` no TypeScript
- SEMPRE valida input com Zod antes de tocar no banco
- SEMPRE retorna `{ success, data?, error? }`
