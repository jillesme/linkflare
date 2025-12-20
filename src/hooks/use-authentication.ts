import { useRouter, useNavigate } from '@tanstack/react-router'
import { authClient } from '@/lib/auth-client'
import { Route } from '@/routes/__root'

export function useAuthentication() {
  const { session } = Route.useRouteContext()
  const router = useRouter()
  const navigate = useNavigate()

  const signOut = async () => {
    await authClient.signOut()
    await navigate({ to: '/' })
    router.invalidate()
  }

  return { session, signOut }
}
