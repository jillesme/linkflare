import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard')({
  beforeLoad: ({ context }) => {
    if (!context.session) {
      throw redirect({ to: '/authentication/login' })
    }
  },
  component: DashboardLayout,
})

function DashboardLayout() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Outlet />
      </div>
    </div>
  )
}
