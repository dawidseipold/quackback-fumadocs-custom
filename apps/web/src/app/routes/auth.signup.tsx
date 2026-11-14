import { createFileRoute, redirect } from '@tanstack/react-router'
import { safeSigninRedirect } from '@/lib/shared/auth-prompt'

/** Old and emailed links: `/auth/signup` opens the dialog on "Create account". */
export const Route = createFileRoute('/auth/signup')({
  validateSearch: (search: Record<string, unknown>) => ({
    callbackUrl: typeof search.callbackUrl === 'string' ? search.callbackUrl : undefined,
  }),
  beforeLoad: ({ search }) => {
    throw redirect(safeSigninRedirect(search, '/', { mode: 'signup' }))
  },
})
