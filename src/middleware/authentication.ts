import { createMiddleware } from '@tanstack/react-start'
import { getRequest } from '@tanstack/react-start/server'
import { env } from 'cloudflare:workers'

import { auth } from '@/lib/auth'

export const ensureSessionMiddleware = createMiddleware({ type: 'function' })
  .server(async ({ next }) => {
    const request = getRequest()
    const session = await auth.api.getSession({ headers: request.headers })

    if (!session?.user) {
      throw new Error('Unauthorized')
    }

    return next({ context: { session } })
  })

// Rate limit for authenticated users - uses userId from session context
// Must be chained AFTER ensureSessionMiddleware
export const rateLimitByUserMiddleware = createMiddleware({ type: 'function' })
  .server(async ({ next, context }) => {
    const ctx = context as unknown as { session?: { user: { id: string } } }
    
    if (!ctx.session?.user?.id) {
      throw new Error('Unauthorized')
    }
    
    const { success } = await env.RATE_LIMITER.limit({ key: `user:${ctx.session.user.id}` })
    
    if (!success) {
      throw new Error('Too many requests')
    }

    return next()
  })

// Rate limit for public endpoints - uses IP + optional key suffix
// Use this for unauthenticated endpoints
export function createPublicRateLimitMiddleware(keySuffix?: string) {
  return createMiddleware({ type: 'function' })
    .server(async ({ next, data }) => {
      const request = getRequest()
      const ip = request.headers.get('cf-connecting-ip') ?? request.headers.get('x-forwarded-for') ?? 'unknown'
      
      // Combine IP with key suffix (e.g., linkId) to prevent abuse on specific resources
      const key = keySuffix ? `${ip}:${keySuffix}` : ip
      // If data has a string value (like linkId), use it as part of the key
      const finalKey = typeof data === 'string' ? `${ip}:${data}` : key
      
      const { success } = await env.RATE_LIMITER.limit({ key: finalKey })
      
      if (!success) {
        throw new Error('Too many requests')
      }

      return next()
    })
}
