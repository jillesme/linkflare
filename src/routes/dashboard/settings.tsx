import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useState } from 'react'

import { authClient } from '@/lib/auth-client'
import { useAuthentication } from '@/hooks/use-authentication'
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

export const Route = createFileRoute('/dashboard/settings')({
  component: SettingsPage,
})

function SettingsPage() {
  const router = useRouter()
  const { session } = useAuthentication()
  const currentUsername = session?.user?.username

  const [username, setUsername] = useState(currentUsername ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (!username.trim()) {
      setError('Username is required')
      return
    }

    if (username.length < 3) {
      setError('Username must be at least 3 characters')
      return
    }

    if (username.length > 30) {
      setError('Username must be at most 30 characters')
      return
    }

    if (!/^[a-zA-Z0-9_.]+$/.test(username)) {
      setError('Only letters, numbers, underscores, and dots allowed')
      return
    }

    setLoading(true)

    const { error: updateError } = await authClient.updateUser({
      username: username.toLowerCase(),
      displayUsername: username,
    })

    if (updateError) {
      setError(updateError.message ?? 'Failed to update username')
      setLoading(false)
    } else {
      setSuccess(true)
      setLoading(false)
      router.invalidate()
    }
  }

  return (
    <div className="max-w-md">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Update your profile settings
        </p>
      </div>

      <div className="bg-card rounded-lg border border-border shadow-sm p-6">
        <form onSubmit={handleSubmit}>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="username">Username</FieldLabel>
              <Input
                id="username"
                type="text"
                placeholder="johndoe"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value)
                  setSuccess(false)
                }}
                disabled={!!currentUsername}
                minLength={3}
                maxLength={30}
              />
              <FieldDescription>
                {currentUsername
                  ? 'Username cannot be changed once set.'
                  : 'Choose a username for your public profile. Only letters, numbers, underscores, and dots allowed.'}
              </FieldDescription>
            </Field>

            {error && <FieldError>{error}</FieldError>}

            {success && (
              <p className="text-sm text-green-600">
                Username updated successfully!
              </p>
            )}

            {!currentUsername && (
              <Button type="submit" disabled={loading}>
                {loading && <Spinner />}
                {loading ? 'Saving...' : 'Save Username'}
              </Button>
            )}
          </FieldGroup>
        </form>

        {currentUsername && (
          <p className="mt-4 text-sm text-muted-foreground">
            Your public profile is available at{' '}
            <a
              href={`/${currentUsername}`}
              className="text-primary font-medium hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              /{currentUsername}
            </a>
          </p>
        )}
      </div>
    </div>
  )
}
