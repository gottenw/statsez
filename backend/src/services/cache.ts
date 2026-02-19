import { prisma } from '../lib/prisma.js'

interface CacheOptions {
  sport: string
  endpoint: string
  params?: Record<string, any>
  ttlSeconds: number
}


function generateCacheKey(sport: string, endpoint: string, params?: Record<string, any>): string {
  const paramsHash = params ? JSON.stringify(params) : ''
  return `${sport}:${endpoint}:${Buffer.from(paramsHash).toString('base64')}`
}


export async function getCache<T>(
  sport: string,
  endpoint: string,
  params?: Record<string, any>
): Promise<T | null> {
  const key = generateCacheKey(sport, endpoint, params)
  
  const cached = await prisma.cache.findUnique({
    where: { key }
  })

  
  if (!cached) return null
  if (cached.expiresAt < new Date()) {
    
    await prisma.cache.delete({ where: { key } })
    return null
  }

  try {
    return JSON.parse(cached.value) as T
  } catch {
    return null
  }
}


export async function setCache<T>(
  options: CacheOptions,
  data: T
): Promise<void> {
  const { sport, endpoint, params, ttlSeconds = 3600 } = options;
  const key = generateCacheKey(sport, endpoint, params);
  const paramsHash = params ? JSON.stringify(params) : null;
  const value = JSON.stringify(data);
  
  const expiresAt = new Date(Date.now() + ttlSeconds * 1000);

  try {
    await prisma.cache.upsert({
      where: { key },
      update: {
        value,
        expiresAt,
      },
      create: {
        key,
        sport,
        endpoint,
        params: paramsHash,
        value,
        expiresAt,
      },
    });
  } catch (error) {
    console.error(`Erro ao salvar cache para ${key}:`, error);
  }
}


export async function clearSportCache(sport: string): Promise<number> {
  const result = await prisma.cache.deleteMany({
    where: { sport }
  })
  return result.count
}


export async function clearExpiredCache(): Promise<number> {
  const result = await prisma.cache.deleteMany({
    where: {
      expiresAt: {
        lt: new Date()
      }
    }
  })
  return result.count
}
