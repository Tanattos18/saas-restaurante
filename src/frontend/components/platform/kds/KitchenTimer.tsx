'use client'

import { useState, useEffect } from 'react'

interface Props {
  createdAt: string
  status?: string
}

export function KitchenTimer({ createdAt, status }: Props) {
  const [elapsed, setElapsed] = useState(0)
  const isStopped = status === 'READY' || status === 'DELIVERED' || status === 'CANCELED'

  useEffect(() => {
    if (isStopped) return
    const created = new Date(createdAt).getTime()
    function tick() { setElapsed(Date.now() - created) }
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [createdAt, isStopped])

  const minutes = Math.floor(elapsed / 60000)
  const seconds = Math.floor((elapsed % 60000) / 1000)
  const isUrgent = minutes >= 25
  const isWarning = minutes >= 15 && minutes < 25

  const color = isStopped ? 'text-emerald-400' : isUrgent ? 'text-red-400' : isWarning ? 'text-amber-400' : 'text-emerald-400'

  return (
    <span className={`font-mono text-lg font-bold ${color} ${isUrgent && !isStopped ? 'animate-pulse' : ''}`}>
      {isStopped ? '✅ ' : ''}{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
    </span>
  )
}
