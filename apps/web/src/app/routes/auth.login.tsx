import { createFileRoute, redirect } from '@tanstack/react-router'
import { safeSigninRedirect } from '@/lib/shared/auth-prompt'

/** Old and emailed links: `/auth/login` opens the sign-in dialog on the start page. */
export const Route = createFileRoute('/auth/login')({
  validateSearch: (search: Record<string, unknown>) => ({
    callbackUrl: typeof search.callbackUrl === 'string' ? search.callbackUrl : undefined,
    error: typeof search.error === 'string' ? search.error : undefined,
  }),
  beforeLoad: ({ search }) => {
    throw redirect(safeSigninRedirect(search, '/'))
  },
})
