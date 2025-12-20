import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { ChevronUp, ChevronDown, Pencil, Trash2, Plus, ExternalLink, Eye } from 'lucide-react'

import { getUserLinks, deleteLink, reorderLink, updateLink } from '@/lib/server-fns/links'
import { Button } from '@/components/ui/button'
import { RouteError } from '@/components/ui/route-error'
import { useAuthentication } from '@/hooks/use-authentication'

export const Route = createFileRoute('/dashboard/')({
  loader: () => getUserLinks(),
  component: DashboardIndex,
  errorComponent: ({ error }) => (
    <RouteError error={error} title="Failed to load links" />
  ),
})

function DashboardIndex() {
  const links = Route.useLoaderData()
  const { session } = useAuthentication()
  const username = session?.user?.username

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Your Links</h1>
          {username && (
            <Link
              to="/$username"
              params={{ username }}
              className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1 mt-1"
            >
              <Eye className="size-3" />
              View your profile
            </Link>
          )}
        </div>
        <Button asChild>
          <Link to="/dashboard/links/new">
            <Plus className="size-4" />
            Add Link
          </Link>
        </Button>
      </div>

      {links.length === 0 ? (
        <div className="text-center py-12 bg-card rounded-lg border border-border">
          <p className="text-muted-foreground mb-4">You haven't added any links yet.</p>
          <Button asChild>
            <Link to="/dashboard/links/new">
              <Plus className="size-4" />
              Add your first link
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {links.map((link, index) => (
            <LinkRow
              key={link.id}
              link={link}
              isFirst={index === 0}
              isLast={index === links.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function LinkRow({
  link,
  isFirst,
  isLast,
}: {
  link: {
    id: string
    title: string
    url: string
    isActive: boolean
    totalClicks: number
  }
  isFirst: boolean
  isLast: boolean
}) {
  const router = useRouter()

  const handleToggleActive = async () => {
    await updateLink({ data: { linkId: link.id, isActive: !link.isActive } })
    router.invalidate()
  }

  const handleMoveUp = async () => {
    await reorderLink({ data: { linkId: link.id, direction: 'up' } })
    router.invalidate()
  }

  const handleMoveDown = async () => {
    await reorderLink({ data: { linkId: link.id, direction: 'down' } })
    router.invalidate()
  }

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this link?')) {
      await deleteLink({ data: link.id })
      router.invalidate()
    }
  }

  return (
    <div
      className={`p-4 bg-card rounded-lg border border-border ${
        !link.isActive ? 'opacity-60' : ''
      }`}
    >
      {/* Mobile: stacked layout, Desktop: single row */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
        {/* Top row (mobile) / Left section (desktop): Favicon + Content */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <img
            src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(link.url)}&sz=32`}
            alt=""
            className="size-10 rounded shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-medium truncate">{link.title}</h3>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary shrink-0"
              >
                <ExternalLink className="size-4" />
              </a>
            </div>
            <p className="text-sm text-muted-foreground truncate">{link.url}</p>
            <p className="text-xs text-muted-foreground mt-1 md:hidden">
              {link.totalClicks} {link.totalClicks === 1 ? 'click' : 'clicks'}
            </p>
          </div>
        </div>

        {/* Bottom row (mobile) / Right section (desktop): Controls */}
        <div className="flex items-center justify-between gap-3 md:gap-4 border-t border-border pt-3 md:border-0 md:pt-0">
          {/* Stats - desktop only */}
          <div className="hidden md:block text-sm text-muted-foreground whitespace-nowrap">
            {link.totalClicks} {link.totalClicks === 1 ? 'click' : 'clicks'}
          </div>

          {/* Toggle with label */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground" id={`toggle-label-${link.id}`}>Enabled:</span>
            <button
              role="switch"
              aria-checked={link.isActive}
              aria-labelledby={`toggle-label-${link.id}`}
              onClick={handleToggleActive}
              className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                link.isActive ? 'bg-primary' : 'bg-border'
              }`}
            >
              <span
                className={`inline-block size-4 transform rounded-full bg-white transition-transform ${
                  link.isActive ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Actions + Reorder */}
          <div className="flex items-center">
            <div className="flex flex-col">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleMoveUp}
                disabled={isFirst}
                className="h-5"
                aria-label="Move link up"
              >
                <ChevronUp className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={handleMoveDown}
                disabled={isLast}
                className="h-5"
                aria-label="Move link down"
              >
                <ChevronDown className="size-4" />
              </Button>
            </div>
            <Button variant="ghost" size="icon-sm" asChild>
              <Link to="/dashboard/links/$linkId/edit" params={{ linkId: link.id }} aria-label="Edit link">
                <Pencil className="size-4" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={handleDelete} aria-label="Delete link">
              <Trash2 className="size-4 text-destructive" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
