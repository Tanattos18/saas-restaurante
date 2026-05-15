'use client'

import { useState, useEffect } from 'react'

interface Props {
  createdAt: string
}

export function KitchenTimer({ createdAt }: Props) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const created = new Date(createdAt).getTime()
    function tick() { setElapsed(Date.now() - created) }
    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [createdAt])

  const minutes = Math.floor(elapsed / 60000)
  const seconds = Math.floor((elapsed % 60000) / 1000)
  const isUrgent = minutes >= 25
  const isWarning = minutes >= 15 && minutes < 25

  const color = isUrgent ? 'text-red-400' : isWarning ? 'text-amber-400' : 'text-emerald-400'

  return (
    <span className={`font-mono text-lg font-bold ${color} ${isUrgent ? 'animate-pulse' : ''}`}>
      {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
    </span>
  )
}
