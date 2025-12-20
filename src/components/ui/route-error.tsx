import { useRouter } from '@tanstack/react-router'
import { AlertCircle } from 'lucide-react'

import { Button } from './button'

interface RouteErrorProps {
  error: Error
  title?: string
  showRetry?: boolean
}

export function RouteError({ error, title = 'Something went wrong', showRetry = true }: RouteErrorProps) {
  const router = useRouter()

  return (
    <div className="min-h-[50vh] flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <AlertCircle className="size-12 text-destructive mx-auto mb-4" />
        <h1 className="text-xl font-bold text-foreground mb-2">{title}</h1>
        <p className="text-muted-foreground mb-6">
          {error.message || 'An unexpected error occurred. Please try again.'}
        </p>
        {showRetry && (
          <Button onClick={() => router.invalidate()}>
            Try again
          </Button>
        )}
        {import.meta.env.DEV && (
          <details className="mt-6 text-left">
            <summary className="text-sm text-muted-foreground cursor-pointer hover:text-foreground">
              Error details (dev only)
            </summary>
            <pre className="mt-2 p-3 bg-muted rounded text-xs overflow-auto max-h-48">
              {error.stack || error.message}
            </pre>
          </details>
        )}
      </div>
    </div>
  )
}
