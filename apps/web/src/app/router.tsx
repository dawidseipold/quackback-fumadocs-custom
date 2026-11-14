import { QueryClient } from '@tanstack/react-query'
import { createRouter } from '@tanstack/react-router'
import { setupRouterSsrQueryIntegration } from '@tanstack/react-router-ssr-query'
import { routeTree } from './routeTree.gen'
import { ErrorPage, NotFoundPage } from './components/error-page'
import { PageSkeleton } from './components/page-skeleton'
import { expireRouteContextOnInvalidate } from '@/lib/client/route-context-memo'
import { createAutosaveMutationCache } from '@/lib/client/autosave'

/** The router of crazy-hub (Quackback's `src/router.tsx` stays unused, see `routes.ts`). */
export function getRouter() {
  const queryClient = new QueryClient({
    mutationCache: createAutosaveMutationCache(),
    defaultOptions: {
      queries: {
        staleTime: 30 * 1000,
        gcTime: 5 * 60 * 1000,
      },
    },
  })

  const router = createRouter({
    routeTree,
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 30_000,
    scrollRestoration: true,
    defaultPendingMs: 120,
    defaultPendingMinMs: 250,
    defaultPendingComponent: PageSkeleton,
    context: { queryClient },
    defaultErrorComponent: ErrorPage,
    defaultNotFoundComponent: NotFoundPage,
  })

  setupRouterSsrQueryIntegration({ router, queryClient })

  // Sign-in, sign-out and settings changes call router.invalidate() to refresh the root context, which
  // navigations otherwise reuse (Quackback's route-context memo).
  expireRouteContextOnInvalidate(router)

  return router
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
