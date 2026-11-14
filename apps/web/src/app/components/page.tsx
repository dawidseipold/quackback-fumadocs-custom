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
      className="flex flex-col gap-8"
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
  className?: string
  children?: ReactNode
}

export function Page({ title, description, actions, className, children }: PageProps) {
  const pathname = useLocation({ select: (l) => l.pathname })
  return (
    <div className={cn('mx-auto w-full max-w-5xl px-6 pt-16 pb-24 md:px-10 md:pt-20', className)}>
      <PageTransition id={pathname} position={navPosition(pathname)}>
        <header data-stagger="" className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="me-auto font-heading text-3xl font-semibold tracking-tight">{title}</h1>
            {actions}
          </div>
          {description && <p className="max-w-2xl text-base text-muted">{description}</p>}
        </header>
        <div data-stagger="" className="flex flex-col gap-6">
          {children}
        </div>
      </PageTransition>
    </div>
  )
}
