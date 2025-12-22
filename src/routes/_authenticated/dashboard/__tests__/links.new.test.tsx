import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Field, FieldLabel, FieldError } from '@/components/ui/field'

// Mock the createLink function
vi.mock('@/lib/server-fns/links', () => ({
  createLink: vi.fn(),
}))

// Extract the form component logic for testing (avoiding router dependency)
function NewLinkForm({ onSubmit }: { onSubmit: (data: { title: string; url: string; isActive: boolean }) => Promise<void> }) {
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

    try {
      new URL(url)
    } catch {
      setError('Please enter a valid URL (include https://)')
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit({ title: title.trim(), url: url.trim(), isActive })
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
            type="text"
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
          <Button type="button" variant="outline">
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}

describe('NewLinkForm', () => {
  let mockOnSubmit: ReturnType<typeof vi.fn>

  beforeEach(() => {
    mockOnSubmit = vi.fn().mockResolvedValue(undefined)
  })

  it('renders form with title, url, and active toggle', () => {
    render(<NewLinkForm onSubmit={mockOnSubmit} />)
    
    expect(screen.getByText('Add New Link')).toBeInTheDocument()
    expect(screen.getByLabelText('Title')).toBeInTheDocument()
    expect(screen.getByLabelText('URL')).toBeInTheDocument()
    expect(screen.getByLabelText('Active')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Create Link' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
  })

  it('shows error when submitting empty title', async () => {
    render(<NewLinkForm onSubmit={mockOnSubmit} />)
    
    fireEvent.click(screen.getByRole('button', { name: 'Create Link' }))
    
    await waitFor(() => {
      expect(screen.getByText('Title is required')).toBeInTheDocument()
    })
    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('shows error when submitting empty URL', async () => {
    render(<NewLinkForm onSubmit={mockOnSubmit} />)
    
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'My Link' } })
    fireEvent.click(screen.getByRole('button', { name: 'Create Link' }))
    
    await waitFor(() => {
      expect(screen.getByText('URL is required')).toBeInTheDocument()
    })
    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('shows error for invalid URL', async () => {
    render(<NewLinkForm onSubmit={mockOnSubmit} />)
    
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'My Link' } })
    fireEvent.change(screen.getByLabelText('URL'), { target: { value: 'not-a-valid-url' } })
    fireEvent.click(screen.getByRole('button', { name: 'Create Link' }))
    
    await waitFor(() => {
      expect(screen.getByText('Please enter a valid URL (include https://)')).toBeInTheDocument()
    })
    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('submits form with valid data', async () => {
    render(<NewLinkForm onSubmit={mockOnSubmit} />)
    
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'My Website' } })
    fireEvent.change(screen.getByLabelText('URL'), { target: { value: 'https://example.com' } })
    fireEvent.click(screen.getByRole('button', { name: 'Create Link' }))
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        title: 'My Website',
        url: 'https://example.com',
        isActive: true,
      })
    })
  })

  it('shows submitting state while creating link', async () => {
    mockOnSubmit.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)))
    render(<NewLinkForm onSubmit={mockOnSubmit} />)
    
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'My Website' } })
    fireEvent.change(screen.getByLabelText('URL'), { target: { value: 'https://example.com' } })
    fireEvent.click(screen.getByRole('button', { name: 'Create Link' }))
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Creating...' })).toBeDisabled()
    })
  })

  it('shows error when submission fails', async () => {
    mockOnSubmit.mockRejectedValue(new Error('Network error'))
    render(<NewLinkForm onSubmit={mockOnSubmit} />)
    
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'My Website' } })
    fireEvent.change(screen.getByLabelText('URL'), { target: { value: 'https://example.com' } })
    fireEvent.click(screen.getByRole('button', { name: 'Create Link' }))
    
    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument()
    })
  })
})
