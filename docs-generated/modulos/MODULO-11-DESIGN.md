# Módulo 11 — Design System e UX/UI

## Objetivo
Criar um design system coeso, melhorar a experiência do usuário e padronizar a interface do SaaS Restaurante seguindo as melhores práticas de UX.

---

## Melhorias de UX/UI Planejadas

### 1. Design System Base
- [ ] Criar componentes UI reutilizáveis (Button, Card, Input, Modal, etc.)
- [ ] Definir paleta de cores oficial do projeto
- [ ] Tipografia padronizada (fontes, tamanhos, pesos)
- [ ] Sistema de espaçamento consistente
- [ ] Sombras e bordas padronizadas

### 2. Componentes Melhorados
- [ ] Sidebar com ícones profissionais (não emoji)
- [ ] Header com avatar do usuário e dropdown
- [ ] Cards com hover states e animações
- [ ] Modais de confirmação padronizados
- [ ] Toasts/notificações consistentes
- [ ] Skeleton loading states

### 3. Páginas para Melhorar
- [ ] **Dashboard** - Cards maiores, gráficos mais visuais, métricas destacadas
- [ ] **Pedidos (Kanban)** - Colores diferenciadas, drag-and-drop, filtros melhores
- [ ] **KDS** - Timer mais visuais, cores por tempo, som configurável
- [ ] **Produtos** - Grid/list toggle, busca melhor, filtros rápidos
- [ ] **Categorias** - Já estilo iFood ✓

### 4. Animações e Interações
- [ ] Transições suaves entre páginas
- [ ] Animações de loading (spinners, skeletons)
- [ ] Feedback visual em ações (sucesso/erro)
- [ ] Hover effects em botões e cards

### 5. Responsividade
- [ ] Layoutmobile optimizado
- [ ] Sidebar collapsible em tablet
- [ ] Tables responsivos (scroll horizontal)

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

## Status: ⏳ Não Iniciado

**Próximo passo:** Iniciar implementação dos componentes base