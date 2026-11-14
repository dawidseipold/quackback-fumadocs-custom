/**
 * The frame of every portal page, as in the crazy-ui docs: the sidebar on the frame colour (fully
 * collapsible, one gliding hover block, the active row with the soft accent fill) and the page in a
 * rounded panel. Top right of the panel: language, theme and the account menu. The panel scrolls on its
 * own, with a progressive blur at the bottom while there is more to see and at the top once scrolled.
 */
import { ProgressiveBlur, Sidebar, cn } from '@crazy-staff/ui'
import { Link, useLocation } from '@tanstack/react-router'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useWorkspaceSettings } from '@/lib/client/hooks/use-root-context'
import { m } from '../paraglide/messages.js'
import { nav, navItemOf } from '../lib/nav'
import { AccountMenu } from './account-menu'
import { LanguageMenu } from './language-menu'
import { ThemeToggle } from './theme-toggle'

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <Sidebar.Provider className="h-svh min-h-0 overflow-hidden" width="17rem">
      <AppSidebar />
      <Sidebar.Inset className="isolate min-h-0 overflow-hidden">
        {/* the accent glow, top left of every page */}
        <div
          aria-hidden
          className="glow pointer-events-none absolute inset-x-0 top-0 -z-10 h-[32rem]"
        />
        <TopBar />
        <PanelScroller>{children}</PanelScroller>
      </Sidebar.Inset>
    </Sidebar.Provider>
  )
}

function Brand() {
  const settings = useWorkspaceSettings()
  const name = settings?.name || 'Crazy Hub'
  return (
    <Link
      to="/"
      className="me-auto inline-flex min-w-0 items-center gap-2.5 rounded-control-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="squircle flex size-7 shrink-0 items-center justify-center rounded-chip bg-accent text-xs font-bold text-accent-foreground">
        C
      </span>
      <span className="flex min-w-0 flex-col leading-tight">
        <span className="truncate text-[0.9375rem] font-semibold">{name}</span>
        <span className="truncate text-[0.6875rem] text-muted">{m.brand_tagline()}</span>
      </span>
    </Link>
  )
}

function AppSidebar() {
  const pathname = useLocation({ select: (l) => l.pathname })
  const active = navItemOf(pathname)
  return (
    <Sidebar label={m.nav_label()}>
      <Sidebar.Header className="h-16 pt-2">
        <Brand />
        <Sidebar.Trigger aria-label={m.sidebar_collapse()} />
      </Sidebar.Header>
      <Sidebar.Content>
        {nav.map((group) => (
          <Sidebar.Group key={group.label()} label={group.label()}>
            {group.items.map((item) => (
              <Sidebar.Item
                key={item.to}
                render={<Link to={item.to} />}
                icon={<item.icon />}
                active={active === item.to}
              >
                {item.label()}
              </Sidebar.Item>
            ))}
          </Sidebar.Group>
        ))}
      </Sidebar.Content>
    </Sidebar>
  )
}

/** Floats over the page (the glow runs under it); the open button shows only while the sidebar is closed. */
function TopBar() {
  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-10 flex h-14 items-center gap-1 px-3 md:px-4">
      <div className="pointer-events-auto flex items-center">
        <Sidebar.Trigger className="in-data-[sidebar=open]:md:hidden" />
      </div>
      <div className="pointer-events-auto ms-auto flex items-center gap-1">
        <LanguageMenu />
        <ThemeToggle />
        <span className="mx-1 h-5 w-px bg-border" aria-hidden />
        <AccountMenu />
      </div>
    </header>
  )
}

function PanelScroller({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const [more, setMore] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = useLocation({ select: (l) => l.pathname })

  useEffect(() => {
    const scroller = ref.current
    if (!scroller) return
    const update = () => {
      setMore(scroller.scrollTop + scroller.clientHeight < scroller.scrollHeight - 8)
      setScrolled(scroller.scrollTop > 8)
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(scroller)
    if (scroller.firstElementChild) ro.observe(scroller.firstElementChild)
    scroller.addEventListener('scroll', update, { passive: true })
    return () => {
      ro.disconnect()
      scroller.removeEventListener('scroll', update)
    }
  }, [])

  // a new page starts at its top (unless the URL points at a section)
  useEffect(() => {
    if (!location.hash) ref.current?.scrollTo({ top: 0 })
  }, [pathname])

  const edge =
    'pointer-events-none absolute inset-x-0 transition-opacity duration-[var(--cui-duration-normal)]'
  return (
    <>
      <div
        ref={ref}
        data-panel-scroller=""
        className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain [overflow-anchor:none]"
      >
        <div className="min-h-full">{children}</div>
      </div>
      {/* under the top bar (z-10), so its buttons stay sharp */}
      <div
        aria-hidden
        className={cn(edge, 'top-0 z-[5] h-20', scrolled ? 'opacity-100' : 'opacity-0')}
      >
        <ProgressiveBlur side="top" size="100%" />
      </div>
      <div
        aria-hidden
        className={cn(edge, 'bottom-0 z-20 h-20', more ? 'opacity-100' : 'opacity-0')}
      >
        <ProgressiveBlur side="bottom" size="100%" tint />
      </div>
    </>
  )
}
