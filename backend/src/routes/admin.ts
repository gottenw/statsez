import { Hono } from 'hono'
import { prisma } from '../lib/prisma.js'
import { adminAuth } from '../middleware/adminAuth.js'

const app = new Hono()

app.use('*', adminAuth)

// ============================================
// STATISTICS ENDPOINTS
// ============================================

// GET /admin/stats/overview
app.get('/stats/overview', async (c) => {
  const [
    totalUsers,
    activeSubscriptions,
    subscriptionsByPlan,
    totalRevenueResult,
    totalRequests,
    cachedRequests
  ] = await Promise.all([
    prisma.user.count(),
    prisma.subscription.count({ where: { isActive: true } }),
    prisma.subscription.groupBy({
      by: ['planName'],
      where: { isActive: true },
      _count: { id: true }
    }),
    prisma.payment.aggregate({
      where: { status: 'paid' },
      _sum: { amount: true }
    }),
    prisma.requestLog.count(),
    prisma.requestLog.count({ where: { cached: true } })
  ])

  const cacheHitRatio = totalRequests > 0 ? (cachedRequests / totalRequests) * 100 : 0

  const planBreakdown: Record<string, number> = {}
  for (const item of subscriptionsByPlan) {
    planBreakdown[item.planName] = item._count.id
  }

  return c.json({
    success: true,
    data: {
      totalUsers,
      activeSubscriptions,
      subscriptionsByPlan: planBreakdown,
      totalRevenue: Number(totalRevenueResult._sum.amount) || 0,
      totalRequests,
      cachedRequests,
      cacheHitRatio: Math.round(cacheHitRatio * 100) / 100
    }
  })
})

// GET /admin/stats/requests?period=7d|30d|90d
app.get('/stats/requests', async (c) => {
  const period = c.req.query('period') || '7d'
  const days = period === '90d' ? 90 : period === '30d' ? 30 : 7

  const since = new Date()
  since.setDate(since.getDate() - days)

  const logs = await prisma.requestLog.findMany({
    where: { createdAt: { gte: since } },
    select: { createdAt: true },
    orderBy: { createdAt: 'asc' }
  })

  const dailyMap: Record<string, number> = {}
  for (const log of logs) {
    const dateKey = log.createdAt.toISOString().split('T')[0]
    dailyMap[dateKey] = (dailyMap[dateKey] || 0) + 1
  }

  const data = Object.entries(dailyMap).map(([date, requests]) => ({ date, requests }))

  return c.json({ success: true, data })
})

// GET /admin/stats/top-endpoints?limit=10
app.get('/stats/top-endpoints', async (c) => {
  const limit = parseInt(c.req.query('limit') || '10')

  const result = await prisma.requestLog.groupBy({
    by: ['endpoint'],
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: limit
  })

  const data = result.map((item) => ({
    endpoint: item.endpoint,
    count: item._count.id
  }))

  return c.json({ success: true, data })
})

// GET /admin/stats/revenue?period=30d|90d|365d
app.get('/stats/revenue', async (c) => {
  const period = c.req.query('period') || '30d'
  const days = period === '365d' ? 365 : period === '90d' ? 90 : 30

  const since = new Date()
  since.setDate(since.getDate() - days)

  const payments = await prisma.payment.findMany({
    where: { status: 'paid', paidAt: { gte: since } },
    select: { amount: true, paidAt: true },
    orderBy: { paidAt: 'asc' }
  })

  const dailyMap: Record<string, number> = {}
  for (const p of payments) {
    if (!p.paidAt) continue
    const dateKey = p.paidAt.toISOString().split('T')[0]
    dailyMap[dateKey] = (dailyMap[dateKey] || 0) + Number(p.amount)
  }

  const data = Object.entries(dailyMap).map(([date, revenue]) => ({ date, revenue: Math.round(revenue * 100) / 100 }))

  return c.json({ success: true, data })
})

