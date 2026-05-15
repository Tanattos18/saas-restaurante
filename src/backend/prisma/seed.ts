import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed...')

  const hashedPassword = await bcrypt.hash('admin123', 10)

  const tenant = await prisma.tenant.upsert({
    where: { slug: 'restaurante-teste' },
    update: {},
    create: {
      slug: 'restaurante-teste',
      name: 'Restaurante Teste',
      email: 'contato@restaurante-teste.com',
      phone: '5511999999999',
      address: 'Rua Augusta, 1500',
      city: 'São Paulo',
      state: 'SP',
      cnpj: '00.000.000/0001-00',
      plan: 'PRO',
      status: 'ACTIVE',
      subscriptionStatus: 'ACTIVE',
      settings: {
        primaryColor: '#ef4444',
        logo: null,
        openingHours: {
          weekdays: '08:00-23:00',
          weekends: '09:00-00:00',
        },
      },
    },
  })

  console.log(`✅ Tenant criado: ${tenant.name} (${tenant.slug})`)

  const admin = await prisma.user.upsert({
    where: {
      tenantId_email: { tenantId: tenant.id, email: 'admin@restaurante.com' },
    },
    update: {},
    create: {
      tenantId: tenant.id,
      email: 'admin@restaurante.com',
      password: hashedPassword,
      name: 'Admin Teste',
      role: 'OWNER',
      phone: '5511988888888',
    },
  })

  console.log(`✅ Admin criado: ${admin.email} (senha: admin123)`)

  const categories = await Promise.all([
    prisma.category.upsert({
      where: { id: 'cat-lanches' },
      update: {},
      create: {
        id: 'cat-lanches',
        tenantId: tenant.id,
        name: 'Lanches',
        description: 'Hambúrgueres artesanais e sanduíches',
        icon: '🍔',
        position: 1,
      },
    }),
    prisma.category.upsert({
      where: { id: 'cat-bebidas' },
      update: {},
      create: {
        id: 'cat-bebidas',
        tenantId: tenant.id,
        name: 'Bebidas',
        description: 'Refrigerantes, sucos e cervejas',
        icon: '🥤',
        position: 2,
      },
    }),
    prisma.category.upsert({
      where: { id: 'cat-porcoes' },
      update: {},
      create: {
        id: 'cat-porcoes',
        tenantId: tenant.id,
        name: 'Porções',
        description: 'Porções para compartilhar',
        icon: '🍟',
        position: 3,
      },
    }),
  ])

  console.log(`✅ ${categories.length} categorias criadas`)

  const products = await Promise.all([
    prisma.product.create({
      data: {
        tenantId: tenant.id,
        categoryId: 'cat-lanches',
        name: 'X-Bacon Especial',
        description: 'Hambúrguer 180g, queijo cheddar, bacon crocante, alface e tomate',
        price: 34.90,
        promoPrice: 29.90,
        preparationTime: 15,
        calories: 650,
        stock: 20,
        minStock: 5,
        position: 1,
      },
    }),
    prisma.product.create({
      data: {
        tenantId: tenant.id,
        categoryId: 'cat-lanches',
        name: 'X-Salada Simples',
        description: 'Hambúrguer 150g, queijo prato, alface e tomate',
        price: 24.90,
        preparationTime: 10,
        calories: 450,
        stock: null,
        minStock: 5,
        position: 2,
      },
    }),
    prisma.product.create({
      data: {
        tenantId: tenant.id,
        categoryId: 'cat-bebidas',
        name: 'Coca-Cola Lata 350ml',
        price: 6.90,
        preparationTime: 1,
        calories: 140,
        stock: 100,
        minStock: 20,
        position: 1,
      },
    }),
    prisma.product.create({
      data: {
        tenantId: tenant.id,
        categoryId: 'cat-bebidas',
        name: 'Suco Natural de Laranja 500ml',
        description: 'Suco de laranja fresca, sem açúcar',
        price: 12.90,
        preparationTime: 5,
        calories: 180,
        isVegan: true,
        isGlutenFree: true,
        stock: 30,
        minStock: 10,
        position: 2,
      },
    }),
    prisma.product.create({
      data: {
        tenantId: tenant.id,
        categoryId: 'cat-porcoes',
        name: 'Batata Frita com Cheddar e Bacon',
        description: 'Porção de batata frita crocante coberta com cheddar e bacon',
        price: 39.90,
        preparationTime: 20,
        calories: 850,
        stock: 15,
        minStock: 5,
        position: 1,
      },
    }),
  ])

  console.log(`✅ ${products.length} produtos criados`)

  // Inventory items (ingredientes)
  const inventoryItems = await Promise.all([
    prisma.inventoryItem.upsert({
      where: { tenantId_name: { tenantId: tenant.id, name: 'Pão de Hambúrguer' } },
      update: {},
      create: { tenantId: tenant.id, name: 'Pão de Hambúrguer', unit: 'un', currentStock: 50, minStock: 20, maxStock: 100, cost: 1.50, supplier: 'Distribuidora de Pães' },
    }),
    prisma.inventoryItem.upsert({
      where: { tenantId_name: { tenantId: tenant.id, name: 'Carne Bovina 180g' } },
      update: {},
      create: { tenantId: tenant.id, name: 'Carne Bovina 180g', unit: 'un', currentStock: 30, minStock: 15, maxStock: 60, cost: 4.50, supplier: 'Açougue ABC' },
    }),
    prisma.inventoryItem.upsert({
      where: { tenantId_name: { tenantId: tenant.id, name: 'Carne Bovina 150g' } },
      update: {},
      create: { tenantId: tenant.id, name: 'Carne Bovina 150g', unit: 'un', currentStock: 25, minStock: 10, maxStock: 50, cost: 3.80, supplier: 'Açougue ABC' },
    }),
    prisma.inventoryItem.upsert({
      where: { tenantId_name: { tenantId: tenant.id, name: 'Queijo Cheddar' } },
      update: {},
      create: { tenantId: tenant.id, name: 'Queijo Cheddar', unit: 'kg', currentStock: 5, minStock: 2, maxStock: 10, cost: 28.00, supplier: 'Laticínios Silva' },
    }),
    prisma.inventoryItem.upsert({
      where: { tenantId_name: { tenantId: tenant.id, name: 'Queijo Prato' } },
      update: {},
      create: { tenantId: tenant.id, name: 'Queijo Prato', unit: 'kg', currentStock: 4, minStock: 2, maxStock: 8, cost: 32.00, supplier: 'Laticínios Silva' },
    }),
    prisma.inventoryItem.upsert({
      where: { tenantId_name: { tenantId: tenant.id, name: 'Bacon em Fatias' } },
      update: {},
      create: { tenantId: tenant.id, name: 'Bacon em Fatias', unit: 'kg', currentStock: 3, minStock: 1, maxStock: 8, cost: 22.00, supplier: 'Açougue ABC' },
    }),
    prisma.inventoryItem.upsert({
      where: { tenantId_name: { tenantId: tenant.id, name: 'Alface' } },
      update: {},
      create: { tenantId: tenant.id, name: 'Alface', unit: 'un', currentStock: 20, minStock: 10, maxStock: 40, cost: 1.20, supplier: 'Feira Fresh' },
    }),
    prisma.inventoryItem.upsert({
      where: { tenantId_name: { tenantId: tenant.id, name: 'Tomate' } },
      update: {},
      create: { tenantId: tenant.id, name: 'Tomate', unit: 'kg', currentStock: 8, minStock: 3, maxStock: 15, cost: 4.00, supplier: 'Feira Fresh' },
    }),
    prisma.inventoryItem.upsert({
      where: { tenantId_name: { tenantId: tenant.id, name: 'Batata Inglesa' } },
      update: {},
      create: { tenantId: tenant.id, name: 'Batata Inglesa', unit: 'kg', currentStock: 15, minStock: 5, maxStock: 30, cost: 3.50, supplier: 'Feira Fresh' },
    }),
    prisma.inventoryItem.upsert({
      where: { tenantId_name: { tenantId: tenant.id, name: 'Óleo de Cozinha' } },
      update: {},
      create: { tenantId: tenant.id, name: 'Óleo de Cozinha', unit: 'lt', currentStock: 10, minStock: 3, maxStock: 20, cost: 6.50, supplier: 'Atacadista São Paulo' },
    }),
    prisma.inventoryItem.upsert({
      where: { tenantId_name: { tenantId: tenant.id, name: 'Coca-Cola Lata' } },
      update: {},
      create: { tenantId: tenant.id, name: 'Coca-Cola Lata', unit: 'un', currentStock: 100, minStock: 20, maxStock: 200, cost: 2.50, supplier: 'Bebidas Gerais' },
    }),
    prisma.inventoryItem.upsert({
      where: { tenantId_name: { tenantId: tenant.id, name: 'Laranja' } },
      update: {},
      create: { tenantId: tenant.id, name: 'Laranja', unit: 'kg', currentStock: 20, minStock: 10, maxStock: 40, cost: 2.80, supplier: 'Feira Fresh' },
    }),
    prisma.inventoryItem.upsert({
      where: { tenantId_name: { tenantId: tenant.id, name: 'Guardanapo' } },
      update: {},
      create: { tenantId: tenant.id, name: 'Guardanapo', unit: 'pct', currentStock: 30, minStock: 10, maxStock: 60, cost: 3.00, supplier: 'Embalagens Plus' },
    }),
    prisma.inventoryItem.upsert({
      where: { tenantId_name: { tenantId: tenant.id, name: 'Embalagem para Delivery' } },
      update: {},
      create: { tenantId: tenant.id, name: 'Embalagem para Delivery', unit: 'un', currentStock: 80, minStock: 20, maxStock: 150, cost: 0.80, supplier: 'Embalagens Plus' },
    }),
  ])

  console.log(`✅ ${inventoryItems.length} itens de estoque criados`)
  console.log('\n🎉 Seed concluído com sucesso!')
  console.log('\n📝 Credenciais de teste:')
  console.log('   Tenant: restaurante-teste')
  console.log('   Email:  admin@restaurante.com')
  console.log('   Senha:  admin123')
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
