import { Link } from '@tanstack/react-router'
import { useAuthentication } from '@/hooks/use-authentication'
import { Button } from '@/components/ui/button'

export default function Header() {
  const { session, signOut } = useAuthentication()

  return (
    <header className="px-4 py-4 flex items-center justify-between bg-background border-b border-border">
      <Link to="/" className="text-xl font-bold text-foreground hover:text-primary transition-colors">
        LinkFlare
      </Link>

      <div className="flex items-center gap-3">
        {session ? (
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
