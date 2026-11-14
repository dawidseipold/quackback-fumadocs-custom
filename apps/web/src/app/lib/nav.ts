import { House, type LucideIcon } from 'lucide-react'
import { m } from '../paraglide/messages.js'
import { PRODUCTS, type Product } from './products'

/** Rows common to the whole hub, above the product picker. */
export const COMMON: { to: '/'; label: () => string; icon: LucideIcon }[] = [
  { to: '/', label: m.nav_home, icon: House },
]

/** The path of a product's section. */
export const sectionPath = (product: Product, section: string) => `/${product.slug}/${section}`

/** Every nav row in sidebar order; the order also decides the direction of page transitions. */
const order = [
  ...COMMON.map((item) => item.to as string),
  ...PRODUCTS.flatMap((product) => product.sections.map((s) => sectionPath(product, s.id))),
]

/** The nav row a path belongs to (a page under /trainer/docs/… belongs to Docs). */
export function navItemOf(pathname: string): string | undefined {
  return order
    .filter((to) =>
      to === '/' ? pathname === '/' : pathname === to || pathname.startsWith(`${to}/`)
    )
    .sort((a, b) => b.length - a.length)[0]
}

/** Position of a path in the sidebar, for the direction a page comes in from. */
export function navPosition(pathname: string): number {
  const item = navItemOf(pathname)
  return item ? order.indexOf(item) : order.length
}
