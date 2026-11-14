/**
 * A page in the panel. It comes in from the direction of its link in the sidebar (further down the menu
 * rises from below, higher up drops in from above) and its blocks rise one after another, top to bottom
 * (ported from the crazy-ui docs). The first page of a visit is server-rendered and shown as it is.
 */
import { cn } from '@crazy-staff/ui'
import { useLocation } from '@tanstack/react-router'
import { motion, useReducedMotion } from 'motion/react'
import { useEffect, type ReactNode } from 'react'
import { navPosition } from '../lib/nav'

export const EASE = [0.22, 1, 0.36, 1] as const

let booted = false
let last: { id: string; position: number } | null = null
const dirs = new Map<string, number>()

function PageTransition({
  id,
  position,
  children,
}: {
  id: string
  position: number
  children: ReactNode
}) {
  const reduce = useReducedMotion()
  if (last?.id !== id) {
    dirs.set(id, !last || last.position === position ? 0 : position > last.position ? 1 : -1)
    last = { id, position }
  }
  const dir = dirs.get(id) ?? 0
  useEffect(() => {
    booted = true
  }, [])
  const animate = booted && !reduce
  return (
    <motion.div
      key={id}
      data-page-enter={animate ? '' : undefined}
      className="flex flex-col gap-4"
      initial={animate ? { opacity: 0, y: dir === 0 ? 12 : dir * 40, filter: 'blur(6px)' } : false}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ duration: 0.5, ease: EASE }}
    >
      {children}
    </motion.div>
  )
}

export interface PageProps {
  title: ReactNode
  description?: ReactNode
  /** Buttons at the end of the title row. */
  actions?: ReactNode
  /** The right column ("On this page"). The column is there on every page, so the content never moves. */
  toc?: ReactNode
  className?: string
  children?: ReactNode
}

/**
 * The page geometry of the crazy-ui docs (Fumadocs' spacious layout): a 760px column centred together
 * with a 304px right column, below the 56px top bar; the right column folds away when the panel is
 * narrower than 64rem. Used by every page and by the loading skeleton.
 */
export function PageFrame({
  toc,
  className,
  children,
}: {
  toc?: ReactNode
  className?: string
  children: ReactNode
}) {
  return (
    <div
      className={cn(
        // the side padding and the column widths are set on the panel's scroller (app-shell.tsx), as
        // Fumadocs does: its percentage then refers to the panel, not to the scroller's inner width
        'flex items-start',
        className
      )}
    >
      <article className="flex w-full max-w-(--page-width) min-w-0 flex-col gap-4 pt-6 pb-8">
        {children}
      </article>
      <aside
        className="sticky top-0 flex w-(--toc-width) shrink-0 flex-col ps-16 pt-8 pb-4 max-md:hidden @max-5xl:invisible @max-5xl:ps-0"
        aria-hidden={toc ? undefined : true}
      >
        {toc}
      </aside>
    </div>
  )
}

/** A page: title (1.75em semibold) and description (text-lg muted) as in the docs, then the content. */
export function Page({ title, description, actions, toc, className, children }: PageProps) {
  const pathname = useLocation({ select: (l) => l.pathname })
  return (
    <PageFrame toc={toc} className={className}>
      <PageTransition id={pathname} position={navPosition(pathname)}>
        <header data-stagger="" className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="me-auto text-[1.75em] font-semibold">{title}</h1>
            {actions}
          </div>
          {description && <p className="mb-8 text-lg text-muted">{description}</p>}
        </header>
        <div data-stagger="" className="flex flex-col gap-6">
          {children}
        </div>
      </PageTransition>
    </PageFrame>
  )
}
