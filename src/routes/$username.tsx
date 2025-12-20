import { createFileRoute, Link } from '@tanstack/react-router'

import { getPublicProfile } from '@/lib/server-fns/links'
import { RouteError } from '@/components/ui/route-error'

export const Route = createFileRoute('/$username')({
  loader: ({ params }) => getPublicProfile({ data: params.username }),
  component: PublicProfilePage,
  errorComponent: ({ error }) => (
    <RouteError error={error} title="Failed to load profile" />
  ),
})

function PublicProfilePage() {
  const profile = Route.useLoaderData()

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">User not found</h1>
          <p className="text-muted-foreground mb-4">This profile doesn't exist.</p>
          <Link to="/" className="text-primary hover:underline">
            Go home
          </Link>
        </div>
      </div>
    )
  }

  const { user, links } = profile

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-md mx-auto">
        {/* Profile Header */}
        <div className="text-center mb-8">
          {user.image && (
            <img
              src={user.image}
              alt={user.name || user.displayUsername || user.username || ''}
              className="size-24 rounded-full mx-auto mb-4 border-4 border-card shadow-lg"
            />
          )}
          <h1 className="text-2xl font-bold text-foreground">
            {user.name || user.displayUsername || user.username || 'Anonymous'}
          </h1>
          {user.name && user.displayUsername && (
            <p className="text-muted-foreground">@{user.displayUsername}</p>
          )}
        </div>

        {/* Links */}
        {links.length === 0 ? (
          <p className="text-center text-muted-foreground">No links yet.</p>
        ) : (
          <div className="space-y-3">
            {links.map((link) => (
              <LinkCard key={link.id} link={link} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function LinkCard({
  link,
}: {
  link: {
    id: string
    title: string
    url: string
  }
}) {
  // Extract domain for display
  let domain = ''
  try {
    domain = new URL(link.url).hostname.replace('www.', '')
  } catch {
    domain = link.url
  }

  return (
    <a
      // NOTE: This is an a tag on purpose not to trigger TanStack's preloading 
      href={`/go/${link.id}`}
      className="block bg-card rounded-xl p-4 shadow-sm border border-border hover:shadow-md hover:scale-[1.02] hover:border-primary/50 transition-all"
    >
      <div className="flex items-center gap-3">
        <img
          src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(link.url)}&sz=32`}
          alt=""
          className="size-8 rounded"
        />
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-foreground truncate">{link.title}</h3>
          <p className="text-sm text-muted-foreground truncate">{domain}</p>
        </div>
      </div>
    </a>
  )
}
