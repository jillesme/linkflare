import { Link, useRouter, useNavigate } from '@tanstack/react-router'
import { authClient } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'

export default function Header() {
  // We use the client-side useSession hook here instead of server-side route context
  // because the homepage is prerendered at build time and doesn't have access to
  // server-side session data. This allows the header to hydrate and show the correct
  // auth state after the initial render.
  const { data: session, isPending } = authClient.useSession()
  const router = useRouter()
  const navigate = useNavigate()

  const signOut = async () => {
    await authClient.signOut()
    await navigate({ to: '/' })
    router.invalidate()
  }

  return (
    <header className="px-4 py-4 flex items-center justify-between bg-background border-b border-border">
      <Link to="/" className="text-xl font-bold text-foreground hover:text-primary transition-colors">
        LinkFlare
      </Link>

      <div className="flex items-center gap-3 min-h-[40px]">
        {isPending ? (
          <Spinner className="size-5" />
        ) : session ? (
          <>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/dashboard">Dashboard</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/dashboard/settings">Settings</Link>
            </Button>
            <Button variant="outline" size="sm" onClick={signOut}>
              Log out
            </Button>
          </>
        ) : (
          <>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/authentication/login">Log in</Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/authentication/sign-up">Sign up</Link>
            </Button>
          </>
        )}
      </div>
    </header>
  )
}
