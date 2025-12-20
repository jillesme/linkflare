import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { useTurnstile } from '@/context/turnstile-context'
import { signUp } from '@/lib/server-fns/authentication'
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

export const Route = createFileRoute('/authentication/sign-up')({
  component: SignUpPage,
})

function SignUpPage() {
  const { token } = useTurnstile()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!token) {
      setError('Please complete the captcha verification')
      return
    }

    setLoading(true)

    try {
      await signUp({
        data: {
          name,
          email,
          username,
          password,
          captchaToken: token,
        },
      })
      navigate({ to: '/dashboard' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during sign up')
      setLoading(false)
    }
  }

  return (
    <div className="bg-card rounded-lg border border-border shadow-sm p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Sign Up</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Create your account to get started
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="name">Name</FieldLabel>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="username">Username</FieldLabel>
            <Input
              id="username"
              type="text"
              placeholder="johndoe"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              minLength={3}
              maxLength={30}
            />
            <FieldDescription>
              Only letters, numbers, underscores, and dots.
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
              minLength={8}
            />
            <FieldDescription>Must be at least 8 characters.</FieldDescription>
          </Field>

          {error && <FieldError>{error}</FieldError>}

          <Button type="submit" disabled={loading || !token} className="w-full">
            {loading && <Spinner />}
            {loading ? 'Creating account...' : 'Sign Up'}
          </Button>
        </FieldGroup>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link
          to="/authentication/login"
          className="text-primary font-medium hover:underline"
        >
          Log in here
        </Link>
      </p>
    </div>
  )
}
