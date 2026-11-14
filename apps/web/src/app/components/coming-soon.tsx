import { Empty } from '@crazy-staff/ui'
import type { LucideIcon } from 'lucide-react'
import { m } from '../paraglide/messages.js'

/** Placeholder for a screen that gets built in its own issue (see PARITY.md). */
export function ComingSoon({ icon: Icon, issue }: { icon: LucideIcon; issue: number }) {
  return (
    <Empty
      className="py-14"
      icon={<Icon />}
      title={m.coming_soon_title()}
      description={m.coming_soon_description({ issue: `#${issue}` })}
    />
  )
}
