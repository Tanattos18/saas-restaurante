import prisma from '@/lib/prisma'
import { sendMessage } from './message.service'
import * as templates from './templates'
import { sendMenu, sendCategories, sendProductsByCategory, createEmptyContext } from './flow.service'
import type { FlowContext } from './flow.service'
import type { ChatState, MessageType, Prisma } from '@prisma/client'

interface WhatsAppMessage {
  phone: string
  content: string
  type: MessageType
  timestamp: Date
}

function ctx(value: FlowContext): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue
}

async function getCustomer(tenantId: string, phone: string) {
  let customer = await prisma.customer.findUnique({
    where: { tenantId_phone: { tenantId, phone } },
  })
  if (!customer) {
    customer = await prisma.customer.create({
      data: { tenantId, phone, name: 'Cliente', address: '' },
    })
  }
  return customer
}

async function getOrCreateSession(tenantId: string, customerId: string, phone: string) {
  let session = await prisma.chatSession.findUnique({
    where: { tenantId_phone: { tenantId, phone } },
  })
  if (session && session.expiresAt && session.expiresAt < new Date()) {
    session = null
  }
  if (!session) {
    session = await prisma.chatSession.create({
      data: {
        tenantId, customerId, phone, state: 'WELCOME' as ChatState,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    })
  }
  return session
}

async function saveMessage(tenantId: string, customerId: string, sessionId: string, phone: string, content: string, type: string) {
  await prisma.chatMessage.create({
    data: { tenantId, customerId, sessionId, phone, direction: 'INBOUND' as const, type: type as MessageType, content },
  })
}

async function updateSession(sessionId: string, state: ChatState, context: FlowContext) {
  await prisma.chatSession.update({
    where: { id: sessionId },
    data: { state, context: ctx(context), lastMessageAt: new Date(), expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) },
  })
}

async function getTenantName(tenantId: string): Promise<string> {
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId }, select: { name: true } })
  return tenant?.name ?? 'Restaurante'
}

export class BotService {
  async processMessage(tenantId: string, message: WhatsAppMessage) {
    const { phone, content, type } = message

    const customer = await getCustomer(tenantId, phone)
    const session = await getOrCreateSession(tenantId, customer.id, phone)
    await saveMessage(tenantId, customer.id, session.id, phone, content, type)

    const rawContext = session.context as FlowContext | null
    const context: FlowContext = rawContext ?? createEmptyContext()
    const state = session.state as ChatState

    const lower = content.toLowerCase().trim()
    if (lower === 'cancelar') {
      await updateSession(session.id, 'SHOWING_MENU', createEmptyContext())
      await sendMessage({ tenantId, instanceName: '', phone, text: templates.mainMenu(customer.name, customer.loyaltyPoints) })
      return { success: true }
    }
    if (lower === 'menu') {
      await sendMenu(tenantId, phone)
      return { success: true }
    }

    await this.routeState(tenantId, session.id, state, customer, phone, content, context)
    return { success: true }
  }

  private async routeState(
    tenantId: string, sessionId: string, state: ChatState,
    customer: { id: string; name: string; address: string; loyaltyPoints: number },
    phone: string, message: string, context: FlowContext,
  ) {
    switch (state) {
      case 'WELCOME': return this.welcome(tenantId, sessionId, customer, phone)
      case 'COLLECTING_NAME': return this.collectName(tenantId, sessionId, customer, phone, message)
      case 'COLLECTING_ADDRESS': return this.collectAddress(tenantId, sessionId, customer, phone, message)
      case 'SHOWING_MENU': return this.showMenu(tenantId, sessionId, customer, phone, message, context)
      case 'SELECTING_CATEGORY': return this.selectCategory(tenantId, sessionId, phone, message, context)
      case 'SELECTING_PRODUCT': return this.selectProduct(tenantId, sessionId, phone, message, context)
      case 'BUILDING_ORDER': return this.buildOrder(tenantId, sessionId, customer, phone, message, context)
      case 'CONFIRMING_ORDER': return this.confirmOrder(tenantId, sessionId, customer, phone, message, context)
      case 'WAITING_PAYMENT': return this.waitPayment(tenantId, sessionId, customer, phone, message, context)
      case 'TALK_TO_HUMAN': return this.talkHuman(tenantId, phone)
      default: return this.welcome(tenantId, sessionId, customer, phone)
    }
  }

