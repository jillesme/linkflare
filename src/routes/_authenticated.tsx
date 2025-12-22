import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { getCurrentSession } from '@/lib/server-fns/authentication'
import { type Session } from '@/lib/auth'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async () => {
    const session = await getCurrentSession()
    if (!session) {
      throw redirect({ to: '/authentication/login' })
    }
    return { session }
  },
  component: AuthenticatedLayout,
})

function AuthenticatedLayout() {
  return <Outlet />
}

// Export the session type for child routes to use
export type AuthenticatedRouteContext = {
  session: Session
}
