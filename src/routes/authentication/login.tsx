import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { authClient } from '@/lib/auth-client'
import { useTurnstile } from '@/context/turnstile-context'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { Input } from '@/components/ui/input'
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
  FieldError,
} from '@/components/ui/field'

export const Route = createFileRoute('/authentication/login')({
  component: LoginPage,
})

function LoginPage() {
  const { token } = useTurnstile()
  const navigate = useNavigate()

  const [usernameOrEmail, setUsernameOrEmail] = useState('')
  const [password, setPassword] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isEmail = (value: string) => value.includes('@')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!token) {
      setError('Please complete the captcha verification')
      return
    }

    setLoading(true)

    const fetchOptions = {
      headers: { 'x-captcha-response': token },
    }

    const { error: signInError } = isEmail(usernameOrEmail)
      ? await authClient.signIn.email({
          email: usernameOrEmail,
          password,
          fetchOptions,
        })
      : await authClient.signIn.username({
          username: usernameOrEmail,
          password,
          fetchOptions,
        })

    if (signInError) {
      setError(signInError.message ?? 'An error occurred during login')
      setLoading(false)
    } else {
      navigate({ to: '/' })
    }
  }

  return (
    <div className="bg-card rounded-lg border border-border shadow-sm p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Log In</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Welcome back! Enter your credentials to continue.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="usernameOrEmail">Username or Email</FieldLabel>
            <Input
              id="usernameOrEmail"
              type="text"
              placeholder="johndoe or john@example.com"
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
              required
            />
            <FieldDescription>
              Enter your username or email address.
            </FieldDescription>
          </Field>

          <Field>
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Field>

          {error && <FieldError>{error}</FieldError>}

          <Button type="submit" disabled={loading || !token} className="w-full">
            {loading && <Spinner />}
            {loading ? 'Logging in...' : 'Log In'}
          </Button>
        </FieldGroup>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don't have an account?{' '}
        <Link
          to="/authentication/sign-up"
          className="text-primary font-medium hover:underline"
        >
          Sign up here
        </Link>
      </p>
    </div>
  )
}
