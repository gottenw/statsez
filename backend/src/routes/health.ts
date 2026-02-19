import { Hono } from 'hono'
import { prisma } from '../lib/prisma.js'

const app = new Hono()


app.get('/', (c) => {
  return c.json({
    success: true,
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  })
})


app.get('/full', async (c) => {
  const checks: Record<string, 'ok' | 'error'> = {}
  
  try {
    
    await prisma.$queryRaw`SELECT 1`
    checks.database = 'ok'
  } catch (err) {
    checks.database = 'error'
    console.error('Erro na conexão com o banco:', err)
  }

  const allOk = Object.values(checks).every(status => status === 'ok')

  return c.json({
    success: allOk,
    status: allOk ? 'healthy' : 'unhealthy',
    checks,
    timestamp: new Date().toISOString()
  }, allOk ? 200 : 503)
})

export const healthRoutes = app
