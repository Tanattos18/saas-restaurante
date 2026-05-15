'use client'

import { useEffect, useState } from 'react'

export function UpdateNotification() {
  const [updateVersion, setUpdateVersion] = useState<string | null>(null)
  const [progress, setProgress] = useState<number | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (!window.electronAPI) return

    window.electronAPI.onUpdateReady((version) => {
      setUpdateVersion(version === 'downloaded' ? 'baixada' : version)
    })

    window.electronAPI.onUpdateProgress((percent) => {
      setProgress(percent)
    })
  }, [])

  async function handleDownload() {
    if (!window.electronAPI) return
    setProgress(0)
    await window.electronAPI.downloadUpdate()
  }

  async function handleInstall() {
    if (!window.electronAPI) return
    await window.electronAPI.installUpdate()
  }

  if (!updateVersion || dismissed) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 rounded-lg bg-blue-900 p-4 shadow-lg border border-blue-700 max-w-xs">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-blue-100">🔄 Atualização disponível</p>
          {progress !== null && progress < 100 ? (
            <div className="mt-2">
              <div className="h-2 w-full rounded-full bg-blue-800">
                <div className="h-2 rounded-full bg-blue-400 transition-all" style={{ width: `${progress}%` }} />
              </div>
              <p className="mt-1 text-xs text-blue-300">Baixando... {progress}%</p>
            </div>
          ) : (
            <div className="mt-2 flex gap-2">
              <button
                onClick={handleDownload}
                className="rounded bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-700"
              >
                Baixar
              </button>
              <button
                onClick={handleInstall}
                className="rounded bg-green-600 px-3 py-1 text-xs text-white hover:bg-green-700"
              >
                Instalar
              </button>
            </div>
          )}
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-blue-300 hover:text-blue-100 text-lg leading-none"
        >
          ×
        </button>
      </div>
    </div>
  )
}
