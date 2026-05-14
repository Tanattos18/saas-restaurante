interface SendTextParams {
  instanceName: string
  phone: string
  text: string
}

interface SendButtonsParams {
  instanceName: string
  phone: string
  title: string
  buttons: Array<{ id: string; text: string }>
}

interface SendListParams {
  instanceName: string
  phone: string
  title: string
  sections: Array<{ title: string; rows: Array<{ id: string; text: string }> }>
}

const apiUrl = process.env.EVOLUTION_API_URL ?? 'http://localhost:8080'
const apiKey = process.env.EVOLUTION_API_KEY ?? ''

async function evolutionRequest(endpoint: string, body: unknown) {
  const res = await fetch(`${apiUrl}/${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: apiKey,
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    console.error(`Evolution API error ${res.status}:`, await res.text())
  }
}

export async function sendText({ instanceName, phone, text }: SendTextParams) {
  await evolutionRequest(`message/sendText/${instanceName}`, {
    number: phone,
    text,
  })
}

export async function sendButtons({ instanceName, phone, title, buttons }: SendButtonsParams) {
  await evolutionRequest(`message/sendButtons/${instanceName}`, {
    number: phone,
    title,
    buttons: buttons.map((b) => ({ id: b.id, text: b.text })),
  })
}

export async function sendList({ instanceName, phone, title, sections }: SendListParams) {
  await evolutionRequest(`message/sendList/${instanceName}`, {
    number: phone,
    title,
    sections,
  })
}

export interface WebhookPayload {
  phone: string
  text: string
  type: 'TEXT' | 'IMAGE' | 'DOCUMENT' | 'LOCATION' | 'CONTACT'
  fromMe: boolean
  timestamp: number
}

export function parseWebhookPayload(body: unknown): WebhookPayload | null {
  try {
    const event = body as Record<string, unknown>
    if (event.event !== 'messages.upsert') return null

    const data = event.data as Record<string, unknown> | undefined
    const key = data?.key as Record<string, unknown> | undefined
    const message = data?.message as Record<string, unknown> | undefined

    if (!key || !message) return null

    const remoteJid = key.remoteJid as string | undefined
    const fromMe = (key.fromMe as boolean) ?? false
    const conversation = (message.conversation ?? message.text as string) as string | undefined

    if (!remoteJid || !conversation) return null

    const phone = remoteJid.replace(/@s\.whatsapp\.net$/, '')

    return {
      phone,
      text: conversation.trim(),
      type: 'TEXT',
      fromMe,
      timestamp: Date.now(),
    }
  } catch {
    return null
  }
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 11 || cleaned.length === 13) return cleaned
  if (cleaned.length === 10 || cleaned.length === 12) {
    return cleaned.length === 10 ? `55${cleaned}` : cleaned
  }
  return cleaned
}
