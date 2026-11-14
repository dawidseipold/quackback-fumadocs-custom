import { createFileRoute, redirect } from '@tanstack/react-router'

/** A product's start is its first section (ideas). */
export const Route = createFileRoute('/_app/$product/')({
  beforeLoad: ({ context }) => {
    throw redirect({
      to: '/$product/$section',
      params: { product: context.product.slug, section: context.product.sections[0].id },
      replace: true,
    })
  },
})