// GET /admin/stats/growth?period=30d
app.get('/stats/growth', async (c) => {
  const period = c.req.query('period') || '30d'
  const days = period === '90d' ? 90 : period === '7d' ? 7 : 30

  const since = new Date()
  since.setDate(since.getDate() - days)

  const users = await prisma.user.findMany({
    where: { createdAt: { gte: since } },
    select: { createdAt: true },
    orderBy: { createdAt: 'asc' }
  })

  const dailyMap: Record<string, number> = {}
  for (const u of users) {
    const dateKey = u.createdAt.toISOString().split('T')[0]
    dailyMap[dateKey] = (dailyMap[dateKey] || 0) + 1
  }

  const data = Object.entries(dailyMap).map(([date, newUsers]) => ({ date, newUsers }))

  return c.json({ success: true, data })
})

// GET /admin/stats/cost-analysis
app.get('/stats/cost-analysis', async (c) => {
  const upstreamPlans = [
    { name: 'Plan A', limit: parseInt(process.env.UPSTREAM_PLAN_A_LIMIT || '50000'), cost: parseFloat(process.env.UPSTREAM_PLAN_A_COST || '45') },
    { name: 'Plan B', limit: parseInt(process.env.UPSTREAM_PLAN_B_LIMIT || '1000000'), cost: parseFloat(process.env.UPSTREAM_PLAN_B_COST || '280') },
    { name: 'Plan C', limit: parseInt(process.env.UPSTREAM_PLAN_C_LIMIT || '5000000'), cost: parseFloat(process.env.UPSTREAM_PLAN_C_COST || '1300') },
  ]

  const railwayCost = parseFloat(process.env.RAILWAY_MONTHLY_COST || '40')
  const hostingYearlyCost = parseFloat(process.env.HOSTING_YEARLY_COST || '50')
  const fixedCosts = railwayCost + (hostingYearlyCost / 12)

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

  const [totalThisMonth, monthRevenue] = await Promise.all([
    prisma.requestLog.count({ where: { createdAt: { gte: monthStart } } }),
    prisma.payment.aggregate({
      where: { status: 'paid', paidAt: { gte: monthStart } },
      _sum: { amount: true }
    })
  ])

  const currentPlan = upstreamPlans.find(p => totalThisMonth <= p.limit) || upstreamPlans[upstreamPlans.length - 1]
  const currentPlanIndex = upstreamPlans.indexOf(currentPlan)
  const percentUsed = currentPlan.limit > 0 ? (totalThisMonth / currentPlan.limit) * 100 : 0

  const alerts: Array<{ level: string; message: string; recommendation: string }> = []
  const thresholds = [
    { pct: 95, level: 'critical' },
    { pct: 90, level: 'warning' },
    { pct: 80, level: 'info' },
  ]

  for (const t of thresholds) {
    if (percentUsed >= t.pct) {
      const nextPlan = upstreamPlans[currentPlanIndex + 1]
      alerts.push({
        level: t.level,
        message: `${percentUsed.toFixed(1)}% do ${currentPlan.name} utilizado (${totalThisMonth.toLocaleString()}/${currentPlan.limit.toLocaleString()})`,
        recommendation: nextPlan
          ? `Considere upgrade para ${nextPlan.name} (R$${nextPlan.cost}/mês)`
          : 'Tier máximo atingido'
      })
      break // Only the highest triggered alert
    }
  }

  const revenue = Number(monthRevenue._sum.amount) || 0

  return c.json({
    success: true,
    data: {
      period: { start: monthStart.toISOString(), end: now.toISOString() },
      totalRequestsThisMonth: totalThisMonth,
      currentUpstreamPlan: currentPlan.name,
      currentPlanLimit: currentPlan.limit,
      currentPlanCost: currentPlan.cost,
      percentageUsed: Math.round(percentUsed * 100) / 100,
      nextPlanThreshold: upstreamPlans[currentPlanIndex + 1]?.limit ?? null,
      alerts,
      financials: {
        monthlyRevenue: revenue,
        upstreamCost: currentPlan.cost,
        fixedCosts: Math.round(fixedCosts * 100) / 100,
        estimatedProfit: Math.round((revenue - currentPlan.cost - fixedCosts) * 100) / 100
      },
      upstreamPlans: upstreamPlans.map(p => ({
        name: p.name,
        limit: p.limit,
        cost: p.cost,
        costPerReq: p.limit > 0 ? Math.round((p.cost / p.limit) * 1000000) / 1000000 : 0
      }))
    }
  })
})

