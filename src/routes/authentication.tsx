import { createFileRoute, Outlet } from '@tanstack/react-router'
import { Turnstile } from '@marsidev/react-turnstile'
import { TurnstileProvider, useTurnstile } from '@/context/turnstile-context'

export const Route = createFileRoute('/authentication')({
  component: AuthenticationLayout,
})

function AuthenticationLayout() {
  return (
    <TurnstileProvider>
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Outlet />
          <TurnstileWidget />
        </div>
      </div>
    </TurnstileProvider>
  )
}

function TurnstileWidget() {
  const { token, setToken } = useTurnstile()

  return (
    <div className="mt-6 flex justify-center h-[65px]">
      {!token && (
        <Turnstile
          siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
          onSuccess={setToken}
        />
      )}
    </div>
  )
}
