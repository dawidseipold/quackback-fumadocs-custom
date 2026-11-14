import { Button, Empty } from '@crazy-staff/ui'
import { Lock } from 'lucide-react'
import { m } from '../paraglide/messages.js'

/** Shown instead of the page when the portal is private and the visitor isn't let in. */
export function PortalGate({ reason }: { reason?: string | null }) {
  const signedOut = reason === 'unauthenticated'
  return (
    <div className="flex min-h-[70svh] items-center justify-center p-6">
      <Empty
        icon={<Lock />}
        title={m.portal_private_title()}
        description={signedOut ? m.portal_private_signed_out() : m.portal_private_no_access()}
        action={
          signedOut ? (
            <Button size="sm" nativeButton={false} render={<a href="/?auth=signin" />}>
              {m.sign_in()}
            </Button>
          ) : undefined
        }
      />
    </div>
  )
}
