# Módulo 6 — QR Code e Cardápio Público

## Objetivo
Geração de QR Codes para mesas, cardápio digital público e pedido na mesa.

## Arquivos

### services/qr-code.service.ts
- generateTableQR, generateMenuQR, generatePixQR — retornam data URLs
- generateTables — gera QR Codes para múltiplas mesas
- getTenantBySlug, getMenuData — dados públicos do cardápio

### API Routes
- GET /api/qr-code/tables?tables=1,2,3 → array de { tableNumber, qrCodeDataUrl }
- GET /api/menu/[tenantSlug] → dados públicos do restaurante (categorias + produtos)
- POST /api/orders → cria pedido público (sem auth)

### Cardápio Público — /menu/[tenantSlug]
- Server Component com SEO (meta tags)
- Design mobile-first (max-w-lg)
- Filtro por categoria (tabs horizontais sticky)
- Card de produto com nome, descrição, preço, badges (vegan, sem glúten)
- Cache revalidate a cada 5 min (via fetch)

### Pedido na Mesa — /table/[tenantSlug]/[tableNumber]
- Client Component com carrinho
- MenuViewer + ProductCard + Cart + Checkout
- Checkout: nome, observações, escolha de pagamento (PIX/Dinheiro/Cartão)
- Cria Order com channel=QR_CODE, type=DINE_IN

### Gestão de QR Codes — /[tenantSlug]/qr-code
- Input para números de mesas (ex: 1,2,3,4,5)
- Preview dos QR Codes
- Download individual PNG
- Impressão em lote
