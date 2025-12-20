import { createFileRoute, redirect } from '@tanstack/react-router'

import { getPublicLinkById, recordClick } from '@/lib/server-fns/links'

export const Route = createFileRoute('/go/$linkId')({
  loader: async ({ params }) => {
    const link = await getPublicLinkById({ data: params.linkId })

    if (!link) {
      throw redirect({ to: '/' })
    }

    // Record the click
    await recordClick({ data: link.id })

    // Redirect to the actual URL
    throw redirect({ href: link.url })
  },
  component: () => null, // Never rendered due to redirect
})
