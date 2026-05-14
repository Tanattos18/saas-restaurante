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
