import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { parseWebhookPayload } from '@/lib/whatsapp'
import { botService } from '@/services/whatsapp/bot.service'

export async function POST(request: Request) {
  try {
    const apiKey = request.headers.get('x-evolution-apikey')
    if (apiKey !== process.env.EVOLUTION_API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const payload = parseWebhookPayload(body)

    if (!payload || payload.fromMe) {
      return NextResponse.json({ ok: true })
    }

    const tenant = await prisma.tenant.findFirst({
      where: { phone: payload.phone },
      select: { id: true },
    })

    if (!tenant) {
      return NextResponse.json({ ok: true })
    }

    await botService.processMessage(tenant.id, {
      phone: payload.phone,
      content: payload.text,
      type: 'TEXT',
      timestamp: new Date(payload.timestamp),
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('WhatsApp webhook error:', error)
    return NextResponse.json({ ok: true })
  }
}
