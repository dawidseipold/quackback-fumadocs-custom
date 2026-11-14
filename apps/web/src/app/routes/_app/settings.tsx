import { Tabs } from '@crazy-staff/ui'
import { createFileRoute, Outlet, redirect, useLocation, useNavigate } from '@tanstack/react-router'
import { m } from '../../paraglide/messages.js'
import { Page } from '../../components/page'

const TABS = [
  { value: '/settings/profile', label: m.settings_profile },
  { value: '/settings/security', label: m.settings_security },
  { value: '/settings/preferences', label: m.settings_preferences },
] as const

/** The signed-in person's own settings (#4, part 2). Common to the whole hub, not to a product. */
export const Route = createFileRoute('/_app/settings')({
  beforeLoad: ({ context, location }) => {
    if (!context.session?.user) {
      throw redirect({ to: '/', search: { auth: 'signin', callbackUrl: location.href } as never })
    }
    return { user: context.session.user }
  },
  head: () => ({ meta: [{ title: `${m.settings_title()} · crazy-hub` }] }),
  component: SettingsLayout,
})

function SettingsLayout() {
  const pathname = useLocation({ select: (l) => l.pathname })
  const navigate = useNavigate()
  const current = TABS.find((t) => pathname.startsWith(t.value))?.value ?? TABS[0].value
  return (
    <Page title={m.settings_title()} description={m.settings_description()}>
      <Tabs
        value={current}
        onValueChange={(value) => void navigate({ to: value as string })}
        items={TABS.map((t) => ({ value: t.value, label: t.label(), content: null }))}
        classNames={{ panel: 'hidden' }}
      />
      <Outlet />
    </Page>
  )
}
