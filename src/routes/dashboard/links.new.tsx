import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

import { createLink } from '@/lib/server-fns/links'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldLabel, FieldError } from '@/components/ui/field'

export const Route = createFileRoute('/dashboard/links/new')({
  component: NewLinkPage,
})

function NewLinkPage() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!title.trim()) {
      setError('Title is required')
      return
    }

    if (!url.trim()) {
      setError('URL is required')
      return
    }

    // Basic URL validation
    try {
      new URL(url)
    } catch {
      setError('Please enter a valid URL (include https://)')
      return
    }

    setIsSubmitting(true)
    try {
      await createLink({ data: { title: title.trim(), url: url.trim(), isActive } })
      navigate({ to: '/dashboard' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create link')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Add New Link</h1>

      <form onSubmit={handleSubmit} className="max-w-md space-y-4">
        {error && <FieldError>{error}</FieldError>}

        <Field>
          <FieldLabel htmlFor="title">Title</FieldLabel>
          <Input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="My Website"
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="url">URL</FieldLabel>
          <Input
            id="url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
          />
        </Field>

        <Field orientation="horizontal">
          <FieldLabel htmlFor="isActive">Active</FieldLabel>
          <button
            type="button"
            id="isActive"
            onClick={() => setIsActive(!isActive)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              isActive ? 'bg-primary' : 'bg-border'
            }`}
          >
            <span
              className={`inline-block size-4 transform rounded-full bg-white transition-transform ${
                isActive ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </Field>

        <div className="flex gap-3 pt-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Link'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate({ to: '/dashboard' })}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}
