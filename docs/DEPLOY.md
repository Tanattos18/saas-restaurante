# Deploy — SaaS Restaurante

## 1. Vercel (Frontend + API)

```bash
# Instalar CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Variáveis de Ambiente no Vercel
```
DATABASE_URL=postgresql://...
JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
EVOLUTION_API_URL=https://evo.seusite.com
EVOLUTION_API_KEY=...
EVOLUTION_INSTANCE_NAME=saas
NEXT_PUBLIC_APP_URL=https://app.seusite.com
```

## 2. Banco de Dados (Neon.tech)

1. Criar conta em neon.tech
2. Criar projeto → copiar DATABASE_URL
3. Rodar migrations no deploy:
```bash
npx prisma migrate deploy
npx prisma db seed
```

## 3. Stripe

1. Criar produtos: BASIC (R$97), PRO (R$197), ENTERPRISE (R$497)
2. Configurar webhook: `https://app.seusite.com/api/webhooks/stripe`
3. Adicionar STRIPE_PRICE_BASIC, STRIPE_PRICE_PRO, STRIPE_PRICE_ENTERPRISE no .env

## 4. Domínio Customizado

1. Adicionar domínio no Vercel
2. Configurar DNS (CNAME para cname.vercel-dns.com)
3. Cada tenant usa subdomínio: `restaurante.seusite.com`

## 5. Checklist Pré-Lançamento

- [ ] Banco PostgreSQL rodando (Neon/Supabase/Railway)
- [ ] Migrations aplicadas
- [ ] Seed rodado
- [ ] Variáveis de ambiente configuradas
- [ ] Webhook Stripe configurado
- [ ] Evolution API rodando
- [ ] Webhook WhatsApp apontando para sua URL
- [ ] Domínio configurado com SSL
- [ ] Teste de login/registro funcional
- [ ] Teste de criação de pedido