// ============================================
// USER MANAGEMENT
// ============================================

// GET /admin/users?page=1&limit=20&search=
app.get('/users', async (c) => {
  const page = parseInt(c.req.query('page') || '1')
  const limit = parseInt(c.req.query('limit') || '20')
  const search = c.req.query('search') || ''
  const skip = (page - 1) * limit

  const where = search
    ? { OR: [{ email: { contains: search, mode: 'insensitive' as const } }, { name: { contains: search, mode: 'insensitive' as const } }] }
    : {}

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        subscriptions: {
          where: { isActive: true },
          select: { planName: true, currentUsage: true, biWeeklyQuota: true, sport: true }
        }
      }
    }),
    prisma.user.count({ where })
  ])

  return c.json({
    success: true,
    data: users.map(u => ({
      ...u,
      activePlan: u.subscriptions[0]?.planName || null,
      usage: u.subscriptions[0] ? `${u.subscriptions[0].currentUsage}/${u.subscriptions[0].biWeeklyQuota}` : null
    })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
  })
})

// GET /admin/users/:userId
app.get('/users/:userId', async (c) => {
  const userId = c.req.param('userId')

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      googleId: true,
      createdAt: true,
      updatedAt: true,
      subscriptions: {
        orderBy: { createdAt: 'desc' },
        include: { apiKey: { select: { id: true, key: true, isActive: true, lastUsedAt: true, createdAt: true } } }
      },
      payments: {
        orderBy: { createdAt: 'desc' },
        take: 50
      }
    }
  })

  if (!user) {
    return c.json({ success: false, error: 'User not found' }, 404)
  }

  return c.json({ success: true, data: user })
})

// PATCH /admin/users/:userId/subscription
app.patch('/users/:userId/subscription', async (c) => {
  const userId = c.req.param('userId')
  const body = await c.req.json()

  const subscription = await prisma.subscription.findFirst({
    where: { userId, isActive: true }
  })

  if (!subscription) {
    return c.json({ success: false, error: 'No active subscription found' }, 404)
  }

  const updateData: Record<string, unknown> = {}

  if (body.planName !== undefined) {
    const validPlans = ['free', 'dev', 'enterprise', 'gold']
    if (!validPlans.includes(body.planName)) {
      return c.json({ success: false, error: 'Invalid plan name' }, 400)
    }
    updateData.planName = body.planName
  }

  if (body.monthlyQuota !== undefined) {
    updateData.monthlyQuota = parseInt(body.monthlyQuota)
  }

  if (body.biWeeklyQuota !== undefined) {
    updateData.biWeeklyQuota = parseInt(body.biWeeklyQuota)
  }

  if (body.isActive !== undefined) {
    updateData.isActive = Boolean(body.isActive)
  }

  if (body.currentUsage !== undefined) {
    updateData.currentUsage = parseInt(body.currentUsage)
  }

  const updated = await prisma.subscription.update({
    where: { id: subscription.id },
    data: updateData
  })

  return c.json({ success: true, data: updated })
})

// POST /admin/users/:userId/deactivate
app.post('/users/:userId/deactivate', async (c) => {
  const userId = c.req.param('userId')

  const result = await prisma.subscription.updateMany({
    where: { userId, isActive: true },
    data: { isActive: false }
  })

  return c.json({ success: true, data: { deactivated: result.count } })
})

// ============================================
// API KEY MANAGEMENT
// ============================================

