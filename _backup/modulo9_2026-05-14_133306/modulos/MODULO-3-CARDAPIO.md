# Módulo 3 — CRUD de Cardápio

## Objetivo
Implementar CRUD completo de categorias e produtos com validação, controle de estoque e interface administrativa.

## Arquivos

### Schemas (lib/validations/product.schema.ts)
- categorySchema: name, description, icon, position, active, showInQRCode
- productSchema: name, description, price, promoPrice (< price), categoryId, preparationTime, calories, isVegan, isGlutenFree, stock, minStock
- stockUpdateSchema: quantity, reason
- reorderSchema: orderedIds

### Services
- categoryService: list, getById, create, update, delete (bloqueia com produtos ativos), reorder
- productService: list (filtros), getById, create, update, delete, toggleActive, updateStock, getOutOfStock

### API Routes
- `GET/POST /api/categories`
- `GET/PATCH/DELETE /api/categories/[id]`
- `POST /api/categories/reorder`
- `GET/POST /api/products` (com ?categoryId=, ?search=, ?active=)
- `GET/PATCH/DELETE /api/products/[id]`
- `POST /api/products/[id]/toggle`
- `POST /api/products/[id]/stock`

### Componentes
- ProductList: tabela com busca, toggle ativo/inativo, preço/promoção, estoque
- ProductForm: create/edit com react-hook-form manual, validação client-side
- StockAlert: alerta de produtos com estoque abaixo do mínimo

### Páginas
- /[tenantSlug]/menu → listagem com alerta de estoque
- /[tenantSlug]/menu/new → formulário de criação
- /[tenantSlug]/menu/[id] → formulário de edição

## Regras de Negócio
- promoPrice sempre menor que price
- Ao deletar categoria, bloqueia se tiver produtos ativos
- Stock null = ilimitado
- Estoque não pode ficar negativo
