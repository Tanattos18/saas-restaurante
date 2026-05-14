import { sendText } from '@/lib/whatsapp'

interface SendMessageParams {
  tenantId: string
  instanceName: string
  phone: string
  text: string
}

const instanceCache = new Map<string, string>()

export function getInstanceName(tenantId: string): string {
  const cached = instanceCache.get(tenantId)
  if (cached) return cached
  const instance = process.env.EVOLUTION_INSTANCE_NAME ?? 'saas-restaurante'
  instanceCache.set(tenantId, instance)
  return instance
}

export async function sendMessage({ tenantId, phone, text }: SendMessageParams) {
  const instanceName = getInstanceName(tenantId)
  await sendText({ instanceName, phone, text })
}
