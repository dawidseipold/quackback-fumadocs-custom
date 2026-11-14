/**
 * The frame of every portal page, as in the crazy-ui docs: the sidebar on the frame colour (fully
 * collapsible, one gliding hover block over the rows, the active row with the soft accent fill) and the
 * page in a rounded panel. Top right of the panel: language, theme and the account menu. The panel
 * scrolls on its own, with a progressive blur at the bottom while there is more to see and at the top
 * once scrolled.
 *
 * Sidebar order: the hub's name, the rows common to the whole hub, the product picker (product, then its
 * game and renderer), the picked product's sections. Links like terms, contact and GitHub go at the
 * bottom later.
 *
 * Until `@crazy-staff/ui` 0.2.1 (crazy-staff/crazy-ui#3) the header row, the collapse button and the
 * row/group spacing are set here to the docs sidebar's values; afterwards the library's own parts match.
 */
import { ProgressiveBlur, Sidebar, cn, useSidebar } from '@crazy-staff/ui'
import { Link, useLocation } from '@tanstack/react-router'
import { PanelLeft } from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { m } from '../paraglide/messages.js'
import { COMMON, navItemOf, sectionPath } from '../lib/nav'
import { PRODUCTS, SECTION_META, locate } from '../lib/products'
import { AccountMenu } from './account-menu'
import { ContextPickers } from './context-pickers'
import { LanguageMenu } from './language-menu'
import { ThemeToggle } from './theme-toggle'

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <Sidebar.Provider className="h-svh min-h-0 overflow-hidden" width="17rem">
      <AppSidebar />
      <Sidebar.Inset className="@container isolate min-h-0 overflow-hidden">
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

/** The docs sidebar's collapse button: 32px, 16px icon, the neutral hover of the rows, no press scale. */
const iconButton = cn(
  'squircle inline-flex size-8 shrink-0 items-center justify-center rounded-control-sm text-muted outline-none',
  'transition-colors duration-[var(--cui-duration-fast)] ease-ui hover:bg-hover hover:text-foreground',
  'focus-visible:ring-2 focus-visible:ring-ring [&_svg]:size-4'
)

function CollapseButton({ className }: { className?: string }) {
  const { open, toggle } = useSidebar()
  const label = open ? m.sidebar_collapse() : m.sidebar_open()
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={toggle}
      className={cn(iconButton, className)}
    >
      <PanelLeft />
    </button>
  )
}

/** The name of the whole hub, not of one product. */
function Brand() {
  return (
    <Link
      to="/"
      className="me-auto inline-flex min-w-0 items-center gap-2.5 rounded-control-sm text-[0.9375rem] font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="squircle flex size-7 shrink-0 items-center justify-center rounded-chip bg-accent text-xs font-bold text-accent-foreground">
        C
      </span>
      <span className="truncate">crazy-hub</span>
    </Link>
  )
}

function AppSidebar() {
  const pathname = useLocation({ select: (l) => l.pathname })
  const active = navItemOf(pathname)
  // outside a product (the start page, the admin) the first product is shown
  const product = locate(pathname).product ?? PRODUCTS[0]
  return (
    <Sidebar label={m.nav_label()}>
      {/* the docs sidebar's title row; it keeps its own hover, the gliding block is for the rows */}
      <div data-no-glide-area="" className="my-2 flex h-14 shrink-0 items-center gap-2 ps-4 pe-3">
        <Brand />
        <CollapseButton />
      </div>
      <Sidebar.Content className="gap-6 pt-4 pb-8">
        <Sidebar.Group aria-label="crazy-hub" classNames={{ list: 'gap-0' }}>
          {COMMON.map((item) => (
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
        <div className="flex flex-col gap-3">
          <ContextPickers product={product} />
          {/* no group label: the picker above already names the product */}
          <Sidebar.Group aria-label={product.title} classNames={{ list: 'gap-0' }}>
            {product.sections.map((section) => {
              const meta = SECTION_META[section.id]
              const to = sectionPath(product, section.id)
              return (
                <Sidebar.Item
                  key={section.id}
                  render={
                    <Link
                      to="/$product/$section"
                      params={{ product: product.slug, section: section.id }}
                    />
                  }
                  icon={<meta.icon />}
                  active={active === to}
                >
                  {meta.label()}
                </Sidebar.Item>
              )
            })}
          </Sidebar.Group>
        </div>
      </Sidebar.Content>
    </Sidebar>
  )
}

/**
 * Floats over the page (the glow runs under it), the docs' top bar: 56px, 24px in from the left, 16px
 * from the right. The open button shows only while the sidebar is closed.
 */
function TopBar() {
  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-10 flex h-14 items-center gap-1.5 ps-6 pe-4">
      <div className="pointer-events-auto flex items-center">
        <CollapseButton className="-ms-2 in-data-[sidebar=open]:md:hidden" />
      </div>
      <div className="pointer-events-auto ms-auto flex items-center gap-1.5">
        <LanguageMenu />
        <ThemeToggle />
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
        className={cn(
          'relative min-h-0 flex-1 overflow-y-auto overscroll-contain [overflow-anchor:none] [scrollbar-gutter:stable] [scrollbar-width:thin]',
          // the docs' page geometry (see PageFrame): 760px page + 304px right column, centred together
          '[--page-width:760px] [--toc-width:--spacing(76)] @max-5xl:[--toc-width:0px]',
          'px-4 md:px-[max(--spacing(6),calc((100%-var(--page-width)-var(--toc-width))/2))] md:pt-14'
        )}
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
