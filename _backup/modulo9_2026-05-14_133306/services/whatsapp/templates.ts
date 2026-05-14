interface CategoryItem { name: string; icon: string | null }
interface ProductItem { name: string; price: number; description: string | null }
interface CartItem { name: string; quantity: number; price: number }

export function welcomeNew(tenantName: string): string {
  return `👋 Olá! Bem-vindo à *${tenantName}*!\n\nPara começarmos, qual é o seu nome?`
}

export function welcomeReturning(customerName: string, loyaltyPoints: number): string {
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'

  return `${greeting}, *${customerName}*! 😊\n\n` +
    `O que você vai querer hoje?\n\n` +
    `1️⃣ Ver cardápio\n` +
    `2️⃣ Fazer pedido\n` +
    `3️⃣ Meus pedidos\n` +
    `4️⃣ Meus pontos (${loyaltyPoints} pts)\n` +
    `5️⃣ Falar com atendente\n\n` +
    `*Digite o número da opção:*`
}

export function requestName(): string {
  return `Por favor, digite seu nome completo:`
}

export function requestAddress(): string {
  return `✅ Nome salvo!\n\nAgora, qual é seu endereço completo?\n(Inclua rua, número, bairro e complemento)`
}

export function mainMenu(customerName: string, loyaltyPoints: number): string {
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'

  return `${greeting}, *${customerName}*! 😊\n\n` +
    `O que você vai querer hoje?\n\n` +
    `1️⃣ Ver cardápio\n` +
    `2️⃣ Fazer pedido\n` +
    `3️⃣ Meus pedidos\n` +
    `4️⃣ Meus pontos (${loyaltyPoints} pts)\n` +
    `5️⃣ Falar com atendente\n\n` +
    `*Digite o número da opção:*`
}

export function categoryMenu(categories: CategoryItem[]): string {
  let text = `📂 *Selecione uma categoria:*\n\n`
  categories.forEach((cat, index) => {
    text += `${index + 1} - ${cat.icon ?? '🍽️'} ${cat.name}\n`
  })
  return text
}

export function productMenu(products: ProductItem[], categoryName: string): string {
  let text = `📋 *${categoryName}*\n\n`
  products.forEach((p, index) => {
    const price = p.price.toFixed(2)
    text += `${index + 1} - *${p.name}* - R$ ${price}\n`
    if (p.description) text += `   ${p.description}\n`
  })
  text += `\n*Digite o número do produto desejado:*`
  return text
}

export function orderSummary(items: CartItem[], total: string, address: string): string {
  let text = `📝 *RESUMO DO PEDIDO*\n\n`
  items.forEach((item) => {
    text += `• ${item.quantity}x ${item.name} - R$ ${(item.price * item.quantity).toFixed(2)}\n`
  })
  text += `\n*Total: R$ ${total}*\n`
  text += `*Endereço: ${address}*\n\n`
  text += `1️⃣ Confirmar\n`
  text += `2️⃣ Editar endereço\n`
  text += `3️⃣ Cancelar`
  return text
}

export function orderConfirmed(orderNumber: number, estimatedTime: number): string {
  return `✅ *Pedido #${orderNumber} confirmado!*\n\n` +
    `⏱️ Tempo estimado: ${estimatedTime} minutos\n\n` +
    `Acompanhe o status pelo WhatsApp. Obrigado! 🎉`
}

export function pixPayment(pixCode: string, amount: string, expiresIn: number): string {
  return `💳 *Pagamento via PIX*\n\n` +
    `Valor: R$ ${amount}\n` +
    `Código: ${pixCode}\n\n` +
    `Expira em: ${expiresIn} minutos`
}
