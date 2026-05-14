import { ipcMain, BrowserWindow } from 'electron'
import { autoUpdater } from 'electron-updater'

let mainWindow: BrowserWindow | null = null

export function setMainWindow(window: BrowserWindow): void {
  mainWindow = window
}

export function registerUpdaterHandlers(): void {
  autoUpdater.autoDownload = false
  autoUpdater.autoInstallOnAppQuit = true

  autoUpdater.on('checking-for-update', () => {
    console.log('[updater] Verificando atualizações...')
  })

  autoUpdater.on('update-available', (info) => {
    console.log(`[updater] Atualização disponível: ${info.version}`)
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('update-ready', info.version)
    }
  })

  autoUpdater.on('update-not-available', () => {
    console.log('[updater] Nenhuma atualização disponível')
  })

  autoUpdater.on('download-progress', (progress) => {
    const percent = Math.round(progress.percent)
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('update-progress', percent)
    }
  })

  autoUpdater.on('update-downloaded', () => {
    console.log('[updater] Download concluído')
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('update-ready', 'downloaded')
    }
  })

  autoUpdater.on('error', (error) => {
    console.error('[updater] Erro:', error.message)
  })

  ipcMain.handle('check-update', async () => {
    try {
      const result = await autoUpdater.checkForUpdates()
      return { available: result?.updateInfo?.version ? true : false, version: result?.updateInfo?.version }
    } catch {
      return { available: false, error: 'Falha ao verificar atualizações' }
    }
  })

  ipcMain.handle('download-update', async () => {
    try {
      await autoUpdater.downloadUpdate()
      return { success: true }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  })

  ipcMain.handle('install-update', async () => {
    try {
      autoUpdater.quitAndInstall(false, true)
      return { success: true }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  })

  setTimeout(() => {
    autoUpdater.checkForUpdates().catch(() => {})
  }, 10000)
}
