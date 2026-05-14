import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { subscribe } from '@/lib/pg-notify'
import { getActiveOrdersRaw } from '@/services/kds.service'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const deviceCode = searchParams.get('deviceCode')

  if (!deviceCode) {
    return NextResponse.json({ error: 'deviceCode required' }, { status: 400 })
  }

  const device = await prisma.kitchenDevice.findUnique({ where: { deviceCode } })
  if (!device || device.status !== 'ACTIVE') {
    return NextResponse.json({ error: 'Invalid device' }, { status: 401 })
  }

  const encoder = new TextEncoder()
  const channel = `kds_${device.tenantId}`

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: unknown) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
      }

      const initialOrders = await getActiveOrdersRaw(device.tenantId)
      send({ type: 'INIT', orders: initialOrders })

      const unsubscribe = subscribe(channel, async (payload) => {
        try {
          const parsed = JSON.parse(payload)
          const updatedOrders = await getActiveOrdersRaw(device.tenantId)
          send({ type: 'UPDATE', orders: updatedOrders, event: parsed })
        } catch {
          // ignore parse errors
        }
      })

      const heartbeat = setInterval(() => send({ type: 'PING' }), 30000)

      request.signal.addEventListener('abort', () => {
        clearInterval(heartbeat)
        unsubscribe()
        controller.close()
      })
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
