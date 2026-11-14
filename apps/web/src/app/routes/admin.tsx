import { createFileRoute, Outlet } from '@tanstack/react-router'
import { createRouteContextMemo } from '@/lib/client/route-context-memo'
import type { requireWorkspaceRole } from '@/lib/server/functions/workspace-utils'
import { AppShell } from '../components/app-shell'

/**
 * The admin: only team members (Quackback's `admin` and `member` roles). The guard is Quackback's
 * `requireWorkspaceRole` (it redirects visitors to sign in) and its answer is the route context the
 * admin hooks in `@/lib/client/hooks/use-root-context` read (`usePermissions`, `usePrincipalId` …), so
 * this route keeps the id `/admin`.
 */
type AdminGuard = Pick<
  Awaited<ReturnType<typeof requireWorkspaceRole>>,
  'user' | 'principal' | 'permissions'
>

/** Holds for every admin page until the viewer or their role changes. */
const adminGuard = createRouteContextMemo<AdminGuard>()

async function loadAdminGuard(callbackUrl: string): Promise<AdminGuard> {
  const { requireWorkspaceRole } = await import('@/lib/server/functions/workspace-utils')
  const { user, principal, permissions } = await requireWorkspaceRole({
    data: { allowedRoles: ['admin', 'member'], callbackUrl },
  })
  return { user, principal, permissions }
}

export const Route = createFileRoute('/admin')({
  beforeLoad: ({ location }) => adminGuard.get(() => loadAdminGuard(location.href)),
  component: () => (
    <AppShell>
      <Outlet />
    </AppShell>
  ),
})
