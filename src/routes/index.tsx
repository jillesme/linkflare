import { createFileRoute, Link } from '@tanstack/react-router'
import { ExternalLink } from 'lucide-react'

import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/')({ component: HomePage })

function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="px-4 py-20 md:py-32">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight mb-6">
            Link-in-bio template for developers
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Clone, customize, and deploy your own link page in minutes. 
            Built on the edge with TanStack Start and Cloudflare Workers.
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
              <a href="#" target="_blank" rel="noopener noreferrer">
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
          <p className="text-center text-sm text-muted-foreground mb-8">
            Built with
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 justify-items-center">
            <TechLogo name="Cloudflare Workers" src="/cloudflare-logo.jpeg" />
            <TechLogo name="TanStack Start" src="/tanstack-logo.png" />
            <TechLogo name="Drizzle" src="/drizzle-logo.png" />
            <TechLogo name="BetterAuth" src="/better-auth-logo.png" />
          </div>
        </div>
      </section>
    </div>
  )
}

function TechLogo({ name, src }: { name: string; src: string }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="size-12 flex items-center justify-center">
        <img src={src} alt={name} className="size-10 object-contain" />
      </div>
      <span className="text-sm text-muted-foreground">{name}</span>
    </div>
  )
}
