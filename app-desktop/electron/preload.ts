import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  getAppInfo: () => ipcRenderer.invoke('get-app-info'),
  getPlatform: () => ipcRenderer.invoke('get-platform'),

  printOrder: (order: unknown) => ipcRenderer.invoke('print-order', order),
  getPrinters: () => ipcRenderer.invoke('get-printers'),
  printTest: () => ipcRenderer.invoke('print-test'),

  checkUpdate: () => ipcRenderer.invoke('check-update'),
  downloadUpdate: () => ipcRenderer.invoke('download-update'),
  installUpdate: () => ipcRenderer.invoke('install-update'),
  onUpdateReady: (callback: (version: string) => void) => {
    ipcRenderer.on('update-ready', (_event, version) => callback(version))
  },
  onUpdateProgress: (callback: (percent: number) => void) => {
    ipcRenderer.on('update-progress', (_event, percent) => callback(percent))
  },

  getOfflineOrders: () => ipcRenderer.invoke('get-offline-orders'),
  saveOfflineOrder: (order: unknown) => ipcRenderer.invoke('save-offline-order', order),
  syncOfflineOrders: () => ipcRenderer.invoke('sync-offline-orders'),
  clearOfflineOrders: () => ipcRenderer.invoke('clear-offline-orders'),

  onNewOrder: (callback: (order: unknown) => void) => {
    ipcRenderer.on('new-order', (_event, order) => callback(order))
  },
})
