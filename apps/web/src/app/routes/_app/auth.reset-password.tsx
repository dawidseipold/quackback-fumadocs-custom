import { Alert, Button, Field, Input } from '@crazy-staff/ui'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, type FormEvent } from 'react'
import { authClient } from '@/lib/client/auth-client'
import { m } from '../../paraglide/messages.js'
import { Page } from '../../components/page'

/** Where the password reset email lands (`/auth/reset-password?token=…`). */
export const Route = createFileRoute('/_app/auth/reset-password')({
  validateSearch: (search: Record<string, unknown>) => ({
    token: typeof search.token === 'string' ? search.token : undefined,
    error: typeof search.error === 'string' ? search.error : undefined,
  }),
  head: () => ({ meta: [{ title: `${m.auth_reset_title()} · crazy-hub` }] }),
  component: ResetPassword,
})

function ResetPassword() {
  const { token, error: linkError } = Route.useSearch()
  const [state, setState] = useState<'idle' | 'busy' | 'done'>('idle')
  const [error, setError] = useState<string | undefined>(
    linkError || !token ? m.auth_reset_invalid() : undefined
  )

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const password = String(data.get('password') ?? '')
    if (password !== String(data.get('confirm') ?? '')) {
      setError(m.auth_reset_mismatch())
      return
    }
    setError(undefined)
    setState('busy')
    const result = await authClient.resetPassword({ newPassword: password, token: token ?? '' })
    if (result.error) {
      setError(result.error.message || m.auth_error_generic())
      setState('idle')
    } else setState('done')
  }

  return (
    <Page title={m.auth_reset_title()} description={m.auth_reset_description()}>
      <div className="flex max-w-sm flex-col gap-5">
        {error && <Alert variant="danger" title={error} />}
        {state === 'done' ? (
          <>
            <Alert variant="success" title={m.auth_reset_done()} />
            <Button nativeButton={false} render={<Link to="/" search={{ auth: 'signin' }} />}>
              {m.auth_submit_signin()}
            </Button>
          </>
        ) : (
          token && (
            <form className="flex flex-col gap-4" onSubmit={onSubmit}>
              <Field label={m.auth_new_password()} description={m.auth_password_hint()}>
                <Input
                  name="password"
                  type="password"
                  minLength={8}
                  required
                  autoComplete="new-password"
                />
              </Field>
              <Field label={m.auth_confirm_password()}>
                <Input
                  name="confirm"
                  type="password"
                  minLength={8}
                  required
                  autoComplete="new-password"
                />
              </Field>
              <Button type="submit" disabled={state === 'busy'}>
                {m.auth_reset_submit()}
              </Button>
            </form>
          )
        )}
      </div>
    </Page>
  )
}
