import { Avatar, Button, Card, Field, Input, toast } from '@crazy-staff/ui'
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useRef, useState, type FormEvent } from 'react'
import type { UserId } from '@quackback/ids'
import { settingsQueries } from '@/lib/client/queries/settings'
import { useDeleteAvatar, useUploadAvatar } from '@/lib/client/mutations/avatar'
import { updateProfileNameFn } from '@/lib/server/functions/user'
import { m } from '../../../paraglide/messages.js'

export const Route = createFileRoute('/_app/settings/profile')({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(settingsQueries.userProfile(context.user.id as UserId)),
  component: Profile,
})

function Profile() {
  const { user } = Route.useRouteContext()
  const userId = user.id as UserId
  const { data: profile } = useSuspenseQuery(settingsQueries.userProfile(userId))
  const upload = useUploadAvatar(userId)
  const remove = useDeleteAvatar(userId)
  const router = useRouter()
  const queryClient = useQueryClient()
  const file = useRef<HTMLInputElement>(null)
  const [saving, setSaving] = useState(false)

  const onName = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const name = String(new FormData(e.currentTarget).get('name') ?? '').trim()
    if (!name) return
    setSaving(true)
    try {
      await updateProfileNameFn({ data: { name } })
      await queryClient.invalidateQueries({
        queryKey: settingsQueries.userProfile(userId).queryKey,
      })
      await router.invalidate()
      toast.success(m.settings_saved())
    } catch {
      toast.error(m.auth_error_generic())
    } finally {
      setSaving(false)
    }
  }

  const name = user.name || user.email
  return (
    <div className="flex flex-col gap-6">
      <Card title={m.settings_avatar()} description={m.settings_avatar_description()}>
        <div className="flex flex-wrap items-center gap-4">
          <Avatar size="lg" src={profile.avatarUrl ?? undefined} name={name} />
          <input
            ref={file}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="hidden"
            onChange={(e) => {
              const picked = e.target.files?.[0]
              if (picked)
                upload.mutate(picked, {
                  onSuccess: () => void router.invalidate(),
                  onError: () => toast.error(m.auth_error_generic()),
                })
              e.target.value = ''
            }}
          />
          <Button
            variant="outline"
            size="sm"
            disabled={upload.isPending}
            onClick={() => file.current?.click()}
          >
            {m.settings_avatar_upload()}
          </Button>
          {profile.hasCustomAvatar && (
            <Button
              variant="ghost"
              size="sm"
              disabled={remove.isPending}
              onClick={() =>
                remove.mutate(undefined, { onSuccess: () => void router.invalidate() })
              }
            >
              {m.settings_avatar_remove()}
            </Button>
          )}
        </div>
      </Card>

      <Card title={m.settings_name()}>
        <form className="flex flex-col gap-4" onSubmit={onName}>
          <Field label={m.auth_name()}>
            <Input
              name="name"
              defaultValue={user.name ?? ''}
              required
              maxLength={100}
              autoComplete="name"
            />
          </Field>
          <Field label={m.auth_email()} description={m.settings_email_note()}>
            <Input value={user.email} readOnly disabled />
          </Field>
          <Button type="submit" className="self-start" disabled={saving}>
            {m.settings_save()}
          </Button>
        </form>
      </Card>
    </div>
  )
}
