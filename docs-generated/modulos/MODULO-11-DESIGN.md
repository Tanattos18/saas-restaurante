# Módulo 11 — Design System e UX/UI

## Objetivo
Criar um design system coeso, melhorar a experiência do usuário e padronizar a interface do SaaS Restaurante seguindo as melhores práticas de UX.

---

## Melhorias de UX/UI Implementadas ✅ (15/05/2026)

### 1. Design System Base
- [x] Componentes UI reutilizáveis (Button, Card, Input, Modal, Badge, Toast, Icons)
- [x] Paleta de cores oficial: Emerald (#059669) como primary, Slate como neutro
- [x] Tipografia padronizada (system-ui, antialiased)
- [x] Sistema de espaçamento Tailwind (p-4, p-5, p-6, gap-4, gap-5, gap-6)
- [x] Sombras e bordas padronizadas (shadow-sm, rounded-xl, border-border)

### 2. Componentes Melhorados
- [x] Sidebar com 11 ícones SVG profissionais (não emoji) + indicador ativo
- [x] Header com avatar de iniciais, dropdown animado, badge de plano
- [x] Cards com hover states (shadow-md, -translate-y-0.5) e animações
- [x] Modais de confirmação padronizados (Modal.tsx)
- [x] Toasts/notificações consistentes (Toast.tsx + UpdateNotification)
- [x] Skeleton loading states (HeaderWrapper, ProductList, CategoryList)

### 3. Páginas Melhoradas
- [x] **Dashboard** — StatsCards com gradientes e animação de valor, gráficos Recharts com PieChart + legenda, RecentOrders com dots e hover
- [x] **Pedidos (Kanban)** — Filter pills, colunas com header gradiente, cards com badge de canal
- [x] **KDS** — Timer com pulse em urgência (>25min), notificação sonora, glass effect
- [x] **Produtos** — Input de busca com ícone, toggle suave, badge Promo, hover na linha
- [x] **Categorias** — Grid responsivo com toggle, hover, busca integrada

### 4. Animações e Interações
- [x] Animações CSS: fade-in, fade-in-up, scale-in, pulse-soft, slide-in-right
- [x] Loading spinners (border-emerald-500 com animate-spin)
- [x] Feedback visual em ações (hover, active, transition-all duration-200)
- [x] Hover effects em botões e cards com elevação suave

### 5. Responsividade
- [x] Sidebar collapsível em mobile com backdrop + animação
- [x] Grid adaptativo (grid-cols-1/2/3/4 conforme breakpoint)
- [x] Overflow-x-auto em tabelas e kanban

---

## Arquitetura do Design System

```
src/frontend/
├── components/
│   ├── ui/                    # Componentes do Design System
│   │   ├── Button.tsx         # Botão padrão
│   │   ├── Card.tsx           # Card base
│   │   ├── Input.tsx          # Input com label
│   │   ├── Select.tsx         # Select dropdown
│   │   ├── Modal.tsx          # Modal de confirmação
│   │   ├── Toast.tsx          # Notificações toast
│   │   ├── Badge.tsx          # Badge/label
│   │   ├── Skeleton.tsx       # Loading skeleton
│   │   ├── Avatar.tsx         # Avatar do usuário
│   │   └── Dropdown.tsx       # Menu dropdown
│   │
│   └── platform/              # Componentes específicos do app
│       └── (melhorados...)
```

---

## Cores Oficiais (Proposta)

| Cor | Hex | Uso |
|-----|-----|-----|
| Primary | #22c55e | Verde principal (iFood-style) |
| Primary Dark | #16a34a | Hover states |
| Secondary | #f97316 | Laranja (destaques) |
| Background | #ffffff | Fundo principal |
| Surface | #f8fafc | Cards e superfícies |
| Border | #e2e8f0 | Bordas e separadores |
| Text Primary | #1e293b | Texto principal |
| Text Secondary | #64748b | Texto secundário |
| Success | #22c55e | Sucesso |
| Warning | #f59e0b | Alerta |
| Error | #ef4444 | Erro |

---

## Tipografia

| Elemento | Tamanho | Peso |
|----------|---------|------|
| H1 | 32px | Bold (700) |
| H2 | 24px | Bold (700) |
| H3 | 20px | Semibold (600) |
| H4 | 16px | Semibold (600) |
| Body | 14px | Regular (400) |
| Small | 12px | Regular (400) |
| Caption | 11px | Medium (500) |

---

## Prioridade de Implementação

### Fase 1: Design System Core
1. Componentes UI base (Button, Card, Input, Badge)
2. Cores e tipografia globais
3. Toasts e notificações

### Fase 2: Componentes de Layout
4. Sidebar profissional
5. Header com avatar
6. Modais padronizados

### Fase 3: Páginas Melhoradas
7. Dashboard visual
8. Kanban de pedidos
9. KDS aprimorado

### Fase 4: Polish
10. Animações
11. Skeleton loading
12. Responsividade

---

## Stack Técnica

| Recurso | Tecnologia |
|---------|------------|
| Componentes | React (sem biblioteca externa) |
| Estilos | Tailwind CSS |
| Ícones | Lucide React (open source) |
| Animações | Framer Motion (opcional) |
| Fonts | Google Fonts (Inter, Poppins) |

---

## Como Implementar

### 1. Instalar Lucide React
```bash
npm install lucide-react
```

### 2. Criar variáveis no Tailwind
Adicionar cores customizadas no tailwind.config.ts

### 3. Criar componentes base
Iniciar com Button, Card, Input

### 4. Substituir gradualmente
Atualizar páginas existentes para usar novos componentes

---

## Status: ✅ COMPLETO (15/05/2026)

**Próximo passo:** Manter consistência visual em novos componentes