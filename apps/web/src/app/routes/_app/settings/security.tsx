import { Alert, Button, Card, Chip, Field, Input, InputOTP, toast } from '@crazy-staff/ui'
import { useQuery, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useState, type FormEvent } from 'react'
import QRCode from 'qrcode'
import type { UserId } from '@quackback/ids'
import { authClient } from '@/lib/client/auth-client'
import { settingsQueries } from '@/lib/client/queries/settings'
import { useWorkspaceSettings } from '@/lib/client/hooks/use-root-context'
import { AUTH_PROVIDERS } from '@/lib/shared/auth-providers'
import { Route as RootRoute } from '../../../root'
import { m } from '../../../paraglide/messages.js'
import { usableProviders } from '../../../components/auth/auth-dialog'
import { BrandIcon } from '../../../components/auth/brand-icons'

/** Password, linked sign-in methods and two-factor authentication (#4, part 2). */
export const Route = createFileRoute('/_app/settings/security')({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(settingsQueries.userProfile(context.user.id as UserId)),
  component: Security,
})

function Security() {
  const { user } = Route.useRouteContext()
  const { data: profile } = useSuspenseQuery(settingsQueries.userProfile(user.id as UserId))
  return (
    <div className="flex flex-col gap-6">
      {profile.hasPassword && !profile.ssoEnforced && <PasswordCard />}
      <LinkedAccounts />
      {profile.hasPassword && !profile.ssoEnforced && (
        <TwoFactorCard userId={user.id as UserId} enabled={profile.twoFactorEnabled} />
      )}
    </div>
  )
}

function PasswordCard() {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string>()
  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)
    const newPassword = String(data.get('new') ?? '')
    if (newPassword !== String(data.get('confirm') ?? '')) return setError(m.auth_reset_mismatch())
    setError(undefined)
    setBusy(true)
    const result = await authClient.changePassword({
      currentPassword: String(data.get('current') ?? ''),
      newPassword,
      revokeOtherSessions: true,
    })
    setBusy(false)
    if (result.error) return setError(result.error.message || m.auth_error_generic())
    form.reset()
    toast.success(m.settings_password_changed())
  }
  return (
    <Card title={m.settings_password()} description={m.settings_password_description()}>
      <form className="flex flex-col gap-4" onSubmit={onSubmit}>
        {error && <Alert variant="danger" title={error} />}
        <Field label={m.settings_current_password()}>
          <Input name="current" type="password" required autoComplete="current-password" />
        </Field>
        <Field label={m.auth_new_password()} description={m.auth_password_hint()}>
          <Input name="new" type="password" required minLength={8} autoComplete="new-password" />
        </Field>
        <Field label={m.auth_confirm_password()}>
          <Input
            name="confirm"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
          />
        </Field>
        <Button type="submit" className="self-start" disabled={busy}>
          {m.settings_password_submit()}
        </Button>
      </form>
    </Card>
  )
}

function LinkedAccounts() {
  const settings = useWorkspaceSettings()
  const registered = RootRoute.useRouteContext({ select: (c) => c.registeredAuthProviders })
  const providers = usableProviders(settings?.publicAuthConfig?.oauth, registered)
  const queryClient = useQueryClient()
  const { data: accounts } = useQuery({
    queryKey: ['auth', 'accounts'],
    queryFn: async () => (await authClient.listAccounts()).data ?? [],
  })
  const linked = new Set((accounts ?? []).map((a) => a.providerId))
  const canUnlink = (accounts?.length ?? 0) > 1

  return (
    <Card title={m.settings_linked()} description={m.settings_linked_description()}>
      <ul className="flex flex-col divide-y divide-border">
        {linked.has('credential') && (
          <li className="flex items-center gap-3 py-3 first:pt-0">
            <span className="flex-1 text-sm font-medium">{m.auth_password()}</span>
            <Chip size="sm" variant="neutral">
              {m.settings_linked_on()}
            </Chip>
          </li>
        )}
        {providers.map((p) => {
          const on = linked.has(p.id)
          return (
            <li key={p.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
              <BrandIcon provider={p.id} className="size-4" />
              <span className="flex-1 text-sm font-medium">{p.name}</span>
              {on ? (
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={!canUnlink}
                  title={canUnlink ? undefined : m.settings_linked_last()}
                  onClick={async () => {
                    const account = accounts?.find((a) => a.providerId === p.id)
                    if (!account) return
                    const result = await authClient.unlinkAccount({ accountId: account.accountId })
                    if (result.error) toast.error(result.error.message || m.auth_error_generic())
                    await queryClient.invalidateQueries({ queryKey: ['auth', 'accounts'] })
                  }}
                >
                  {m.settings_unlink()}
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    void authClient.linkSocial({
                      provider: p.id,
                      callbackURL: '/settings/security',
                    })
                  }
                >
                  {m.settings_link()}
                </Button>
              )}
            </li>
          )
        })}
        {providers.length === 0 && !linked.has('credential') && (
          <li className="py-3 text-sm text-muted">{m.settings_linked_none()}</li>
        )}
      </ul>
      {/* names of linked providers that are no longer offered (switched off) */}
      {(accounts ?? [])
        .filter(
          (a) => a.providerId !== 'credential' && !providers.some((p) => p.id === a.providerId)
        )
        .map((a) => (
          <p key={a.providerId} className="mt-3 text-sm text-muted">
            {AUTH_PROVIDERS.find((p) => p.id === a.providerId)?.name ?? a.providerId} ·{' '}
            {m.settings_linked_on()}
          </p>
        ))}
    </Card>
  )
}

