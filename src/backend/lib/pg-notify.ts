import { Pool } from 'pg'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 1,
})

type Callback = (payload: string) => void

const listeners = new Map<string, Callback[]>()
let client: import('pg').PoolClient | null = null

async function ensureListening() {
  if (client) return
  client = await pool.connect()

  client.on('notification', (msg) => {
    const channel = msg.channel ?? ''
    const cbs = listeners.get(channel)
    if (cbs && msg.payload) {
      cbs.forEach((cb) => cb(msg.payload!))
    }
  })

  const channels = Array.from(listeners.keys())
  for (const ch of channels) {
    await client.query(`LISTEN "${ch}"`)
  }
}

export function subscribe(channel: string, callback: Callback): () => void {
  const existing = listeners.get(channel) ?? []
  listeners.set(channel, [...existing, callback])

  ensureListening().catch(console.error)

  return () => {
    const cbs = listeners.get(channel)
    if (!cbs) return
    const filtered = cbs.filter((cb) => cb !== callback)
    if (filtered.length === 0) {
      listeners.delete(channel)
    } else {
      listeners.set(channel, filtered)
    }
  }
}

export async function notify(channel: string, payload: string): Promise<void> {
  const c = await pool.connect()
  try {
    const escaped = payload.replace(/'/g, "''")
    await c.query(`NOTIFY "${channel}", '${escaped}'`)
  } finally {
    c.release()
  }
}
