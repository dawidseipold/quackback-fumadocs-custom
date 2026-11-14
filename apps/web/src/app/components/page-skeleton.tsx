import { Skeleton } from '@crazy-staff/ui'
import { m } from '../paraglide/messages.js'
import { PageFrame } from './page'

/** Shown in the page panel while the next page loads. */
export function PageSkeleton() {
  return (
    <PageFrame>
      <div className="flex w-full flex-col gap-4" aria-busy="true" aria-label={m.loading_page()}>
        <Skeleton className="block h-9 w-56" />
        <Skeleton className="block h-5 w-full max-w-lg" />
        <Skeleton className="mt-8 block h-44 w-full rounded-card" />
        <Skeleton className="mt-4 block h-6 w-40" />
        <Skeleton className="block h-4 w-full" />
        <Skeleton className="block h-4 w-11/12" />
        <Skeleton className="block h-4 w-4/5" />
      </div>
    </PageFrame>
  )
}