type Enrol = { stage: 'idle' } | { stage: 'scan'; qr: string; secret: string; codes: string[] }

function TwoFactorCard({ userId, enabled }: { userId: UserId; enabled: boolean }) {
  const queryClient = useQueryClient()
  const [enrol, setEnrol] = useState<Enrol>({ stage: 'idle' })
  const [error, setError] = useState<string>()
  const [code, setCode] = useState('')
  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: settingsQueries.userProfile(userId).queryKey })

  const start = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const password = String(new FormData(e.currentTarget).get('password') ?? '')
    setError(undefined)
    if (enabled) {
      const result = await authClient.twoFactor.disable({ password })
      if (result.error) return setError(result.error.message || m.auth_error_credentials())
      toast.success(m.settings_2fa_disabled())
      return refresh()
    }
    const result = await authClient.twoFactor.enable({ password })
    const data = result.data
    if (result.error || !data || data.method !== 'totp')
      return setError(result.error?.message || m.auth_error_credentials())
    setEnrol({
      stage: 'scan',
      qr: await QRCode.toDataURL(data.totpURI, { margin: 1, width: 192 }),
      secret: new URL(data.totpURI).searchParams.get('secret') ?? '',
      codes: data.backupCodes,
    })
  }

  const verify = async (value: string) => {
    const result = await authClient.twoFactor.verifyTotp({ code: value })
    if (result.error) {
      setCode('')
      return setError(m.auth_error_code())
    }
    setEnrol({ stage: 'idle' })
    toast.success(m.settings_2fa_enabled())
    await refresh()
  }

  return (
    <Card
      title={m.settings_2fa()}
      description={enabled ? m.settings_2fa_on() : m.settings_2fa_description()}
    >
      <div className="flex flex-col gap-4">
        {error && <Alert variant="danger" title={error} />}
        {enrol.stage === 'scan' ? (
          <>
            <div className="flex flex-wrap items-start gap-6">
              <img src={enrol.qr} alt="" className="size-48 rounded-control bg-white p-2" />
              <div className="flex min-w-60 flex-1 flex-col gap-3 text-sm">
                <p>{m.settings_2fa_scan()}</p>
                <code className="rounded-control-sm bg-surface-2 px-2 py-1 font-mono text-xs break-all">
                  {enrol.secret}
                </code>
                <p className="text-muted">{m.settings_2fa_codes()}</p>
                <ul className="grid grid-cols-2 gap-1 font-mono text-xs">
                  {enrol.codes.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </div>
            </div>
            <Field label={m.auth_two_factor_title()}>
              <InputOTP
                length={6}
                groups={[3, 3]}
                value={code}
                onValueChange={setCode}
                onValueComplete={(value) => void verify(value)}
                aria-label={m.auth_two_factor_title()}
              />
            </Field>
          </>
        ) : (
          <form className="flex flex-wrap items-end gap-3" onSubmit={start}>
            <Field label={m.settings_current_password()} className="min-w-60 flex-1">
              <Input name="password" type="password" required autoComplete="current-password" />
            </Field>
            <Button type="submit" variant={enabled ? 'outline' : 'solid'}>
              {enabled ? m.settings_2fa_disable() : m.settings_2fa_enable()}
            </Button>
          </form>
        )}
      </div>
    </Card>
  )
}
