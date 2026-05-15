import { NextResponse } from 'next/server'
import { handleWhatsAppAPI } from '@/services/whatsapp-config.service'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') ?? 'check'
    const result = await handleWhatsAppAPI(action)
    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Erro interno'
    return NextResponse.json({ success: false, error: msg }, { status: 400 })
  }
}
