import QRCode from 'qrcode'
import prisma from '@/backend/lib/prisma'

export class QRCodeService {
  async generateTableQR(tenantSlug: string, tableNumber: number, baseUrl: string): Promise<string> {
    const url = `${baseUrl}/table/${tenantSlug}/${tableNumber}`
    return QRCode.toDataURL(url, { width: 300, margin: 2 })
  }

  async generateMenuQR(tenantSlug: string, baseUrl: string): Promise<string> {
    const url = `${baseUrl}/menu/${tenantSlug}`
    return QRCode.toDataURL(url, { width: 300, margin: 2 })
  }

  async generatePixQR(pixCode: string): Promise<string> {
    return QRCode.toDataURL(pixCode, { width: 300, margin: 2 })
  }

  async generateTables(tenantId: string, tenantSlug: string, tables: number[], baseUrl: string) {
    return Promise.all(
      tables.map(async (tableNumber) => ({
        tableNumber,
        qrCodeDataUrl: await this.generateTableQR(tenantSlug, tableNumber, baseUrl),
      }))
    )
  }

  async getTenantBySlug(slug: string) {
    return prisma.tenant.findUnique({
      where: { slug },
      select: { id: true, slug: true, name: true, settings: true, status: true },
    })
  }

  async getMenuData(tenantId: string) {
    return prisma.category.findMany({
      where: { tenantId, active: true, showInQRCode: true },
      include: {
        products: {
          where: { active: true, showInQRCode: true },
          orderBy: { position: 'asc' },
        },
      },
      orderBy: { position: 'asc' },
    })
  }
}

export const qrCodeService = new QRCodeService()