  private async welcome(tenantId: string, sessionId: string, customer: { id: string; name: string; address: string; loyaltyPoints: number }, phone: string) {
    const tenantName = await getTenantName(tenantId)

    if (!customer.name || customer.name === 'Cliente') {
      await updateSession(sessionId, 'COLLECTING_NAME', createEmptyContext())
      await sendMessage({ tenantId, instanceName: '', phone, text: templates.welcomeNew(tenantName) })
    } else if (!customer.address) {
      await updateSession(sessionId, 'COLLECTING_ADDRESS', createEmptyContext())
      await sendMessage({ tenantId, instanceName: '', phone, text: `👋 Olá, *${customer.name}*! Bem-vindo de volta!\n\nPara entregar seu pedido, qual é seu endereço completo?\n(Inclua rua, número, bairro e complemento)` })
    } else {
      await updateSession(sessionId, 'SHOWING_MENU', createEmptyContext())
      await sendMessage({ tenantId, instanceName: '', phone, text: templates.mainMenu(customer.name, customer.loyaltyPoints) })
    }
  }

  private async collectName(tenantId: string, sessionId: string, customer: { id: string }, phone: string, message: string) {
    if (message.length < 3) {
      await sendMessage({ tenantId, instanceName: '', phone, text: 'Por favor, digite seu nome completo:' })
      return
    }
    await prisma.customer.update({ where: { id: customer.id }, data: { name: message.trim() } })
    await updateSession(sessionId, 'COLLECTING_ADDRESS', createEmptyContext())
    await sendMessage({ tenantId, instanceName: '', phone, text: templates.requestAddress() })
  }

  private async collectAddress(tenantId: string, sessionId: string, customer: { id: string }, phone: string, message: string) {
    if (message.length < 10) {
      await sendMessage({ tenantId, instanceName: '', phone, text: 'Por favor, digite um endereço completo:' })
      return
    }
    await prisma.customer.update({ where: { id: customer.id }, data: { address: message.trim() } })
    await sendMenu(tenantId, phone)
    await updateSession(sessionId, 'SHOWING_MENU', createEmptyContext())
  }

  private async showMenu(tenantId: string, sessionId: string, customer: { id: string; name: string; loyaltyPoints: number }, phone: string, message: string, context: FlowContext) {
    const option = message.trim()

    if (option === '1') { await sendMenu(tenantId, phone); return }
    if (option === '2') { await sendCategories(tenantId, phone); await updateSession(sessionId, 'SELECTING_CATEGORY', context); return }
    if (option === '3') {
      const orders = await prisma.order.findMany({ where: { tenantId, customerId: customer.id }, orderBy: { createdAt: 'desc' }, take: 3 })
      const text = orders.length === 0 ? 'Você ainda não tem pedidos.' : '📋 *Últimos pedidos:*\n\n' + orders.map((o) => `#${o.orderNumber} - ${new Date(o.createdAt).toLocaleDateString('pt-BR')} - ${o.status}`).join('\n')
      await sendMessage({ tenantId, instanceName: '', phone, text })
      return
    }
    if (option === '4') { await sendMessage({ tenantId, instanceName: '', phone, text: `⭐ *Seus pontos:* ${customer.loyaltyPoints} pts` }); return }
    if (option === '5') {
      await updateSession(sessionId, 'TALK_TO_HUMAN', context)
      await sendMessage({ tenantId, instanceName: '', phone, text: '👤 Você será transferido para um atendente. Aguarde um momento!' })
      return
    }

    context.invalidAttempts++
    if (context.invalidAttempts >= 3) {
      await updateSession(sessionId, 'TALK_TO_HUMAN', context)
      await sendMessage({ tenantId, instanceName: '', phone, text: '👤 Transferindo para atendente...' })
    } else {
      await updateSession(sessionId, 'SHOWING_MENU', context)
      await sendMessage({ tenantId, instanceName: '', phone, text: 'Opção inválida. Digite um número de 1 a 5:' })
    }
  }

