import { Avatar, Card, Chip, Empty } from '@crazy-staff/ui'
import { createFileRoute, notFound } from '@tanstack/react-router'
import { UserRound } from 'lucide-react'
import { getPublicUserProfileFn } from '@/lib/server/functions/public-profile'
import { getLocale } from '../../paraglide/runtime.js'
import { m } from '../../paraglide/messages.js'
import { Page } from '../../components/page'

/** A person's public profile: name, avatar, team badge, counts and recent ideas (#4, part 2). */
export const Route = createFileRoute('/_app/u/$principalId')({
  loader: async ({ params }) => {
    const profile = await getPublicUserProfileFn({
      data: { principalId: params.principalId },
    }).catch(() => null)
    if (!profile) throw notFound()
    return profile
  },
  head: ({ loaderData }) => ({ meta: [{ title: `${loaderData?.displayName ?? ''} · crazy-hub` }] }),
  component: PublicProfile,
})

function PublicProfile() {
  const p = Route.useLoaderData()
  const joined = new Date(p.joinedAt).toLocaleDateString(getLocale(), {
    year: 'numeric',
    month: 'long',
  })
  return (
    <Page
      title={
        <span className="inline-flex items-center gap-4">
          <Avatar size="lg" src={p.avatarUrl ?? undefined} name={p.displayName} />
          {p.displayName}
        </span>
      }
      actions={p.isTeamMember ? <Chip>{m.profile_team()}</Chip> : undefined}
      description={m.profile_joined({ date: joined })}
    >
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          [m.profile_posts(), p.postCount],
          [m.profile_comments(), p.commentCount],
          [m.profile_votes(), p.voteCount],
        ].map(([label, count]) => (
          <Card key={label as string} className="p-4">
            <div className="text-2xl font-semibold tabular-nums">{count}</div>
            <div className="text-sm text-muted">{label}</div>
          </Card>
        ))}
      </div>
      <Card title={m.profile_recent()}>
        {p.posts.length === 0 ? (
          <Empty icon={<UserRound />} title={m.profile_no_posts()} />
        ) : (
          <ul className="flex flex-col divide-y divide-border">
            {p.posts.map((post) => (
              <li
                key={post.postId}
                className="flex items-center gap-3 py-2.5 text-sm first:pt-0 last:pb-0"
              >
                <span className="min-w-0 flex-1 truncate">{post.title}</span>
                {post.statusName && (
                  <Chip size="sm" variant="neutral">
                    {post.statusName}
                  </Chip>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </Page>
  )
}
