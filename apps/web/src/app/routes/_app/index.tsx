import { createFileRoute } from '@tanstack/react-router'
import { Lightbulb } from 'lucide-react'
import { m } from '../../paraglide/messages.js'
import { Page } from '../../components/page'
import { ComingSoon } from '../../components/coming-soon'
import { issues } from '../../lib/issues'

export const Route = createFileRoute('/_app/')({
  head: () => ({ meta: [{ title: `${m.nav_ideas()} · crazy-hub` }] }),
  component: () => (
    <Page title={m.nav_ideas()} description={m.page_ideas_description()}>
      <ComingSoon icon={Lightbulb} issue={issues.feedback} />
    </Page>
  ),
})
