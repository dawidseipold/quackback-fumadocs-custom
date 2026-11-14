/// <reference types="vite/client" />
import type { QueryClient } from '@tanstack/react-query'
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  rootRouteId,
  Scripts,
  useRouter,
} from '@tanstack/react-router'
import { useEffect, type ReactNode } from 'react'
import { getBootstrapData, type BootstrapData } from '@/lib/server/functions/bootstrap'
import { createRouteContextMemo } from '@/lib/client/route-context-memo'
import { resolveDocumentTheme, SYSTEM_THEME_SCRIPT } from '@/lib/shared/theme'
import type { Role } from '@/lib/shared/roles'
import type { WorkspaceSettings } from '@/lib/shared/types/settings'
import appCss from './styles/app.css?url'
import { getLocale } from './paraglide/runtime.js'
import { ThemeProvider } from './components/theme-provider'
import { Squircles } from './components/squircles'
import { ErrorPage } from './components/error-page'

/**
 * The root context: Quackback's bootstrap (session, role, workspace settings, theme cookie …). The hooks
 * in `@/lib/client/hooks/use-root-context` read it, so its shape matches Quackback's root route.
 */
export interface RouterContext {
  queryClient: QueryClient
  baseUrl?: string
  session?: BootstrapData['session']
  settings?: WorkspaceSettings | null
  userRole?: Role | null
  themeCookie?: BootstrapData['themeCookie']
  prefersColorScheme?: BootstrapData['prefersColorScheme']
  registeredAuthProviders?: string[]
}

// The settings arrive already redacted: getBootstrapData scrubs them on the server.
async function loadRootContext() {
  const { settings, ...bootstrap } = await getBootstrapData()
  return { ...bootstrap, settings }
}
type RootContext = Awaited<ReturnType<typeof loadRootContext>>

/** Navigations and preloads share one bootstrap call until the viewer or the workspace changes. */
const rootContext = createRouteContextMemo<RootContext>()

export const Route = createRootRouteWithContext<RouterContext>()({
  beforeLoad: () => rootContext.get(loadRootContext),
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
      { title: 'Crazy Hub' },
      {
        name: 'description',
        content: 'Ideas, roadmaps, changelog and docs of the Crazy Gothic Trainer.',
      },
    ],
    links: [{ rel: 'stylesheet', href: appCss }],
  }),
  component: RootComponent,
  errorComponent: ({ error, reset }) => (
    <Document>
      <ErrorPage error={error} reset={reset} />
    </Document>
  ),
})

function RootComponent() {
  useSeedRootContext()
  return (
    <Document>
      <Outlet />
    </Document>
  )
}

/** The first navigation after hydration reuses the context the document was rendered with. */
function useSeedRootContext() {
  const router = useRouter()
  useEffect(() => {
    const root = router.state.matches.find((match) => match.routeId === rootRouteId)
    if (!root) return
    const { queryClient: _queryClient, ...rendered } = root.context as RouterContext &
      Partial<RootContext>
    if (rendered.onboarding) rootContext.seed(rendered as RootContext)
  }, [router])
}

function Document({ children }: { children: ReactNode }) {
  const themeCookie = Route.useRouteContext({ select: (c) => c.themeCookie }) ?? 'system'
  const prefersColorScheme = Route.useRouteContext({ select: (c) => c.prefersColorScheme })
  // The class is committed on the SSR <html> when the theme is known (no white flash for dark users);
  // `system` without the client hint is resolved by SYSTEM_THEME_SCRIPT before the body paints.
  const { className, colorScheme } = resolveDocumentTheme(themeCookie, prefersColorScheme)
  return (
    <html lang={getLocale()} className={className} style={{ colorScheme }} suppressHydrationWarning>
      <head>
        {!className && <script dangerouslySetInnerHTML={{ __html: SYSTEM_THEME_SCRIPT }} />}
        <HeadContent />
      </head>
      <body>
        <ThemeProvider defaultTheme={themeCookie}>
          <Squircles />
          {children}
        </ThemeProvider>
        <Scripts />
      </body>
    </html>
  )
}
