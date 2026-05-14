import { ipcMain, BrowserWindow } from 'electron'

interface OrderItem {
  quantity: number
  product: { name: string }
  notes?: string | null
}

interface Order {
  orderNumber: number
  channel: string
  customerName?: string
  items: OrderItem[]
  kitchenNotes?: string | null
  createdAt: string
}

function formatOrderText(order: Order): string {
  const lines: string[] = []
  lines.push('='.repeat(32))
  lines.push('      SAAS RESTAURANTE')
  lines.push('='.repeat(32))
  lines.push('')
  lines.push(`Pedido  #${order.orderNumber}`)
  lines.push(`Canal:   ${order.channel}`)
  lines.push(`Data:    ${new Date(order.createdAt).toLocaleString('pt-BR')}`)
  lines.push('')
  lines.push('-'.repeat(32))
  lines.push('ITENS:')
  lines.push('')

  for (const item of order.items) {
    lines.push(`  ${item.quantity}x ${item.product.name}`)
    if (item.notes) {
      lines.push(`     Obs: ${item.notes}`)
    }
  }

  lines.push('')
  lines.push('-'.repeat(32))

  if (order.kitchenNotes) {
    lines.push(`Obs. Cozinha: ${order.kitchenNotes}`)
    lines.push('')
  }

  if (order.customerName) {
    lines.push(`Cliente: ${order.customerName}`)
  }

  lines.push('')
  lines.push('='.repeat(32))
  lines.push('     OBRIGADO!')
  lines.push('='.repeat(32))
  lines.push('')
  lines.push('')
  lines.push('')

  return lines.join('\n')
}

export function registerPrinterHandlers(): void {
  ipcMain.handle('get-printers', async () => {
    const window = BrowserWindow.getFocusedWindow()
    if (!window) return []

    try {
      const printers = await window.webContents.getPrintersAsync()
      return printers.map((p) => ({
        name: p.name,
        displayName: p.displayName,
        status: p.status,
      }))
    } catch {
      return []
    }
  })

  ipcMain.handle('print-order', async (_event, order: Order) => {
    const window = BrowserWindow.getFocusedWindow()
    if (!window) return { success: false, error: 'Sem janela ativa' }

    const text = formatOrderText(order)

    try {
      window.webContents.print({
        silent: true,
        printBackground: true,
        deviceName: undefined,
      })

      return { success: true }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  })

  ipcMain.handle('print-test', async () => {
    const window = BrowserWindow.getFocusedWindow()
    if (!window) return { success: false, error: 'Sem janela ativa' }

    const testPage = `
      <html>
      <head><meta charset="utf-8"><style>
        body { font-family: monospace; font-size: 12px; width: 80mm; padding: 10px; }
        h1 { text-align: center; }
        hr { border-top: 1px dashed #000; }
      </style></head>
      <body>
        <h1>SAAS RESTAURANTE</h1>
        <hr>
        <p>Teste de Impressão</p>
        <p>Data: ${new Date().toLocaleString('pt-BR')}</p>
        <hr>
        <p style="text-align:center;">OK!</p>
      </body>
      </html>
    `

    try {
      window.webContents.print({ silent: true, printBackground: true })
      return { success: true }
    } catch (error) {
      return { success: false, error: String(error) }
    }
  })
}
