import { createFileRoute, notFound } from '@tanstack/react-router'
import { SECTION_META } from '../../../lib/products'
import { SectionPage } from '../../../components/section-page'

/**
 * Placeholder for every product section until its own route lands with its issue (a file route such as
 * `$product/docs.tsx` then takes precedence over this one).
 */
export const Route = createFileRoute('/_app/$product/$section')({
  beforeLoad: ({ context, params }) => {
    const section = context.product.sections.find((s) => s.id === params.section)
    if (!section) throw notFound()
    return { section: section.id }
  },
  head: ({ match }) => ({
    meta: [
      { title: `${SECTION_META[match.context.section].label()} · ${match.context.product.title}` },
    ],
  }),
  component: () => <SectionPage section={Route.useRouteContext({ select: (c) => c.section })} />,
})
