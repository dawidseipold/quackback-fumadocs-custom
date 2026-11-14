import { Button, Empty } from '@crazy-staff/ui'
import { Link } from '@tanstack/react-router'
import { Lock } from 'lucide-react'
import { openSignIn } from './auth/auth-dialog'
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
            <Button size="sm" nativeButton={false} render={<Link to="." search={openSignIn} />}>
              {m.sign_in()}
            </Button>
          ) : undefined
        }
      />
    </div>
  )
}
