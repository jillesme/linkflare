import { createStart } from '@tanstack/react-start'

import { securityHeadersMiddleware } from '@/middleware/security-headers'

export const startInstance = createStart(() => ({
  requestMiddleware: [securityHeadersMiddleware],
}))
