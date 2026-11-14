import { createFileRoute, Outlet } from '@tanstack/react-router'
import {
  evaluateMyPortalAccessFn,
  recordPortalAccessDeniedFn,
} from '@/lib/server/functions/portal-access'
import { AppShell } from '../components/app-shell'
import { PortalGate } from '../components/portal-gate'

/**
 * Pathless layout: the sidebar frame around every portal page. A private portal (Quackback's portal
 * access settings) shows the gate instead of the page to visitors it doesn't let in.
 */
export const Route = createFileRoute('/_app')({
  beforeLoad: async ({ context }) => {
    const portalAccess = await evaluateMyPortalAccessFn()
    const signedIn = !!context.session?.user && context.session.user.principalType !== 'anonymous'
    // audit trail for signed-in visitors who are turned away (best effort)
    if (!portalAccess.granted && signedIn) {
      void recordPortalAccessDeniedFn({ data: { reason: portalAccess.reason } }).catch(() => {})
    }
    return { portalAccess }
  },
  component: Layout,
})

function Layout() {
  const access = Route.useRouteContext({ select: (c) => c.portalAccess })
  return <AppShell>{access.granted ? <Outlet /> : <PortalGate reason={access.reason} />}</AppShell>
}