  private async selectCategory(tenantId: string, sessionId: string, phone: string, message: string, context: FlowContext) {
    const categories = await prisma.category.findMany({ where: { tenantId, active: true }, orderBy: { position: 'asc' } })
    const index = parseInt(message.trim(), 10)

    if (isNaN(index) || index < 1 || index > categories.length) {
      context.invalidAttempts++
      if (context.invalidAttempts >= 3) {
        await updateSession(sessionId, 'TALK_TO_HUMAN', context)
        await sendMessage({ tenantId, instanceName: '', phone, text: '👤 Transferindo para atendente...' })
      } else {
        await sendMessage({ tenantId, instanceName: '', phone, text: 'Opção inválida. Digite o número da categoria:' })
        await updateSession(sessionId, 'SELECTING_CATEGORY', context)
      }
      return
    }

    context.selectedCategoryId = categories[index - 1]!.id
    context.invalidAttempts = 0
    await sendProductsByCategory(tenantId, phone, context.selectedCategoryId)
    await updateSession(sessionId, 'SELECTING_PRODUCT', context)
  }

  private async selectProduct(tenantId: string, sessionId: string, phone: string, message: string, context: FlowContext) {
    if (!context.selectedCategoryId) {
      await sendCategories(tenantId, phone)
      await updateSession(sessionId, 'SELECTING_CATEGORY', context)
      return
    }

    const category = await prisma.category.findUnique({
      where: { id: context.selectedCategoryId },
      include: { products: { where: { active: true, showInQRCode: true }, orderBy: { position: 'asc' } } },
    })

    if (!category || category.products.length === 0) {
      await sendCategories(tenantId, phone)
      context.selectedCategoryId = null
      await updateSession(sessionId, 'SELECTING_CATEGORY', context)
      return
    }

    const index = parseInt(message.trim(), 10)
    if (isNaN(index) || index < 1 || index > category.products.length) {
      context.invalidAttempts++
      if (context.invalidAttempts >= 3) {
        await updateSession(sessionId, 'TALK_TO_HUMAN', context)
        await sendMessage({ tenantId, instanceName: '', phone, text: '👤 Transferindo para atendente...' })
      } else {
        await sendMessage({ tenantId, instanceName: '', phone, text: 'Opção inválida. Digite o número do produto:' })
        await updateSession(sessionId, 'SELECTING_PRODUCT', context)
      }
      return
    }

    const product = category.products[index - 1]!
    const price = Number(product.promoPrice ?? product.price)
    context.cart.push({ productId: product.id, name: product.name, price, quantity: 1, notes: '' })
    context.invalidAttempts = 0

    await sendMessage({ tenantId, instanceName: '', phone, text: `✅ *${product.name}* adicionado ao carrinho!\n\n1️⃣ Adicionar mais itens\n2️⃣ Finalizar pedido` })
    await updateSession(sessionId, 'BUILDING_ORDER', context)
  }

  private async buildOrder(tenantId: string, sessionId: string, customer: { id: string; name: string; address: string; loyaltyPoints: number }, phone: string, message: string, context: FlowContext) {
    const option = message.trim()

    if (option === '1') {
      await sendCategories(tenantId, phone)
      await updateSession(sessionId, 'SELECTING_CATEGORY', context)
      return
    }

    if (option === '2') {
      if (!customer.address) {
        await sendMessage({ tenantId, instanceName: '', phone, text: 'Você precisa cadastrar um endereço primeiro.' })
        await updateSession(sessionId, 'COLLECTING_ADDRESS', context)
        return
      }
      const total = context.cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
      const items = context.cart.map((i) => ({ name: i.name, quantity: i.quantity, price: i.price }))
      await sendMessage({ tenantId, instanceName: '', phone, text: templates.orderSummary(items, total.toFixed(2), customer.address) })
      await updateSession(sessionId, 'CONFIRMING_ORDER', context)
      return
    }

    context.invalidAttempts++
    if (context.invalidAttempts >= 3) {
      await updateSession(sessionId, 'TALK_TO_HUMAN', context)
      await sendMessage({ tenantId, instanceName: '', phone, text: '👤 Transferindo para atendente...' })
    } else {
      await sendMessage({ tenantId, instanceName: '', phone, text: 'Digite 1 para adicionar mais itens ou 2 para finalizar:' })
      await updateSession(sessionId, 'BUILDING_ORDER', context)
    }
  }

