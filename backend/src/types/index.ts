
export type Sport = 'football' | 'basketball' | 'tennis' | 'hockey'


export type PlanName = 'Basic' | 'Pro' | 'Custom'


export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'


export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  meta?: {
    cached?: boolean
    remainingQuota?: number
    totalQuota?: number
    resetDate?: string
  }
}


export interface AuthContext {
  userId: string
  subscriptionId: string
  sport: Sport
  apiKey: string
  remainingQuota: number
}


export interface EndpointConfig {
  path: string
  ttlSeconds: number
  requiresAuth: boolean
}


export const SPORT_ENDPOINTS: Record<Sport, EndpointConfig[]> = {
  football: [
    { path: '/fixtures', ttlSeconds: 3600, requiresAuth: true },
    { path: '/standings', ttlSeconds: 86400, requiresAuth: true },
    { path: '/teams', ttlSeconds: 86400, requiresAuth: true },
    { path: '/players', ttlSeconds: 7200, requiresAuth: true },
    { path: '/statistics', ttlSeconds: 7200, requiresAuth: true },
    { path: '/lineups', ttlSeconds: 1800, requiresAuth: true },
    { path: '/leagues', ttlSeconds: 86400, requiresAuth: true },
  ],
  basketball: [
    { path: '/fixtures', ttlSeconds: 3600, requiresAuth: true },
    { path: '/standings', ttlSeconds: 86400, requiresAuth: true },
    { path: '/teams', ttlSeconds: 86400, requiresAuth: true },
    { path: '/players', ttlSeconds: 7200, requiresAuth: true },
    { path: '/statistics', ttlSeconds: 7200, requiresAuth: true },
  ],
  tennis: [
    { path: '/fixtures', ttlSeconds: 3600, requiresAuth: true },
    { path: '/rankings', ttlSeconds: 86400, requiresAuth: true },
    { path: '/players', ttlSeconds: 86400, requiresAuth: true },
    { path: '/tournaments', ttlSeconds: 86400, requiresAuth: true },
  ],
  hockey: [
    { path: '/fixtures', ttlSeconds: 3600, requiresAuth: true },
    { path: '/standings', ttlSeconds: 86400, requiresAuth: true },
    { path: '/teams', ttlSeconds: 86400, requiresAuth: true },
  ],
}
