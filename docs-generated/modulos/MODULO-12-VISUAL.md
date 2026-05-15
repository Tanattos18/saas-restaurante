# Módulo 12 — Refinamentos Visuais (15/05/2026)

## Objetivo
Refinar completamente a interface visual do painel administrativo, tornando-o mais elegante, moderno e responsivo.

---

## Design System

### Paleta de Cores
| Cor | Hex | Uso |
|-----|-----|-----|
| Primary (Emerald) | #059669 | Botões, links, acentos |
| Primary Dark | #10b981 | Hover, dark mode |
| Background | #f8fafc | Fundo principal (slate-50) |
| Card | #ffffff | Cards e superfícies |
| Muted | #f1f5f9 | Fundos secundários |
| Muted Foreground | #64748b | Texto secundário |
| Border | #e2e8f0 | Bordas e separadores |
| Foreground | #0f172a | Texto principal |

### Tema Escuro
- Background: #0f172a, Card: #1e293b, Border: #334155
- Primary: #10b981 (verde mais claro para contraste)

### Animações
- `fade-in`: 0.3s ease-out (opacidade + translateY 4px)
- `fade-in-up`: 0.4s ease-out (opacidade + translateY 12px)
- `scale-in`: 0.2s ease-out (scale 0.95 → 1)
- `pulse-soft`: 2s ease-in-out (opacidade 1 → 0.7)
- `stagger-N`: Entrada em cascata para listas

---

## Componentes Refatorados

### StatsCards
- Gradiente inferior (`bg-gradient-to-r from-emerald-500 to-emerald-600`)
- Fundo com opacidade por card (blue-50, emerald-50, violet-50, amber-50)
- Ícones SVG únicos por card
- `AnimatedValue`: contagem animada de 0 até o valor final
- Indicador `ping` nos cards de pendentes
- Entrada com `stagger-1` a `stagger-4`
- Hover: `hover:shadow-md hover:-translate-y-0.5`

### SalesChart
- BarChart com gradiente (última barra em destaque: emerald-500, demais: emerald-100)
- PieChart com `innerRadius` (donut) e cores por canal
- Legenda lateral com percentual
- `CustomTooltip` estilizado com card e sombra
- Margens e labels refinados

### RecentOrders
- Dots coloridos por status (`bg-amber-500`, `bg-emerald-500`, etc.)
- Ícone do canal (💬 📱 🏪 📞 🟢)
- Horário do pedido (formato HH:mm)
- Link para detalhe do pedido
- Hover com elevação e borda verde
- Animation delay progressivo

### Sidebar
- 11 ícones SVG do `Icons.tsx` substituindo emojis
- Indicador de item ativo (barra vertical verde `w-0.5 h-5`)
- Badge de notificação com `animate-scale-in`
- Logo com gradiente e hover scale
- Mobile com backdrop blur e animação slide
- Footer com plano e restaurante

### HeaderWrapper
- Avatar com iniciais (`getInitials`)
- Dropdown com `animate-scale-in origin-top-right`
- Badge de plano colorido (FREE/BASIC/PRO/ENTERPRISE)
- Loading skeleton com pulse
- Ícone de seta com rotação

### OrderKanban
- Filter pills com estilo toggle (`ring-1 ring-emerald-200`)
- Colunas com header gradiente (`bg-gradient-to-r from-amber-500 to-amber-600`)
- Badge de contagem no canto
- Empty state com ícone SVG
- Animation delay nos cards

### OrderCard
- Borda esquerda colorida por status (`border-l-[3px]`)
- Badge de canal com fundo `bg-muted/50`
- Status dot no canto superior direito
- Contagem de itens formatada ("X itens")
- Hover elevado

### KitchenBoard (KDS)
- Fundo gradiente (`from-slate-900 via-slate-900 to-slate-800`)
- Header sticky com glass effect e backdrop-blur
- Status online/offline com pulse
- Colunas com gradiente + badge de contagem
- Empty state por coluna
- Timer com pulse em vermelho (>25min)

### OrderTicket
- Ícones SVG para cliente e observações
- Destaque em âmbar para `kitchenNotes`
- Botão de ação com sombra (`shadow-lg shadow-black/20`)
- Background `bg-slate-800` com borda sutil

### ProductList
- Input de busca com ícone SVG (`search`)
- Toggle ativo/inativo estilizado (`w-10 h-6`, translate-x-5)
- Badge "Promo" em verde
- Link "Editar" com ícone de seta
- Hover na linha com `bg-muted/30`
- Animation delay progressivo

### CategoryList
- Grid responsivo (1-4 colunas)
- Input de busca com ícone
- Toggle suave (h-5.5 w-9)
- Botões editar/excluir com ícones SVG
- Hover no card com elevação
- Animation delay progressivo

### StockAlert
- Ícone de alerta (`@heroicons` style)
- Fundo âmbar suave (`bg-amber-50`)
- Bullet points com `w-1 h-1 rounded-full`
- Texto truncado com `truncate`

---

## Pipeline CSS

### Problema Encontrado
O PostCSS config estava apenas em `config/postcss.config.js`, mas o Next.js procura na raiz. O Tailwind v4 não era processado, resultando em HTML sem estilo.

### Solução
1. Criado `postcss.config.mjs` na raiz com plugin `@tailwindcss/postcss`
2. Adicionado Tailwind CDN (`<script src="https://cdn.tailwindcss.com">`) no `layout.tsx` como fallback imediato
3. Inline styles com CSS custom properties e animações no `<style>` do layout

---

## Arquivos Modificados

### CSS/Config
- `postcss.config.mjs` — **CRIADO** (raiz do projeto)
- `app/globals.css` — Substituído por inline styles no layout
- `src/frontend/app/globals.css` — Substituído

### Layouts
- `app/layout.tsx` — Tailwind CDN + inline styles + dark mode
- `src/frontend/app/layout.tsx` — Sync
- `app/(platform)/layout.tsx` — HeaderWrapper + lg:pl-64 + flex-col
- `src/frontend/app/(platform)/layout.tsx` — Sync

### Componentes Dashboard
- `StatsCards.tsx` — Redesign completo
- `SalesChart.tsx` — PieChart + BarChart + legenda
- `RecentOrders.tsx` — Dots, links, hover

### Componentes Navegação
- `Sidebar.tsx` — SVG icons, active indicator
- `HeaderWrapper.tsx` — Iniciais, dropdown, loading

### Componentes Pedidos
- `OrderKanban.tsx` — Filter pills, header gradiente
- `OrderCard.tsx` — Status dot, badge canal

### Componentes KDS
- `KitchenBoard.tsx` — Glass effect, colunas gradiente
- `OrderTicket.tsx` — Ícones SVG, notas destacadas
- `KitchenTimer.tsx` — Pulse em urgência

### Componentes Cardápio
- `ProductList.tsx` — Busca, toggle, badge
- `StockAlert.tsx` — Design refinado
- `CategoryList.tsx` — Grid, toggle, hover

### Páginas
- `dashboard/page.tsx` — Data, status online
- `orders/page.tsx` — Animação fade-in
- `categories/page.tsx` — Design limpo (sem banner)
- `menu/page.tsx` — Cards com sombra
- `kds/page.tsx` — Gradiente, ícone, loading

---

## Status: ✅ COMPLETO
