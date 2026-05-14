# 📲 PROJETO APP — SaaS Restaurante como Aplicativo Instalado

Este documento explica como transformar o SaaS Restaurante (originalmente web) em um **aplicativo desktop instalável** para Windows, macOS e Linux, incluindo requisitos, arquitetura, manutenção e atualizações.

---

## 📌 Sumário

1. [Por que um aplicativo instalado?](#-por-que-um-aplicativo-instalado)
2. [Arquitetura do App](#-arquitetura-do-app)
3. [Requisitos do Cliente (PC)](#-requisitos-do-cliente-pc)
4. [Requisitos Técnicos para Criar o App](#-requisitos-técnicos-para-criar-o-app)
5. [Como Transformar o SaaS em App](#-como-transformar-o-saas-em-app)
6. [Manutenção e Atualizações](#-manutenção-e-atualizações)
7. [Fluxo de Update sem Interromper Operação](#-fluxo-de-update-sem-interromper-operação)
8. [Comparação: Web vs App Instalado](#-comparação-web-vs-app-instalado)
9. [Recomendação Final](#-recomendação-final)

---

## 🎯 Por que um aplicativo instalado?

O SaaS Restaurante é originalmente uma aplicação web (Next.js). Um aplicativo instalado oferece vantagens específicas:

| Vantagem | Descrição |
|----------|-----------|
| **KDS offline** | Tela da cozinha funciona mesmo sem internet (cache local) |
| **Impressão térmica** | Acesso direto a impressoras USB/bluetooth |
| **Notificações nativas** | Som de pedido novo no sistema operacional |
| **Performance** | Sem latência de rede para interface |
| **Hardware** | Acesso a portas seriais, balanças, leitores de código de barras |
| **Atualização silenciosa** | Updates automáticos em segundo plano |

---

## 🏗️ Arquitetura do App

```
┌─────────────────────────────────────────────────────────┐
│                    DISPOSITIVO DO CLIENTE                │
│                                                         │
│  ┌──────────────────────┐   ┌────────────────────────┐  │
│  │   App Desktop (Electron/Tauri)  │                   │  │
│  │  ┌────────────────┐  │   │  ┌──────────────────┐  │  │
│  │  │  Frontend React │  │   │  │  KDS Offline     │  │  │
│  │  │  (Next.js)      │  │   │  │  (Service Worker)│  │  │
│  │  └────────────────┘  │   │  └──────────────────┘  │  │
│  │  ┌────────────────┐  │   │  ┌──────────────────┐  │  │
│  │  │  Impressão     │  │   │  │  Cache Local     │  │  │
│  │  │  Térmica       │  │   │  │  (SQLite/IndexedDB)│  │  │
│  │  └────────────────┘  │   │  └──────────────────┘  │  │
│  └──────────────────────┘   └────────────────────────┘  │
│                          │                              │
│                          ▼                              │
│                   ┌──────────────┐                      │
│                   │  API Remota  │ ← → Nuvem (SaaS)     │
│                   │  (HTTPS)     │                      │
│                   └──────────────┘                      │
└─────────────────────────────────────────────────────────┘
```

### Componentes do App

| Componente | Tecnologia | Função |
|------------|------------|--------|
| **Shell do App** | Electron ou Tauri | Empacota o site como app desktop |
| **Frontend** | Next.js (build estático) | Interface do usuário |
| **KDS Local** | Service Worker + SQLite | Tela da cozinha offline |
| **Impressão** | IPC + node-usb/node-thermal-printer | Impressão térmica direta |
| **Notificações** | Notificações nativas do SO | Som e alerta de novos pedidos |
| **Cache** | IndexedDB / SQLite via better-sqlite3 | Dados offline |
| **Auto-update** | electron-updater / Tauri updater | Atualização automática |

---

## 💻 Requisitos do Cliente (PC)

### Mínimos (para operação básica)

| Componente | Especificação |
|------------|---------------|
| **Sistema Operacional** | Windows 10/11, macOS 12+, Linux (Ubuntu 22.04+) |
| **Processador** | Intel Celeron / AMD A4 ou superior |
| **Memória RAM** | 4 GB |
| **Armazenamento** | 500 MB livres |
| **Internet** | 5 Mbps (para API e WhatsApp) |
| **Resolução de tela** | 1366x768 (mínimo) |

### Recomendados (para KDS + Impressão)

| Componente | Especificação |
|------------|---------------|
| **Sistema Operacional** | Windows 11 / Ubuntu 24.04 LTS |
| **Processador** | Intel Core i3 / AMD Ryzen 3 (12ª geração+) |
| **Memória RAM** | 8 GB |
| **Armazenamento** | SSD 120 GB com 5 GB livres |
| **Internet** | 20 Mbps (fibra) |
| **Resolução de tela** | 1920x1080 (para KDS em fullscreen) |
| **Impressora térmica** | Elgin i9, Bematech MP4200, ou qualquer ESC/POS |
| **Rede** | Wi-Fi 5 ou superior (ou cabeada) |

### Periféricos Suportados

| Periférico | Conexão | Uso |
|------------|---------|-----|
| Impressora térmica não fiscal | USB / Bluetooth | Impressão de pedidos na cozinha |
| Leitor de código de barras | USB (modo HID) | Leitura de produtos |
| Balança | Serial RS232 / USB | Pesagem de ingredientes |
| Monitor secundário | HDMI | Tela da cozinha (KDS) em monitor separado |
| Tablet (como KDS) | Wi-Fi | Tela da cozinha sem fio |

---

## 🛠️ Requisitos Técnicos para Criar o App

### Opção 1: Electron (Recomendado)

| Requisito | Detalhe |
|-----------|---------|
| **Tecnologia** | Electron 33+ (Chromium + Node.js) |
| **Linguagem** | TypeScript (mesmo do projeto) |
| **Empacotador** | electron-builder |
| **Auto-update** | electron-updater + GitHub Releases |
| **Build para** | Windows (NSIS), macOS (DMG), Linux (AppImage) |
| **Injeção** | next build → copiar para pasta do Electron |

```bash
npm install --save-dev electron electron-builder
npm install --save electron-updater
```

### Opção 2: Tauri (Alternativa moderna)

| Requisito | Detalhe |
|-----------|---------|
| **Tecnologia** | Tauri 2+ (Rust + WebView do SO) |
| **Linguagem** | Rust (back-end) + TypeScript (front-end) |
| **Empacotador** | Tauri CLI (nativo) |
| **Auto-update** | Tauri updater + servidor de releases |
| **Tamanho** | ~5 MB (vs ~150 MB do Electron) |
| **Performance** | Melhor que Electron (nativo) |

```bash
npm install --save-dev @tauri-apps/cli @tauri-apps/api
```

### Comparação Electron vs Tauri

| Característica | Electron | Tauri |
|----------------|----------|-------|
| Tamanho do instalador | ~150 MB | ~5 MB |
| Consumo de RAM | ~150 MB | ~30 MB |
| Acesso a hardware | Completo (Node.js) | Completo (Rust) |
| Maturidade | Excelente | Boa (crescendo) |
| Impressão térmica | node-thermal-printer | Rust crate + IPC |
| Facilidade de desenvolvimento | Alta | Média (precisa Rust) |

---

## 🔄 Como Transformar o SaaS em App

### Passo 1: Build Estático do Next.js

O app não precisa de um servidor Next.js rodando localmente. Fazemos um **build estático** (export) e embutimos no Electron/Tauri.

```bash
# next.config.ts
const nextConfig = {
  output: 'export',        // Gera HTML estático
  images: { unoptimized: true },
  trailingSlash: true,
}
```

Isso gera uma pasta `out/` com HTML, CSS, JS puros.

### Passo 2: Estrutura do App Electron

```
app-instalavel/
├── electron/
│   ├── main.ts           # Janela principal, IPC, menus
│   ├── preload.ts        # Ponte segura entre React e Node.js
│   ├── printer.ts        # Gerenciamento de impressoras
│   ├── updater.ts        # Auto-update
│   └── kds-offline.ts    # Cache local de pedidos
├── src/                  # Frontend (cópia do Next.js buildado)
│   └── out/              # next build && next export
├── resources/            # Ícones, instaladores
├── package.json
└── electron-builder.yml  # Config de build
```

### Passo 3: Funcionalidades Nativas via IPC

```typescript
// electron/preload.ts — expõe APIs seguras para o React
contextBridge.exposeInMainWorld('electronAPI', {
  printOrder: (order) => ipcRenderer.invoke('print-order', order),
  getPrinters: () => ipcRenderer.invoke('get-printers'),
  onNewOrder: (callback) => ipcRenderer.on('new-order', callback),
  getOfflineOrders: () => ipcRenderer.invoke('get-offline-orders'),
  checkUpdate: () => ipcRenderer.invoke('check-update'),
})
```

### Passo 4: Comunicação com a Nuvem

O app se comunica com a API remota (SaaS na nuvem) via HTTPS:

```
App Local → HTTPS → API Remota (Vercel) → Banco PostgreSQL
```

Para o KDS offline, o app usa um **banco SQLite local** que sincroniza quando a internet volta.

---

## 🔧 Manutenção e Atualizações

### Estratégia de Atualização sem Interromper Operação

```
┌──────────────────────────────────────────────────────┐
│                 SERVIDOR DE RELEASES                  │
│  (GitHub Releases / servidor próprio)                 │
│                                                        │
│  v1.0.0  ← instalação inicial                         │
│  v1.1.0  ← novo recurso (ex: relatório financeiro)    │
│  v1.1.1  ← hotfix (correção de bug crítico)           │
│  v1.2.0  ← nova feature (ex: integração iFood)        │
└──────────────────────┬───────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────┐
│              APP DO CLIENTE (Electron)                 │
│                                                        │
│  ┌─────────────┐   ┌──────────────┐   ┌───────────┐  │
│  │ Versão Atual │ → │ Download     │ → │ Instala   │  │
│  │ v1.0.0      │   │ v1.1.0       │   │ na próx.  │  │
│  │ (rodando)   │   │ (background) │   │ reinicial.│  │
│  └─────────────┘   └──────────────┘   └───────────┘  │
│                                                        │
│  🔄 App continua funcionando NORMALMENTE              │
│  ⏳ Update só aplica quando usuário reiniciar         │
└──────────────────────────────────────────────────────┘
```

### Tipos de Atualização

| Tipo | Exemplo | Como aplica | Interrompe? |
|------|---------|-------------|-------------|
| **Hotfix** | Correção de bug crítico | Download + aplica imediato | ❌ Não (recarrega página) |
| **Feature** | Novo relatório financeiro | Download em background, aplica no restart | ❌ Não |
| **Breaking** | Mudança na API | Agendado para madrugada | ✅ Sim (programado) |

### Fluxo de Auto-Update (electron-updater)

```typescript
// electron/updater.ts
import { autoUpdater } from 'electron-updater'

autoUpdater.autoDownload = true
autoUpdater.autoInstallOnAppQuit = true  // Instala quando fechar

autoUpdater.on('update-downloaded', (info) => {
  // Envia notificação para o React: "Update pronto para instalar"
  mainWindow.webContents.send('update-ready', info.version)
  
  // Opcional: força reinicialização silenciosa na madrugada
  scheduleInstallAt(3, 0) // 3:00 AM
})
```

### Versionamento Semântico

```
v1.2.3
  ↑ ↑ ↑
  │ │ └── Patch (hotfix, sem nova funcionalidade)
  │ └──── Minor (nova funcionalidade, compatível)
  └────── Major (mudança incompatível)
```

---

## 📋 Fluxo de Update sem Interromper Operação

### Cenário: Cliente usando KDS na cozinha

```
⏰ 19:00 — Horário de pico, cozinha operando

1. Servidor lança v1.1.0
2. App do cliente detecta nova versão (check a cada 1h)
3. Download inicia em BACKGROUND (sem travar nada)
4. App continua funcionando normalmente
5. Download concluído (app salva no disco)
6. NOTIFICAÇÃO: "Atualização v1.1.0 disponível para instalar"
   
   Opções do usuário:
   ┌─────────────────────────────────────┐
   │ 🔄 Instalar agora (reinicia app)    │ ← não recomendado em horário de pico
   │ ⏰ Instalar às 03:00                │ ← recomendado
   │ ❌ Lembrar depois                   │ ← próximo check em 1h
   └─────────────────────────────────────┘

7. Usuário escolhe "Instalar às 03:00"
8. ⏰ 03:00 — App instala atualização automaticamente
9. App reinicia já na nova versão
10. Pronto para operação do dia seguinte
```

### Garantias

- **Nenhuma operação é interrompida** durante o download
- **API remota nunca precisa de manutenção** (fica na Vercel)
- **Banco de dados** fica na nuvem, o app só acessa via API
- **Rollback**: se a atualização falhar, o app volta para versão anterior automaticamente

---

## ⚖️ Comparação: Web vs App Instalado

| Característica | Web (Navegador) | App Instalado |
|---------------|----------------|---------------|
| **Instalação** | Nenhuma (só acessar URL) | Precisa instalar (~150 MB) |
| **Atualização** | Automática (recarregar) | Auto-update em background |
| **Offline** | ❌ Precisa de internet | ✅ KDS funciona offline |
| **Impressão térmica** | ❌ Limitado (WebUSB/Bluetooth) | ✅ Completo (USB nativo) |
| **Notificações** | ✅ Web Push (parcial) | ✅ Nativas (com som) |
| **Performance** | ✅ Boa | ✅ Melhor (sem navegador) |
| **Acesso a hardware** | ❌ Muito limitado | ✅ Completo (porta serial, USB) |
| **Manutenção remota** | ✅ Automática | ✅ Auto-update |
| **Segurança** | ✅ HTTPS + cookies | ✅ + atualizações assinadas |
| **Custo** | ✅ Grátis (navegador) | 💰 +servidor de releases |

---

## 💡 Recomendação Final

### ✅ Fase 1 — PWA (Concluída em 14/05/2026)

**Implementado com `@serwist/next`:**

```bash
npm install @serwist/next serwist
```

O que foi criado:
- `app/sw.ts` — Service worker com cache offline
- `public/manifest.json` — Manifest PWA com ícones SVG
- `public/icons/icon-192.svg` e `icon-512.svg` — Ícones
- `app/layout.tsx` — Metadados PWA (apple-web-app, theme-color, manifest)

O usuário pode "instalar" o site como aplicativo no navegador (Chrome, Edge, Safari).
Funciona offline parcial (Service Worker).
Atualiza automaticamente (sempre a versão mais recente do Next.js).

### Para produção (fase 2 — médio prazo)

**Electron + auto-update:**

```bash
npx create-electron-app --template=typescript
# Copiar build do Next.js para dentro
# Configurar electron-builder para Windows/macOS/Linux
# Configurar auto-updater com GitHub Releases
```

### Para maturidade (fase 3 — longo prazo)

**Tauri** quando a equipe dominar Rust:
- Instalador de ~5 MB
- Consumo de RAM muito menor
- Performance nativa
- Ideal para dispositivos de cozinha com hardware limitado

---

## 📦 Estrutura Sugerida do Projeto App

```
saas-restaurante-app/              # Novo repositório
├── electron/                      # Código Electron
│   ├── main.ts                    # Janela principal
│   ├── preload.ts                 # Ponte IPC
│   ├── printer.ts                 # Impressão térmica
│   ├── updater.ts                 # Auto-update
│   └── kds-cache.ts               # Cache offline
├── src/                           # Frontend (cópia do Next.js)
│   └── out/                       # Build estático gerado
├── resources/                     # Ícones, instaladores
├── scripts/
│   └── build.sh                   # Script de build (next build → copiar)
├── electron-builder.yml           # Config de build
├── package.json
└── .github/
    └── workflows/
        └── release.yml            # CI/CD: build + publish
```

---

## 🔗 Links Úteis

| Recurso | URL |
|---------|-----|
| Electron | https://www.electronjs.org |
| electron-builder | https://www.electron.build |
| Tauri | https://tauri.app |
| electron-updater | https://github.com/electron-userland/electron-builder/tree/master/packages/electron-updater |
| node-thermal-printer | https://github.com/Klemen1337/node-thermal-printer |
| PWA (Serwist) | https://serwist.pages.dev |
| SQLite (better-sqlite3) | https://github.com/WiseLibs/better-sqlite3 |

---

> **Documento criado em:** 14/05/2026
> **Versão do projeto:** v1.0
> **Autor:** SaaS Restaurante Team
> **Status PWA:** ✅ Implementado (14/05/2026) — `@serwist/next` + service worker + manifest
