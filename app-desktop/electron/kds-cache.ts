import { ipcMain } from 'electron'
import fs from 'fs'
import path from 'path'
import { app } from 'electron'

interface OfflineOrder {
  id: string
  tenantId: string
  data: string
  status: 'pending' | 'synced'
  createdAt: string
  syncedAt?: string
}

function getCachePath(): string {
  return path.join(app.getPath('userData'), 'kds-offline.json')
}

function readCache(): OfflineOrder[] {
  try {
    const filePath = getCachePath()
    if (!fs.existsSync(filePath)) return []
    const raw = fs.readFileSync(filePath, 'utf-8')
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
  } catch {
    return []
  }
}

function writeCache(orders: OfflineOrder[]): void {
  try {
    fs.writeFileSync(getCachePath(), JSON.stringify(orders, null, 2), 'utf-8')
  } catch (error) {
    console.error('[kds-cache] Erro ao salvar cache:', error)
  }
}

export function registerKDSCacheHandlers(): void {
  ipcMain.handle('get-offline-orders', async () => {
    try {
      const orders = readCache().filter((o) => o.status === 'pending')
      return orders.map((o) => ({ ...JSON.parse(o.data), id: o.id, tenantId: o.tenantId }))
    } catch {
      return []
    }
  })

  ipcMain.handle('save-offline-order', async (_event, order: unknown) => {
    try {
      const o = order as { id?: string }
      const id = o.id ?? crypto.randomUUID()
      const now = new Date().toISOString()
      const newOrder: OfflineOrder = {
        id,
        tenantId: '',
        data: JSON.stringify(order),
        status: 'pending',
        createdAt: now,
      }
      const orders = readCache()
      orders.push(newOrder)
      writeCache(orders)
      return { success: true, id }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  })

  ipcMain.handle('sync-offline-orders', async () => {
    try {
      const orders = readCache()
      const now = new Date().toISOString()
      for (const order of orders) {
        if (order.status === 'pending') {
          order.status = 'synced'
          order.syncedAt = now
        }
      }
      writeCache(orders)
      return { success: true, synced: orders.filter((o) => o.status === 'synced').length }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  })

  ipcMain.handle('clear-offline-orders', async () => {
    try {
      writeCache([])
      return { success: true }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  })
}
