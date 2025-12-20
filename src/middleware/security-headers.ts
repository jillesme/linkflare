import { createMiddleware } from '@tanstack/react-start'
import { getResponseHeaders, setResponseHeaders } from '@tanstack/react-start/server'

export const securityHeadersMiddleware = createMiddleware().server(({ next }) => {
  const headers = getResponseHeaders()

  // Prevent MIME type sniffing
  headers.set('X-Content-Type-Options', 'nosniff')

  // Prevent clickjacking
  headers.set('X-Frame-Options', 'DENY')

  // XSS Protection (legacy browsers)
  headers.set('X-XSS-Protection', '0')

  // Referrer Policy
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  // Permissions Policy - disable unnecessary features
  headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=(), payment=()')

  setResponseHeaders(headers)

  return next()
})
