import { createFileRoute } from '@tanstack/react-router'
import { BookOpen } from 'lucide-react'
import { m } from '../../paraglide/messages.js'
import { Page } from '../../components/page'
import { ComingSoon } from '../../components/coming-soon'
import { issues } from '../../lib/issues'

export const Route = createFileRoute('/_app/docs')({
  head: () => ({ meta: [{ title: `${m.nav_docs()} · crazy-hub` }] }),
  component: () => (
    <Page title={m.nav_docs()} description={m.page_docs_description()}>
      <ComingSoon icon={BookOpen} issue={issues.docs} />
    </Page>
  ),
})
