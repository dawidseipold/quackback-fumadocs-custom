/**
 * Sign in and create an account (#4), as a dialog over the page. It opens on any page whose URL carries
 * `?auth=signin` or `?auth=signup` — the URL Quackback's guards already redirect to — and returns to
 * `callbackUrl` (or stays on the page) afterwards. Methods follow the workspace's settings: password,
 * and every OAuth provider that is both switched on and registered on the server. A password sign-in
 * to an account with two-factor continues with the code step. Email codes and magic links wait for an
 * email provider.
 */
import { Alert, Button, Dialog, Field, Input, InputOTP, Separator, Tabs } from '@crazy-staff/ui'
import { useNavigate, useRouter, useSearch } from '@tanstack/react-router'
import { useEffect, useState, type FormEvent } from 'react'
import { authClient } from '@/lib/client/auth-client'
import { navigateAfterAuth } from '@/lib/client/post-auth-navigation'
import { useWorkspaceSettings } from '@/lib/client/hooks/use-root-context'
import { AUTH_PROVIDERS } from '@/lib/shared/auth-providers'
import { parseAuthPromptSearch, signinErrorLanding } from '@/lib/shared/auth-prompt'
import { Route as RootRoute } from '../../root'
import { m } from '../../paraglide/messages.js'
import { BrandIcon } from './brand-icons'

type Mode = 'login' | 'signup'
type Step = 'form' | 'forgot' | 'reset-sent' | 'two-factor'

/** OAuth providers the visitor can actually use: switched on in settings and registered on the server. */
export function usableProviders(
  oauth: Record<string, boolean | undefined> | undefined,
  registered: string[] | undefined
) {
  return AUTH_PROVIDERS.filter(
    (p) => p.type !== 'generic-oauth' && oauth?.[p.id] && (registered ?? []).includes(p.id)
  )
}

/** Messages for the error codes Better Auth and the guards put on the URL. */
function errorMessage(code: string | undefined): string | undefined {
  if (!code) return undefined
  if (code === 'not_team_member') return m.auth_error_not_team()
  if (code === 'account_not_linked') return m.auth_error_not_linked()
  return m.auth_error_generic()
}

