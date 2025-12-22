import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

import { getLinkById, updateLink } from '@/lib/server-fns/links'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldLabel, FieldError } from '@/components/ui/field'
import { RouteError } from '@/components/ui/route-error'

export const Route = createFileRoute('/_authenticated/dashboard/links/$linkId/edit')({
  loader: ({ params }) => getLinkById({ data: params.linkId }),
  component: EditLinkPage,
  errorComponent: ({ error }) => (
    <RouteError error={error} title="Failed to load link" />
  ),
})

function EditLinkPage() {
  const link = Route.useLoaderData()
  const navigate = useNavigate()
  const [title, setTitle] = useState(link.title)
  const [url, setUrl] = useState(link.url)
  const [isActive, setIsActive] = useState(link.isActive)
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
      await updateLink({
        data: {
          linkId: link.id,
          title: title.trim(),
          url: url.trim(),
          isActive,
        },
      })
      navigate({ to: '/dashboard' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update link')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit Link</h1>

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
          <FieldLabel htmlFor="isActive" id="isActive-label">Active</FieldLabel>
          <button
            type="button"
            id="isActive"
            role="switch"
            aria-checked={isActive}
            aria-labelledby="isActive-label"
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
            {isSubmitting ? 'Saving...' : 'Save Changes'}
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