// GET /admin/keys?page=1&limit=20
app.get('/keys', async (c) => {
  const page = parseInt(c.req.query('page') || '1')
  const limit = parseInt(c.req.query('limit') || '20')
  const skip = (page - 1) * limit

  const [keys, total] = await Promise.all([
    prisma.apiKey.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        subscription: {
          select: {
            planName: true,
            sport: true,
            isActive: true,
            user: { select: { email: true, name: true } }
          }
        }
      }
    }),
    prisma.apiKey.count()
  ])

  return c.json({
    success: true,
    data: keys.map(k => ({
      id: k.id,
      key: k.key.substring(0, 16) + '...',
      isActive: k.isActive,
      lastUsedAt: k.lastUsedAt,
      createdAt: k.createdAt,
      plan: k.subscription?.planName || null,
      sport: k.subscription?.sport || null,
      subscriptionActive: k.subscription?.isActive || false,
      userEmail: k.subscription?.user?.email || null,
      userName: k.subscription?.user?.name || null
    })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
  })
})

// POST /admin/keys/:keyId/revoke
app.post('/keys/:keyId/revoke', async (c) => {
  const keyId = c.req.param('keyId')

  const key = await prisma.apiKey.findUnique({ where: { id: keyId } })
  if (!key) {
    return c.json({ success: false, error: 'Key not found' }, 404)
  }

  await prisma.apiKey.update({
    where: { id: keyId },
    data: { isActive: false }
  })

  return c.json({ success: true, data: { revoked: true } })
})

// ============================================
// PAYMENT MANAGEMENT
// ============================================

// GET /admin/payments?page=1&limit=20&status=
app.get('/payments', async (c) => {
  const page = parseInt(c.req.query('page') || '1')
  const limit = parseInt(c.req.query('limit') || '20')
  const status = c.req.query('status')
  const skip = (page - 1) * limit

  const where = status ? { status } : {}

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { email: true, name: true } },
        subscription: { select: { planName: true, sport: true } }
      }
    }),
    prisma.payment.count({ where })
  ])

  return c.json({
    success: true,
    data: payments.map(p => ({
      id: p.id,
      amount: Number(p.amount),
      currency: p.currency,
      status: p.status,
      provider: p.provider,
      providerId: p.providerId,
      paidAt: p.paidAt,
      createdAt: p.createdAt,
      plan: p.subscription?.planName || null,
      userEmail: p.user?.email || null,
      userName: p.user?.name || null
    })),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
  })
})

// ============================================
// SYSTEM HEALTH
// ============================================

// GET /admin/system/cache
app.get('/system/cache', async (c) => {
  const now = new Date()

  const [totalEntries, expiredEntries, bySport, byEndpoint] = await Promise.all([
    prisma.cache.count(),
    prisma.cache.count({ where: { expiresAt: { lt: now } } }),
    prisma.cache.groupBy({ by: ['sport'], _count: { key: true } }),
    prisma.cache.groupBy({ by: ['endpoint'], _count: { key: true } })
  ])

  return c.json({
    success: true,
    data: {
      totalEntries,
      expiredEntries,
      activeEntries: totalEntries - expiredEntries,
      bySport: bySport.map(s => ({ sport: s.sport, count: s._count.key })),
      byEndpoint: byEndpoint.map(e => ({ endpoint: e.endpoint, count: e._count.key }))
    }
  })
})

// DELETE /admin/system/cache/expired
app.delete('/system/cache/expired', async (c) => {
  const now = new Date()

  const result = await prisma.cache.deleteMany({
    where: { expiresAt: { lt: now } }
  })

  return c.json({ success: true, data: { deleted: result.count } })
})

// GET /admin/system/logs?page=1&limit=50&sport=
app.get('/system/logs', async (c) => {
  const page = parseInt(c.req.query('page') || '1')
  const limit = parseInt(c.req.query('limit') || '50')
  const sport = c.req.query('sport')
  const skip = (page - 1) * limit

  const where = sport ? { sport } : {}

  const [logs, total] = await Promise.all([
    prisma.requestLog.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' }
    }),
    prisma.requestLog.count({ where })
  ])

  return c.json({
    success: true,
    data: logs,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
  })
})

export const adminRoutes = app
