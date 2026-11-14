import { createFileRoute, notFound, Outlet } from '@tanstack/react-router'
import { productBySlug } from '../../lib/products'

/** A product's part of the hub (`/trainer/…`); an unknown product is a 404. */
export const Route = createFileRoute('/_app/$product')({
  beforeLoad: ({ params }) => {
    const product = productBySlug(params.product)
    if (!product) throw notFound()
    return { product }
  },
  component: Outlet,
})
