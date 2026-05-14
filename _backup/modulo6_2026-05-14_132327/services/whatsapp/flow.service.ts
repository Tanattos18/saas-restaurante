import prisma from '@/lib/prisma'
import { sendMessage } from './message.service'
import * as templates from './templates'

export interface FlowContext {
  [key: string]: unknown
  cart: Array<{ productId: string; name: string; price: number; quantity: number; notes: string }>
  selectedCategoryId: string | null
  orderType: 'DELIVERY' | 'PICKUP'
  invalidAttempts: number
}

export function createEmptyContext(): FlowContext {
  return { cart: [], selectedCategoryId: null, orderType: 'DELIVERY', invalidAttempts: 0 }
}

export async function sendMenu(tenantId: string, phone: string) {
  const categories = await prisma.category.findMany({
    where: { tenantId, active: true, showInQRCode: true },
    include: {
      products: {
        where: { active: true, showInQRCode: true },
        orderBy: { position: 'asc' },
      },
    },
    orderBy: { position: 'asc' },
  })

  let menuText = '📋 *CARDÁPIO COMPLETO*\n\n'
  for (const cat of categories) {
    menuText += `*${cat.icon ?? '🍽️'} ${cat.name}*\n`
    for (const product of cat.products) {
      const price = product.promoPrice ?? product.price
      menuText += `• ${product.name} - R$ ${Number(price).toFixed(2)}\n`
    }
    menuText += '\n'
  }
  menuText += 'Para fazer um pedido, digite *2* no menu principal.'

  await sendMessage({ tenantId, instanceName: '', phone, text: menuText })
}

export async function sendCategories(tenantId: string, phone: string) {
  const categories = await prisma.category.findMany({
    where: { tenantId, active: true },
    orderBy: { position: 'asc' },
  })

  const catItems = categories.map((c) => ({ name: c.name, icon: c.icon }))
  await sendMessage({ tenantId, instanceName: '', phone, text: templates.categoryMenu(catItems) })
}

export async function sendProductsByCategory(tenantId: string, phone: string, categoryId: string) {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    include: {
      products: {
        where: { active: true, showInQRCode: true },
        orderBy: { position: 'asc' },
      },
    },
  })

  if (!category) {
    await sendMessage({ tenantId, instanceName: '', phone, text: 'Categoria não encontrada.' })
    return
  }

  const products = category.products.map((p) => ({
    name: p.name,
    price: Number(p.promoPrice ?? p.price),
    description: p.description,
  }))

  await sendMessage({ tenantId, instanceName: '', phone, text: templates.productMenu(products, category.name) })
}
