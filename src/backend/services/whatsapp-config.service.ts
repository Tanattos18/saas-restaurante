import { getAuthContext } from '@/lib/auth'

interface EvolutionApiConfig {
  url: string
  key: string
  instance: string
}

export function whatsappConfigService(tenantId: string) {
  return {
    getConfig(): EvolutionApiConfig {
      return {
        url: process.env.EVOLUTION_API_URL ?? 'http://localhost:8080',
        key: process.env.EVOLUTION_API_KEY ?? '',
        instance: process.env.EVOLUTION_INSTANCE_NAME ?? 'saas-restaurante',
      }
    },

    async checkConnection(): Promise<{ connected: boolean; message: string }> {
      const config = this.getConfig()
      try {
        const res = await fetch(`${config.url}/instance/connectionState/${config.instance}`, {
          headers: { apikey: config.key },
        })
        if (!res.ok) return { connected: false, message: `Erro HTTP ${res.status}` }
        const data = await res.json()
        const state = data?.state?.state ?? ''
        const connected = state === 'open'
        return { connected, message: connected ? 'Conectado' : `Estado: ${state}` }
      } catch (e: any) {
        return { connected: false, message: e?.message ?? 'Erro de conexão' }
      }
    },

    async getQRCode(): Promise<{ qrcode: string | null; message: string }> {
      const config = this.getConfig()
      try {
        const res = await fetch(`${config.url}/instance/qrcode/${config.instance}`, {
          headers: { apikey: config.key },
        })
        if (!res.ok) return { qrcode: null, message: `Erro HTTP ${res.status}` }
        const data = await res.json()
        const qrcode = data?.qrcode?.code ?? data?.base64 ?? null
        return { qrcode, message: qrcode ? 'QR Code gerado' : 'QR Code não disponível' }
      } catch (e: any) {
        return { qrcode: null, message: e?.message ?? 'Erro de conexão' }
      }
    },

    async logout(): Promise<{ success: boolean; message: string }> {
      const config = this.getConfig()
      try {
        const res = await fetch(`${config.url}/instance/logout/${config.instance}`, {
          method: 'DELETE',
          headers: { apikey: config.key },
        })
        return { success: res.ok, message: res.ok ? 'Desconectado' : `Erro HTTP ${res.status}` }
      } catch (e: any) {
        return { success: false, message: e?.message ?? 'Erro de conexão' }
      }
    },
  }
}

export async function handleWhatsAppAPI(action: string) {
  const auth = await getAuthContext()
  if (!auth) throw new Error('Não autenticado')
  const service = whatsappConfigService(auth.tenantId)

  switch (action) {
    case 'check':
      return service.checkConnection()
    case 'qrcode':
      return service.getQRCode()
    case 'logout':
      return service.logout()
    default:
      throw new Error('Ação inválida')
  }
}
