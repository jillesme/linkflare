import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/authentication/')({
  beforeLoad: () => {
    throw redirect({ to: '/authentication/sign-up' })
  },
})