  private async confirmOrder(tenantId: string, sessionId: string, customer: { id: string; name: string; address: string }, phone: string, message: string, context: FlowContext) {
    const option = message.trim()

    if (option === '1') {
      const total = context.cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
      const lastOrder = await prisma.order.findFirst({ where: { tenantId }, orderBy: { orderNumber: 'desc' }, select: { orderNumber: true } })
      const nextNumber = (lastOrder?.orderNumber ?? 0) + 1

      await prisma.order.create({
        data: {
          tenantId, customerId: customer.id, orderNumber: nextNumber, channel: 'WHATSAPP', type: 'DELIVERY', status: 'PENDING',
          customerName: customer.name, customerPhone: phone, customerAddress: customer.address,
          subtotal: total, deliveryFee: 0, discount: 0, total,
          items: { create: context.cart.map((item) => ({ productId: item.productId, quantity: item.quantity, unitPrice: item.price, totalPrice: item.price * item.quantity, notes: item.notes || null })) },
        },
      })

      for (const item of context.cart) {
        const product = await prisma.product.findUnique({ where: { id: item.productId } })
        if (product?.stock !== null && product?.stock !== undefined) {
          await prisma.product.update({ where: { id: item.productId }, data: { stock: Math.max(0, product.stock - item.quantity) } })
        }
      }

      await sendMessage({ tenantId, instanceName: '', phone, text: templates.orderConfirmed(nextNumber, 30) })
      await sendMessage({ tenantId, instanceName: '', phone, text: '💳 *Forma de pagamento:*\n\n1️⃣ PIX\n2️⃣ Dinheiro\n3️⃣ Cartão na entrega' })
      await updateSession(sessionId, 'WAITING_PAYMENT', context)
      return
    }

    if (option === '2') {
      await sendMessage({ tenantId, instanceName: '', phone, text: 'Digite o novo endereço completo:' })
      await updateSession(sessionId, 'COLLECTING_ADDRESS', context)
      return
    }

    if (option === '3') {
      await updateSession(sessionId, 'SHOWING_MENU', createEmptyContext())
      await sendMessage({ tenantId, instanceName: '', phone, text: templates.mainMenu(customer.name, 0) })
      return
    }

    await sendMessage({ tenantId, instanceName: '', phone, text: 'Opção inválida. Digite 1 para confirmar, 2 para editar endereço ou 3 para cancelar:' })
  }

  private async waitPayment(tenantId: string, sessionId: string, customer: { id: string; name: string }, phone: string, _message: string, context: FlowContext) {
    const option = _message.trim()

    if (option === '1') {
      await sendMessage({ tenantId, instanceName: '', phone, text: '💳 Pagamento via PIX\n\nGere o QR Code pelo aplicativo do seu banco.\nApós o pagamento, seu pedido será confirmado.' })
    } else if (option === '2' || option === '3') {
      await sendMessage({ tenantId, instanceName: '', phone, text: '✅ Pagamento confirmado na entrega!' })
    } else {
      await sendMessage({ tenantId, instanceName: '', phone, text: 'Opção inválida. Digite 1 (PIX), 2 (Dinheiro) ou 3 (Cartão):' })
      return
    }

    await updateSession(sessionId, 'SHOWING_MENU', createEmptyContext())
    await sendMessage({ tenantId, instanceName: '', phone, text: '🎉 Pedido registrado! Acompanhe pelo WhatsApp.' })
  }

  private async talkHuman(tenantId: string, phone: string) {
    await sendMessage({ tenantId, instanceName: '', phone, text: '👤 Aguardando atendente. Em breve alguém irá atendê-lo.' })
  }
}

export const botService = new BotService()
