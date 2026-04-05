import type { MiddlewareHandler } from 'hono'
import { getConnInfo } from '@hono/node-server/conninfo'

interface BucketEntry {
  count: number
  resetTime: number
}

const store: Record<string, BucketEntry> = {}

// Store separado para auth failures — muito mais agressivo
const authFailStore: Record<string, BucketEntry> = {}

// Limpa entradas expiradas a cada 5 minutos
setInterval(() => {
  const now = Date.now()
  for (const ip in store) {
    if (store[ip].resetTime <= now) delete store[ip]
  }
  for (const ip in authFailStore) {
    if (authFailStore[ip].resetTime <= now) delete authFailStore[ip]
  }
}, 5 * 60 * 1000)

function getIp(c: any): string {
  try {
    const info = getConnInfo(c)
    return info.remote?.address || 'unknown'
  } catch {
    return 'unknown'
  }
}

interface RateLimitOptions {
  windowMs?: number
  maxRequests?: number
}

/**
 * Rate limit geral — por IP, para todas as requests.
 */
export const rateLimit = (options: RateLimitOptions = {}): MiddlewareHandler => {
  const windowMs = options.windowMs || 60 * 1000
  const maxRequests = options.maxRequests || 100

  return async (c, next) => {
    const ip = getIp(c)
    const now = Date.now()

    // Verifica se o IP está bloqueado por auth failures primeiro
    const authBucket = authFailStore[ip]
    if (authBucket && authBucket.resetTime > now && authBucket.count >= 10) {
      return c.json({
        success: false,
        error: 'Too many failed attempts. Try again later.',
        retryAfter: Math.ceil((authBucket.resetTime - now) / 1000)
      }, 429)
    }

    if (!store[ip] || store[ip].resetTime <= now) {
      store[ip] = { count: 0, resetTime: now + windowMs }
    }

    store[ip].count++

    if (store[ip].count > maxRequests) {
      return c.json({
        success: false,
        error: 'Too many requests. Try again later.',
        retryAfter: Math.ceil((store[ip].resetTime - now) / 1000)
      }, 429)
    }

    // Só mostra rate limit headers para requests autenticadas (após next)
    await next()

    // Se a response foi 401/403, incrementa o auth fail counter
    if (c.res.status === 401 || c.res.status === 403) {
      if (!authFailStore[ip] || authFailStore[ip].resetTime <= now) {
        // Window de 5 minutos para auth failures
        authFailStore[ip] = { count: 0, resetTime: now + 5 * 60 * 1000 }
      }
      authFailStore[ip].count++
    }

    // Só adiciona headers de rate limit em responses bem-sucedidas
    if (c.res.status >= 200 && c.res.status < 300) {
      c.header('X-RateLimit-Limit', String(maxRequests))
      c.header('X-RateLimit-Remaining', String(Math.max(0, maxRequests - store[ip].count)))
      c.header('X-RateLimit-Reset', String(Math.ceil(store[ip].resetTime / 1000)))
    }
  }
}
