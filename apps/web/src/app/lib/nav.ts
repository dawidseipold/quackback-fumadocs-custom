import { BookOpen, Lightbulb, Map, ScrollText, type LucideIcon } from 'lucide-react'
import { m } from '../paraglide/messages.js'

export interface NavItem {
  to: '/' | '/roadmap' | '/changelog' | '/docs'
  label: () => string
  icon: LucideIcon
}
export interface NavGroup {
  label: () => string
  items: NavItem[]
}

/** The portal's sidebar. The order also decides the direction of page transitions. */
export const nav: NavGroup[] = [
  {
    label: m.nav_feedback,
    items: [
      { to: '/', label: m.nav_ideas, icon: Lightbulb },
      { to: '/roadmap', label: m.nav_roadmap, icon: Map },
      { to: '/changelog', label: m.nav_changelog, icon: ScrollText },
    ],
  },
  {
    label: m.nav_trainer,
    items: [{ to: '/docs', label: m.nav_docs, icon: BookOpen }],
  },
]

const order = nav.flatMap((group) => group.items.map((item) => item.to as string))

/** The nav row a path belongs to (a page under /roadmap/… belongs to Roadmap). */
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
