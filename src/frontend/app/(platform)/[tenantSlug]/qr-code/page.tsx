'use client'

import { useState } from 'react'

export default function QRCodePage() {
  const [tablesInput, setTablesInput] = useState('1,2,3,4,5')
  const [qrCodes, setQrCodes] = useState<Array<{ tableNumber: number; qrCodeDataUrl: string }>>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function generate() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/qr-code/tables?tables=${tablesInput}`)
      const data = await res.json()
      if (data.success) setQrCodes(data.data)
      else setError(data.error ?? 'Erro ao gerar')
    } catch {
      setError('Erro de conexão')
    } finally {
      setLoading(false)
    }
  }

  async function downloadAsPNG(dataUrl: string, tableNumber: number) {
    const link = document.createElement('a')
    link.download = `mesa-${tableNumber}.png`
    link.href = dataUrl
    link.click()
  }

  function printAll() {
    const win = window.open('', '_blank')
    if (!win) return
    win.document.write('<html><head><title>QR Codes</title><style>body{font-family:sans-serif;padding:20px}table{width:100%}td{text-align:center;padding:10px}img{width:200px;height:200px}p{font-size:14px}</style></head><body>')
    win.document.write('<h1 style="text-align:center">QR Codes — Mesas</h1><table>')
    qrCodes.forEach((qr, i) => {
      if (i % 3 === 0) win.document.write('<tr>')
      win.document.write(`<td><img src="${qr.qrCodeDataUrl}" /><p>Mesa ${qr.tableNumber}</p></td>`)
      if ((i + 1) % 3 === 0 || i === qrCodes.length - 1) win.document.write('</tr>')
    })
    win.document.write('</table></body></html>')
    win.document.close()
    win.print()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">QR Codes</h1>
        <p className="text-sm text-muted-foreground">Gere QR Codes para as mesas do seu restaurante</p>
      </div>

      <div className="flex items-end gap-3">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Números das Mesas</label>
          <input
            type="text"
            value={tablesInput}
            onChange={(e) => setTablesInput(e.target.value)}
            placeholder="1,2,3,4,5"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
          <p className="mt-1 text-xs text-muted-foreground">Separe por vírgula. Ex: 1,2,3,4,5</p>
        </div>
        <button
          onClick={generate}
          disabled={loading}
          className="rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {loading ? 'Gerando...' : 'Gerar QR Codes'}
        </button>
      </div>

      {error && <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

      {qrCodes.length > 0 && (
        <>
          <div className="flex justify-end">
            <button
              onClick={printAll}
              className="rounded-md border border-input px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              🖨️ Imprimir Todos
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {qrCodes.map((qr) => (
              <div key={qr.tableNumber} className="rounded-lg border p-4 text-center">
                <img src={qr.qrCodeDataUrl} alt={`Mesa ${qr.tableNumber}`} className="mx-auto w-32 h-32" />
                <p className="mt-2 text-sm font-medium">Mesa {qr.tableNumber}</p>
                <button
                  onClick={() => downloadAsPNG(qr.qrCodeDataUrl, qr.tableNumber)}
                  className="mt-2 text-xs text-primary hover:underline"
                >
                  Download
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}