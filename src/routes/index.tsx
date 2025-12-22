import { createFileRoute, Link } from '@tanstack/react-router'
import { ExternalLink } from 'lucide-react'

import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      { title: 'LinkFlare | Open Source LinkInBio Platform Built on Cloudflare Workers' },
      {
        name: 'description',
        content:
          'Create your personal link-in-bio page with LinkFlare. Open source, self-hostable, and built on Cloudflare Workers. Clone, customize, and deploy in minutes.',
      },
      // Open Graph
      {
        property: 'og:title',
        content: 'LinkFlare | Open Source LinkInBio Platform Built on Cloudflare Workers',
      },
      {
        property: 'og:description',
        content:
          'Create your personal link-in-bio page with LinkFlare. Open source, self-hostable, and built on Cloudflare Workers.',
      },
      { property: 'og:url', content: 'https://linkflare.app/' },
      { property: 'og:image', content: 'https://linkflare.app/og-image.png' },
      { property: 'og:type', content: 'website' },
      // Twitter Card
      { name: 'twitter:card', content: 'summary_large_image' },
      {
        name: 'twitter:title',
        content: 'LinkFlare | Open Source LinkInBio Platform Built on Cloudflare Workers',
      },
      {
        name: 'twitter:description',
        content:
          'Create your personal link-in-bio page with LinkFlare. Open source, self-hostable, and built on Cloudflare Workers.',
      },
      { name: 'twitter:image', content: 'https://linkflare.app/og-image.png' },
    ],
    links: [{ rel: 'canonical', href: 'https://linkflare.app/' }],
  }),
  component: HomePage,
})

function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="px-4 py-20 md:py-32">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight mb-6">
            Open Source LinkInBio Platform Built on Cloudflare Workers
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Your personal link page, your way. Clone and self-host, or sign up for our hosted
            version. Built on the edge for lightning-fast performance.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
            <Button size="lg" asChild>
              <Link to="/authentication/sign-up">Sign Up</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/$username" params={{ username: 'jilles' }}>
                View Example
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a
                href="https://github.com/jillesme/linkflare"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
                <ExternalLink className="size-4" />
              </a>
            </Button>
          </div>

          {/* Demo Placeholder */}
          <div className="relative max-w-2xl mx-auto">
            <div className="aspect-video rounded-xl border-2 border-dashed border-border bg-muted/30 flex items-center justify-center">
              <p className="text-muted-foreground">Demo coming soon</p>
            </div>
          </div>
        </div>
      </section>

      {/* Built With Section */}
      <section className="px-4 py-16 border-t border-border">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-sm text-muted-foreground mb-8">Built with</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 justify-items-center">
            <TechLogo
              name="Cloudflare Workers"
              description="Edge computing for global low-latency"
              src="/cloudflare-logo.jpeg"
              href="https://workers.cloudflare.com"
            />
            <TechLogo
              name="TanStack Start"
              description="Full-stack React framework with SSR"
              src="/tanstack-logo.png"
              href="https://tanstack.com/start"
            />
            <TechLogo
              name="Drizzle"
              description="Type-safe ORM for TypeScript"
              src="/drizzle-logo.png"
              href="https://orm.drizzle.team"
            />
            <TechLogo
              name="BetterAuth"
              description="Modern authentication library"
              src="/better-auth-logo.png"
              href="https://www.better-auth.com"
            />
          </div>
        </div>
      </section>
    </div>
  )
}

function TechLogo({
  name,
  description,
  src,
  href,
}: {
  name: string
  description: string
  src: string
  href: string
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex flex-col items-center gap-2 group"
    >
      <div className="size-12 flex items-center justify-center">
        <img src={src} alt={name} className="size-10 object-contain" />
      </div>
      <div className="text-center">
        <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
          {name}
        </span>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
    </a>
  )
}
