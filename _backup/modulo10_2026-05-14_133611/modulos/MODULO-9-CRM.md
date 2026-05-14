# Módulo 9 — CRM e Fidelidade

## Objetivo
CRM de clientes WhatsApp e programa de fidelidade com pontos e níveis.

## Arquivos

### services/loyalty.service.ts
- earnPoints: R$1 = 1 ponto, atualiza nível e saldo
- redeemPoints: 100 pontos = R$5 (mínimo 100, múltiplos de 100)
- getBalance: saldo atual, vitalício, nível, próximo nível
- expirePoints: expira pontos com 365 dias
- getHistory: extrato paginado

Regras: BRONZE 0-499 | SILVER 500-999 | GOLD 1000-2499 | PLATINUM 2500+

### services/customer.service.ts
- list: busca por nome/telefone, filtro por nível
- getById: cliente + últimos 10 pedidos
- update: atualizar nome/endereço/telefone
- getTopCustomers: top 10 por gasto
- getChurnRisk: >30 dias sem pedir, >3 pedidos histórico

### Páginas
- /[slug]/customers: tabela com nome, telefone, pedidos, gasto, pontos, nível
- /[slug]/customers/[id]: perfil, pedidos, extrato de pontos
- /[slug]/loyalty: regras, níveis, top clientes, churn risk
