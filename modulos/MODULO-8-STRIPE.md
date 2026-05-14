# Módulo 8 — Stripe e Assinaturas

## Objetivo
Integração com Stripe para assinaturas mensais e geração de PIX para pedidos.

## Arquivos

### lib/stripe.ts
- Instância Stripe configurada
- PLANS: FREE (R$0), BASIC (R$97), PRO (R$197), ENTERPRISE (R$497)
- Cada plano com: priceId, maxOrders, features

### services/stripe.service.ts
- createCustomer: cria/cliente Stripe, salva stripeCustomerId
- createSubscription: checkout session com trial de 14 dias
- getPortalUrl: customer portal para gerenciar assinatura
- cancelSubscription: cancela no Stripe + marca CANCELED
- handleWebhook: trata checkout.completed, invoice.*, subscription.deleted

### API Routes
- POST /api/webhooks/stripe — webhook Stripe (verifica signature)
- POST /api/payment/stripe/create-checkout → { url }
- POST /api/payment/stripe/portal → { url }
- POST /api/payment/pix/create → { pixCode, pixQrCode, expiresAt }

### Página de Assinatura (/[slug]/settings/subscription)
- Plano atual com status
- Tabela comparativa de todos os planos
- Botão Assinar por plano
- Botão Gerenciar (Customer Portal)
- Alerta PAST_DUE

### Plano no JWT + Middleware
- plan adicionado ao payload do JWT
- Header x-tenant-plan no middleware
- Order service verifica limite de pedidos/mês (FREE = 50)
