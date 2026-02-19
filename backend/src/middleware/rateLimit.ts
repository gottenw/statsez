import type { MiddlewareHandler } from 'hono'



interface RateLimitStore {
  [ip: string]: {
    count: number
    resetTime: number
  }
}

const store: RateLimitStore = {}


setInterval(() => {
  const now = Date.now()
  for (const ip in store) {
    if (store[ip].resetTime <= now) {
      delete store[ip]
    }
  }
}, 10 * 60 * 1000)

interface RateLimitOptions {
  windowMs?: number      
  maxRequests?: number   
}


export const rateLimit = (options: RateLimitOptions = {}): MiddlewareHandler => {
  const windowMs = options.windowMs || 60 * 1000 
  const maxRequests = options.maxRequests || 100

  return async (c, next) => {
    const ip = c.req.header('x-forwarded-for') || 
               c.req.header('x-real-ip') || 
               'unknown'
    const now = Date.now()

    
    if (!store[ip] || store[ip].resetTime <= now) {
      store[ip] = {
        count: 0,
        resetTime: now + windowMs
      }
    }

    
    store[ip].count++

    
    if (store[ip].count > maxRequests) {
      return c.json({
        success: false,
        error: 'Muitas requisições. Tente novamente em breve.',
        retryAfter: Math.ceil((store[ip].resetTime - now) / 1000)
      }, 429)
    }

    
    c.header('X-RateLimit-Limit', String(maxRequests))
    c.header('X-RateLimit-Remaining', String(Math.max(0, maxRequests - store[ip].count)))
    c.header('X-RateLimit-Reset', String(Math.ceil(store[ip].resetTime / 1000)))

    await next()
  }
}
