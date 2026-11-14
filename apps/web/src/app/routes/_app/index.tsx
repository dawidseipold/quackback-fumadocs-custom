import { Card, Reveal } from '@crazy-staff/ui'
import { createFileRoute, Link } from '@tanstack/react-router'
import { m } from '../../paraglide/messages.js'
import { Page } from '../../components/page'
import { PRODUCTS } from '../../lib/products'

/** The hub's start page, common to every product: what crazy-hub is and a card per product. */
export const Route = createFileRoute('/_app/')({
  head: () => ({ meta: [{ title: 'crazy-hub' }] }),
  component: Home,
})

function Home() {
  return (
    <Page title="crazy-hub" description={m.page_home_description()}>
      {/* link cards as in the crazy-ui docs */}
      <Reveal.Group className="grid gap-3 sm:grid-cols-2" stagger={0.04}>
        {PRODUCTS.map((product) => (
          <Reveal.Item key={product.id}>
            <Link
              to="/$product"
              params={{ product: product.slug }}
              className="block h-full rounded-card outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Card.Root interactive className="flex h-full gap-3 p-4">
                <span className="squircle flex size-9 shrink-0 items-center justify-center rounded-control-sm bg-accent-soft text-xs font-semibold text-accent-soft-foreground">
                  {product.short}
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="text-sm font-semibold">{product.title}</span>
                  <span className="mt-1 text-sm text-muted">{product.description}</span>
                </span>
              </Card.Root>
            </Link>
          </Reveal.Item>
        ))}
      </Reveal.Group>
    </Page>
  )
}
