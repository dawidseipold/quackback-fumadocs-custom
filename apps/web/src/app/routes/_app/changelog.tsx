import { createFileRoute } from '@tanstack/react-router'
import { ScrollText } from 'lucide-react'
import { m } from '../../paraglide/messages.js'
import { Page } from '../../components/page'
import { ComingSoon } from '../../components/coming-soon'
import { issues } from '../../lib/issues'

export const Route = createFileRoute('/_app/changelog')({
  head: () => ({ meta: [{ title: `${m.nav_changelog()} · crazy-hub` }] }),
  component: () => (
    <Page title={m.nav_changelog()} description={m.page_changelog_description()}>
      <ComingSoon icon={ScrollText} issue={issues.changelog} />
    </Page>
  ),
})
