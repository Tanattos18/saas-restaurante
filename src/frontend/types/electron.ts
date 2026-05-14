interface ElectronAPI {
  getAppInfo(): Promise<{ version: string; name: string; platform: string; isDev: boolean }>
  getPlatform(): Promise<string>

  printOrder(order: unknown): Promise<{ success: boolean; error?: string }>
  getPrinters(): Promise<{ name: string; displayName: string; status: number }[]>
  printTest(): Promise<{ success: boolean; error?: string }>

  checkUpdate(): Promise<{ available: boolean; version?: string; error?: string }>
  downloadUpdate(): Promise<{ success: boolean; error?: string }>
  installUpdate(): Promise<{ success: boolean; error?: string }>
  onUpdateReady(callback: (version: string) => void): void
  onUpdateProgress(callback: (percent: number) => void): void

  getOfflineOrders(): Promise<unknown[]>
  saveOfflineOrder(order: unknown): Promise<{ success: boolean; id?: string; error?: string }>
  syncOfflineOrders(): Promise<{ success: boolean; synced?: number; error?: string }>
  clearOfflineOrders(): Promise<{ success: boolean; error?: string }>

  onNewOrder(callback: (order: unknown) => void): void
}

export {}

declare global {
  interface Window {
    electronAPI?: ElectronAPI
  }
}
