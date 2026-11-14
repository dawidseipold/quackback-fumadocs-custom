import { Page } from './page'
import { ComingSoon } from './coming-soon'
import { SECTION_META, type SectionId } from '../lib/products'

/** A product section that is still a placeholder: its title, description and the issue that builds it. */
export function SectionPage({ section }: { section: SectionId }) {
  const meta = SECTION_META[section]
  return (
    <Page title={meta.label()} description={meta.description()}>
      <ComingSoon icon={meta.icon} issue={meta.issue} />
    </Page>
  )
}
