/**
 * Bottom of the sidebar: which product, game and renderer the visitor is looking at (the old portal's
 * game/renderer pickers, extended with the product now that crazy-hub carries more than the trainer).
 * One card, one row per kind; each row opens a menu with every choice, its description and status.
 */
import { Chip, DropdownMenu, cn } from '@crazy-staff/ui'
import { ChevronsUpDown } from 'lucide-react'
import { m } from '../paraglide/messages.js'
import {
  CHOICES,
  choiceOf,
  setContext,
  useHubContext,
  type Availability,
  type Choice,
  type ContextKind,
} from '../lib/context'

const kindLabel: Record<ContextKind, () => string> = {
  product: m.context_product,
  game: m.context_game,
  renderer: m.context_renderer,
}

const statusLabel: Record<Exclude<Availability, 'available'>, () => string> = {
  planned: m.status_planned,
  later: m.status_later,
}

function Badge({ choice }: { choice: Choice }) {
  return (
    <span
      aria-hidden
      className={cn(
        'squircle flex size-7 shrink-0 items-center justify-center rounded-chip text-[0.6875rem] font-semibold',
        choice.status === 'available'
          ? 'bg-accent-soft text-accent-soft-foreground'
          : 'bg-surface-2 text-muted'
      )}
    >
      {choice.short}
    </span>
  )
}

function Picker({ kind }: { kind: ContextKind }) {
  const context = useHubContext()
  const selected = choiceOf(kind, context[kind])
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        className={cn(
          'flex h-12 w-full items-center gap-2.5 px-2.5 text-start text-sm outline-none',
          'transition-colors duration-[var(--cui-duration-fast)] ease-ui hover:bg-hover data-popup-open:bg-hover',
          'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset'
        )}
      >
        <Badge choice={selected} />
        <span className="flex min-w-0 flex-1 flex-col leading-tight">
          <span className="text-[0.6875rem] text-muted">{kindLabel[kind]()}</span>
          <span className="truncate font-medium">{selected.title}</span>
        </span>
        <ChevronsUpDown className="size-3.5 shrink-0 text-muted" />
      </DropdownMenu.Trigger>
      <DropdownMenu.Content side="top" align="start" className="w-[max(var(--anchor-width),17rem)]">
        <DropdownMenu.Group>
          <DropdownMenu.GroupLabel>{kindLabel[kind]()}</DropdownMenu.GroupLabel>
          <DropdownMenu.RadioGroup
            value={selected.id}
            onValueChange={(id) => setContext(kind, id as string)}
          >
            {CHOICES[kind].map((choice) => (
              <DropdownMenu.RadioItem
                key={choice.id}
                value={choice.id}
                className="items-start py-2"
              >
                <Badge choice={choice} />
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="truncate font-medium">{choice.title}</span>
                  <span className="truncate text-xs text-muted">{choice.description}</span>
                  {(choice.status !== 'available' || choice.tags?.length) && (
                    <span className="mt-1 flex flex-wrap gap-1">
                      {choice.status !== 'available' && (
                        <Chip size="sm" variant="neutral">
                          {statusLabel[choice.status]()}
                        </Chip>
                      )}
                      {choice.tags?.map((tag) => (
                        <Chip key={tag} size="sm" variant="outline">
                          {tag}
                        </Chip>
                      ))}
                    </span>
                  )}
                </span>
              </DropdownMenu.RadioItem>
            ))}
          </DropdownMenu.RadioGroup>
        </DropdownMenu.Group>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )
}

export function ContextPickers() {
  return (
    <div
      data-no-glide-area=""
      className="squircle flex flex-col divide-y divide-border overflow-hidden rounded-card border border-border bg-surface"
    >
      <Picker kind="product" />
      <Picker kind="game" />
      <Picker kind="renderer" />
    </div>
  )
}
