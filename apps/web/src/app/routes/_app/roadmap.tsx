import { createFileRoute } from '@tanstack/react-router'
import { Map } from 'lucide-react'
import { m } from '../../paraglide/messages.js'
import { Page } from '../../components/page'
import { ComingSoon } from '../../components/coming-soon'
import { issues } from '../../lib/issues'

export const Route = createFileRoute('/_app/roadmap')({
  head: () => ({ meta: [{ title: `${m.nav_roadmap()} · crazy-hub` }] }),
  component: () => (
    <Page title={m.nav_roadmap()} description={m.page_roadmap_description()}>
      <ComingSoon icon={Map} issue={issues.roadmaps} />
    </Page>
  ),
})
