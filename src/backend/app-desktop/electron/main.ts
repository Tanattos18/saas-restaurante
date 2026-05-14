import { app, BrowserWindow, ipcMain, Menu, MenuItemConstructorOptions } from 'electron'
import path from 'path'
import { registerPrinterHandlers } from './printer'
import { registerUpdaterHandlers, setMainWindow } from './updater'
import { registerKDSCacheHandlers } from './kds-cache'

let mainWindow: BrowserWindow | null = null

const isDev = !app.isPackaged

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 600,
    title: 'SaaS Restaurante',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  })

  if (isDev) {
    mainWindow.loadURL('http://localhost:3000')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../src/out/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

function createMenu(): void {
  const template: MenuItemConstructorOptions[] = [
    {
      label: 'Arquivo',
      submenu: [
        { role: 'reload', label: 'Recarregar' },
        { role: 'forceReload', label: 'Recarregar (forçado)' },
        { type: 'separator' },
        { role: 'quit', label: 'Sair' },
      ],
    },
    {
      label: 'Exibir',
      submenu: [
        { role: 'togglefullscreen', label: 'Tela Cheia' },
        { type: 'separator' },
        { role: 'zoomIn', label: 'Aumentar Zoom' },
        { role: 'zoomOut', label: 'Diminuir Zoom' },
        { role: 'resetZoom', label: 'Resetar Zoom' },
        { type: 'separator' },
        { role: 'toggleDevTools', label: 'Ferramentas do Desenvolvedor' },
      ],
    },
    {
      label: 'Janela',
      submenu: [
        { role: 'minimize', label: 'Minimizar' },
        { role: 'close', label: 'Fechar' },
      ],
    },
  ]

  if (process.platform === 'darwin') {
    template.unshift({
      label: app.name,
      submenu: [
        { role: 'about', label: 'Sobre' },
        { type: 'separator' },
        { role: 'hide', label: 'Ocultar' },
        { role: 'hideOthers', label: 'Ocultar Outros' },
        { role: 'unhide', label: 'Mostrar Todos' },
        { type: 'separator' },
        { role: 'quit', label: 'Sair' },
      ],
    })
  }

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

app.whenReady().then(() => {
  createMenu()
  createWindow()

  if (mainWindow) {
    setMainWindow(mainWindow)
  }
  registerPrinterHandlers()
  registerUpdaterHandlers()
  registerKDSCacheHandlers()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

ipcMain.handle('get-app-info', () => ({
  version: app.getVersion(),
  name: app.getName(),
  platform: process.platform,
  isDev,
}))

ipcMain.handle('get-platform', () => process.platform)
