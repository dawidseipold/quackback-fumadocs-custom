import { Avatar, Button, DropdownMenu } from '@crazy-staff/ui'
import { Link, useRouter } from '@tanstack/react-router'
import { LayoutDashboard, LogIn, LogOut, Settings } from 'lucide-react'
import { signOut } from '@/lib/client/auth-client'
import { useSessionContext, useUserRole } from '@/lib/client/hooks/use-root-context'
import { isTeamMember } from '@/lib/shared/roles'
import { openSignIn } from './auth/auth-dialog'
import { m } from '../paraglide/messages.js'

/**
 * Top right of the panel: "Sign in" for visitors (opens the sign-in dialog on this page, `?auth=signin`),
 * the account menu once signed in.
 */
export function AccountMenu() {
  const session = useSessionContext()
  const role = useUserRole()
  const router = useRouter()
  const user = session?.user

  if (!user) {
    return (
      <Button
        size="sm"
        variant="outline"
        nativeButton={false}
        render={<Link to="." search={openSignIn} />}
      >
        <LogIn /> {m.sign_in()}
      </Button>
    )
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        render={
          <Button variant="ghost" size="sm" className="gap-2 ps-1" aria-label={m.account_menu()} />
        }
      >
        <Avatar
          size="sm"
          className="size-6"
          src={user.image ?? undefined}
          name={user.name || user.email}
        />
        <span className="max-w-40 truncate max-sm:hidden">{user.name || user.email}</span>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="end" className="min-w-56">
        <div className="px-2.5 py-2">
          <div className="truncate text-sm font-medium">{user.name}</div>
          <div className="truncate text-xs text-muted">{user.email}</div>
        </div>
        {isTeamMember(role) && (
          <>
            <DropdownMenu.Separator />
            <DropdownMenu.Item render={<Link to="/admin" />}>
              <LayoutDashboard /> {m.nav_admin()}
            </DropdownMenu.Item>
          </>
        )}
        <DropdownMenu.Separator />
        <DropdownMenu.Item render={<Link to="/settings/profile" />}>
          <Settings /> {m.settings_title()}
        </DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item
          danger
          onClick={async () => {
            await signOut().catch(() => {})
            await router.invalidate()
          }}
        >
          <LogOut /> {m.sign_out()}
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )
}
