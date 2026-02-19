import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed...')

  // Cria usuário de teste
  const user = await prisma.user.create({
    data: {
      email: 'teste@exemplo.com',
      passwordHash: '$2a$10$teste', // Não usar em produção
      name: 'Usuário Teste',
    },
  })

  console.log('✅ Usuário criado:', user.email)

  // Cria assinatura de futebol
  const subscription = await prisma.subscription.create({
    data: {
      userId: user.id,
      sport: 'football',
      planName: 'Pro',
      monthlyQuota: 10000,
      biWeeklyQuota: 5000,
      currentUsage: 0,
      cycleStartDate: new Date(),
      isActive: true,
    },
  })

  console.log('✅ Assinatura criada:', subscription.sport)

  // Cria API Key de teste
  const apiKey = await prisma.apiKey.create({
    data: {
      key: 'br_football_teste123456789',
      subscriptionId: subscription.id,
      isActive: true,
    },
  })

  console.log('✅ API Key criada:', apiKey.key)
  console.log('\n📌 Use esta API Key para testar: br_football_teste123456789')

  // Cria assinatura de basquete também
  const subscriptionBasket = await prisma.subscription.create({
    data: {
      userId: user.id,
      sport: 'basketball',
      planName: 'Basic',
      monthlyQuota: 5000,
      biWeeklyQuota: 2500,
      currentUsage: 0,
      cycleStartDate: new Date(),
      isActive: true,
    },
  })

  const apiKeyBasket = await prisma.apiKey.create({
    data: {
      key: 'br_basketball_teste987654321',
      subscriptionId: subscriptionBasket.id,
      isActive: true,
    },
  })

  console.log('✅ API Key de basquete:', apiKeyBasket.key)
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
