import { Button, Empty } from '@crazy-staff/ui'
import type { ErrorComponentProps } from '@tanstack/react-router'
import { Link } from '@tanstack/react-router'
import { CircleAlert, Compass } from 'lucide-react'
import { m } from '../paraglide/messages.js'

export function ErrorPage({ error, reset }: Pick<ErrorComponentProps, 'error' | 'reset'>) {
  return (
    <div className="flex min-h-[60svh] items-center justify-center p-6">
      <Empty
        icon={<CircleAlert />}
        title={m.error_title()}
        description={
          import.meta.env.DEV && error instanceof Error ? error.message : m.error_description()
        }
        action={
          <Button size="sm" onClick={() => reset()}>
            {m.error_retry()}
          </Button>
        }
      />
    </div>
  )
}

export function NotFoundPage() {
  return (
    <div className="flex min-h-[60svh] items-center justify-center p-6">
      <Empty
        icon={<Compass />}
        title={m.not_found_title()}
        description={m.not_found_description()}
        action={
          <Button size="sm" variant="outline" nativeButton={false} render={<Link to="/" />}>
            {m.not_found_home()}
          </Button>
        }
      />
    </div>
  )
}
