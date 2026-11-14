import { createFileRoute } from '@tanstack/react-router'
import { Download } from 'lucide-react'
import { m } from '../../paraglide/messages.js'
import { Page } from '../../components/page'
import { ComingSoon } from '../../components/coming-soon'
import { issues } from '../../lib/issues'

export const Route = createFileRoute('/_app/downloads')({
  head: () => ({ meta: [{ title: `${m.nav_downloads()} · crazy-hub` }] }),
  component: () => (
    <Page title={m.nav_downloads()} description={m.page_downloads_description()}>
      <ComingSoon icon={Download} issue={issues.downloads} />
    </Page>
  ),
})