export function AuthDialog() {
  const search = useSearch({ strict: false }) as Record<string, unknown>
  const prompt = parseAuthPromptSearch(search)
  const navigate = useNavigate()
  const router = useRouter()
  const settings = useWorkspaceSettings()
  const registered = RootRoute.useRouteContext({ select: (c) => c.registeredAuthProviders })

  const open = Boolean(prompt.mode)
  const [mode, setMode] = useState<Mode>(prompt.mode ?? 'login')
  const [step, setStep] = useState<Step>('form')
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | undefined>()
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')

  // every opening starts on the requested tab, at the first step
  useEffect(() => {
    if (!prompt.mode) return
    setMode(prompt.mode)
    setStep('form')
    setError(undefined)
    setCode('')
  }, [prompt.mode])

  const auth = settings?.publicAuthConfig
  const passwordOn = auth?.oauth?.password !== false
  const signupOpen = settings?.publicPortalConfig?.openSignup !== false
  const providers = usableProviders(auth?.oauth, registered)
  const shownError = error ?? errorMessage(prompt.error)

  // the destination: the callback, or this page without the auth params
  const here = typeof window === 'undefined' ? '/' : window.location.pathname
  const callbackUrl = prompt.callbackUrl ?? here

  const close = () => {
    setStep('form')
    setError(undefined)
    void navigate({
      to: '.',
      search: (prev: Record<string, unknown>) => {
        const { auth: _a, callbackUrl: _c, error: _e, ...rest } = prev
        return rest
      },
      replace: true,
    })
  }

  const done = async () => {
    await router.invalidate()
    setStep('form')
    navigateAfterAuth(callbackUrl, () => {
      void navigate({ to: callbackUrl as '/', replace: true })
    })
  }

  const run = async (key: string, action: () => Promise<void>) => {
    setError(undefined)
    setBusy(key)
    try {
      await action()
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : m.auth_error_generic())
    } finally {
      setBusy(null)
    }
  }

  const onPassword = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const mail = String(data.get('email') ?? '').trim()
    const password = String(data.get('password') ?? '')
    setEmail(mail)
    void run('password', async () => {
      if (mode === 'signup') {
        const name = String(data.get('name') ?? '').trim() || mail.split('@')[0]
        const result = await authClient.signUp.email({ name, email: mail, password })
        if (result.error) throw new Error(result.error.message || m.auth_error_generic())
      } else {
        const result = await authClient.signIn.email({ email: mail, password })
        if (result.error) throw new Error(result.error.message || m.auth_error_credentials())
        if ((result.data as { twoFactorRedirect?: boolean } | null)?.twoFactorRedirect) {
          setStep('two-factor')
          return
        }
      }
      await done()
    })
  }

  const onTwoFactor = (value: string) =>
    run('two-factor', async () => {
      const result = await authClient.twoFactor.verifyTotp({ code: value })
      if (result.error) {
        setCode('')
        throw new Error(m.auth_error_code())
      }
      await done()
    })

  const onForgot = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const mail = String(new FormData(e.currentTarget).get('email') ?? '').trim()
    setEmail(mail)
    void run('forgot', async () => {
      const result = await authClient.requestPasswordReset({
        email: mail,
        redirectTo: '/auth/reset-password',
      })
      if (result.error) throw new Error(result.error.message || m.auth_error_generic())
      setStep('reset-sent')
    })
  }

  const onProvider = (id: string) =>
    run(id, async () => {
      // a full-page redirect to the provider; it comes back to the callback (or the error landing)
      const result = await authClient.signIn.social({
        provider: id,
        callbackURL: callbackUrl,
        errorCallbackURL: signinErrorLanding(callbackUrl),
      })
      if (result.error) throw new Error(result.error.message || m.auth_error_generic())
    })

  const title =
    step === 'two-factor'
      ? m.auth_two_factor_title()
      : step === 'forgot' || step === 'reset-sent'
        ? m.auth_forgot_title()
        : mode === 'signup'
          ? m.auth_signup_title()
          : m.auth_signin_title()
  const description =
    step === 'two-factor'
      ? m.auth_two_factor_description()
      : step === 'forgot'
        ? m.auth_forgot_description()
        : step === 'reset-sent'
          ? undefined
          : mode === 'signup'
            ? m.auth_signup_description()
            : m.auth_signin_description()

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => !next && close()}
      title={title}
      description={description}
      size="sm"
    >
      <div className="flex flex-col gap-5">
        {shownError && <Alert variant="danger" title={shownError} />}

        {step === 'form' && (
          <>
            {signupOpen && (
              <Tabs
                value={mode}
                onValueChange={(value) => {
                  setMode(value as Mode)
                  setError(undefined)
                }}
                items={[
                  { value: 'login', label: m.auth_tab_signin(), content: null },
                  { value: 'signup', label: m.auth_tab_signup(), content: null },
                ]}
                classNames={{ list: 'w-full', tab: 'flex-1', panel: 'hidden' }}
              />
            )}

            {providers.length > 0 && (
              <div className="flex flex-col gap-2">
                {providers.map((p) => (
                  <Button
                    key={p.id}
                    variant="outline"
                    className="w-full"
                    disabled={busy !== null}
                    onClick={() => void onProvider(p.id)}
                  >
                    <BrandIcon provider={p.id} />
                    {m.auth_continue_with({ provider: p.name })}
                  </Button>
                ))}
              </div>
            )}

            {providers.length > 0 && passwordOn && (
              <div className="flex items-center gap-3 text-xs text-muted">
                <Separator className="flex-1" />
                {m.auth_or()}
                <Separator className="flex-1" />
              </div>
            )}

            {passwordOn && (
              <form className="flex flex-col gap-4" onSubmit={onPassword}>
                {mode === 'signup' && (
                  <Field label={m.auth_name()}>
                    <Input name="name" autoComplete="name" />
                  </Field>
                )}
                <Field label={m.auth_email()}>
                  <Input
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    defaultValue={email}
                  />
                </Field>
                <Field
                  label={m.auth_password()}
                  description={mode === 'signup' ? m.auth_password_hint() : undefined}
                >
                  <Input
                    name="password"
                    type="password"
                    required
                    minLength={mode === 'signup' ? 8 : undefined}
                    autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  />
                </Field>
                <div className="flex flex-col gap-2">
                  <Button type="submit" className="w-full" disabled={busy !== null}>
                    {mode === 'signup' ? m.auth_submit_signup() : m.auth_submit_signin()}
                  </Button>
                  {mode === 'login' && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="self-center text-muted"
                      onClick={() => {
                        setError(undefined)
                        setStep('forgot')
                      }}
                    >
                      {m.auth_forgot_link()}
                    </Button>
                  )}
                </div>
              </form>
            )}

            {!passwordOn && providers.length === 0 && <Alert title={m.auth_no_methods()} />}
          </>
        )}

        {step === 'forgot' && (
          <form className="flex flex-col gap-4" onSubmit={onForgot}>
            <Field label={m.auth_email()}>
              <Input name="email" type="email" autoComplete="email" required defaultValue={email} />
            </Field>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setStep('form')}
              >
                {m.auth_back()}
              </Button>
              <Button type="submit" className="flex-1" disabled={busy !== null}>
                {m.auth_forgot_submit()}
              </Button>
            </div>
          </form>
        )}

        {step === 'reset-sent' && (
          <div className="flex flex-col gap-4">
            <Alert variant="success" title={m.auth_reset_sent({ email })} />
            <Button variant="outline" onClick={() => setStep('form')}>
              {m.auth_back()}
            </Button>
          </div>
        )}

        {step === 'two-factor' && (
          <div className="flex flex-col items-center gap-4">
            <InputOTP
              length={6}
              groups={[3, 3]}
              value={code}
              onValueChange={setCode}
              onValueComplete={(value) => void onTwoFactor(value)}
              aria-label={m.auth_two_factor_title()}
              autoFocus
            />
            <Button
              variant="ghost"
              size="sm"
              className="text-muted"
              onClick={() => setStep('form')}
            >
              {m.auth_back()}
            </Button>
          </div>
        )}
      </div>
    </Dialog>
  )
}

/**
 * For `<Link to="." search={openSignIn} />`: opens the sign-in dialog on the current page. The search
 * params of the current route aren't known statically here, hence the cast.
 */
export const openSignIn = ((prev: Record<string, unknown>) => ({
  ...prev,
  auth: 'signin',
})) as never
