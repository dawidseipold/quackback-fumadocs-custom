import { createFileRoute } from '@tanstack/react-router'
import { LayoutDashboard } from 'lucide-react'
import { m } from '../../paraglide/messages.js'
import { Page } from '../../components/page'
import { ComingSoon } from '../../components/coming-soon'
import { issues } from '../../lib/issues'

export const Route = createFileRoute('/admin/')({
  head: () => ({ meta: [{ title: `${m.nav_admin()} · Crazy Hub` }] }),
  component: () => (
    <Page title={m.nav_admin()} description={m.page_admin_description()}>
      <ComingSoon icon={LayoutDashboard} issue={issues.adminInbox} />
    </Page>
  ),
})
