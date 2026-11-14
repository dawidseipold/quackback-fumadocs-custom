/**
 * The product picker at the top of the sidebar: the product (the main division, part of the URL), then
 * the product's own lower divisions (the trainer: game, renderer). One card in the style of the docs'
 * search field; each row opens a menu with every choice, its description and status. The picked choice
 * has the soft accent fill of an active sidebar row. A division the open section doesn't depend on is
 * marked "shared" there (e.g. the game on the roadmap).
 */
import { Chip, DropdownMenu, cn } from '@crazy-staff/ui'
import { useLocation, useNavigate } from '@tanstack/react-router'
import { ChevronsUpDown } from 'lucide-react'
import type { ReactNode } from 'react'
import { m } from '../paraglide/messages.js'
import {
  DIMENSION_LABEL,
  PRODUCTS,
  choiceOf,
  locate,
  setPick,
  usePicks,
  type Availability,
  type Choice,
  type Dimension,
  type Product,
} from '../lib/products'

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

function Picker({
  label,
  hint,
  choices,
  selected,
  onPick,
}: {
  label: string
  /** Shown after the label, muted (e.g. "shared"). */
  hint?: string
  choices: Choice[]
  selected: Choice
  onPick: (id: string) => void
}) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        className={cn(
          'flex h-12 w-full items-center gap-2.5 ps-2 pe-2.5 text-start text-sm outline-none',
          'transition-colors duration-[var(--cui-duration-fast)] ease-ui hover:bg-hover data-popup-open:bg-hover',
          'focus-visible:bg-hover'
        )}
      >
        <Badge choice={selected} />
        <span className="flex min-w-0 flex-1 flex-col leading-tight">
          <span className="truncate text-[0.6875rem] text-muted">
            {label}
            {hint && <span className="opacity-70"> · {hint}</span>}
          </span>
          <span className="truncate font-medium">{selected.title}</span>
        </span>
        <ChevronsUpDown className="size-3.5 shrink-0 text-muted" />
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="start" className="w-[max(var(--anchor-width),17rem)]">
        <DropdownMenu.Group>
          <DropdownMenu.GroupLabel>{label}</DropdownMenu.GroupLabel>
          {choices.map((choice) => {
            const picked = choice.id === selected.id
            return (
              <DropdownMenu.Item
                key={choice.id}
                aria-current={picked || undefined}
                onClick={() => onPick(choice.id)}
                className={cn(
                  'items-start py-2',
                  picked && 'bg-accent-soft data-[highlighted]:bg-accent-soft'
                )}
              >
                <Badge choice={choice} />
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span
                    className={cn('truncate font-medium', picked && 'text-accent-soft-foreground')}
                  >
                    {choice.title}
                  </span>
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
              </DropdownMenu.Item>
            )
          })}
        </DropdownMenu.Group>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  )
}

export function ContextPickers({ product }: { product: Product }) {
  const navigate = useNavigate()
  const pathname = useLocation({ select: (l) => l.pathname })
  const { section } = locate(pathname)
  const varies = product.sections.find((s) => s.id === section)?.varies
  const picks = usePicks(product)

  const rows: ReactNode[] = [
    <Picker
      key="product"
      label={m.context_product()}
      choices={PRODUCTS}
      selected={product}
      onPick={(id) => {
        const next = PRODUCTS.find((p) => p.id === id)
        if (!next || next.id === product.id) return
        // stay on the same section when the next product has it
        const target = next.sections.find((s) => s.id === section) ?? next.sections[0]
        void navigate({
          to: '/$product/$section',
          params: { product: next.slug, section: target.id },
        })
      }}
    />,
  ]
  for (const [dimension, choices] of Object.entries(product.dimensions) as [
    Dimension,
    Choice[],
  ][]) {
    rows.push(
      <Picker
        key={dimension}
        label={DIMENSION_LABEL[dimension]()}
        hint={varies && !varies.includes(dimension) ? m.context_shared() : undefined}
        choices={choices}
        selected={choiceOf(choices, picks[dimension])}
        onPick={(id) => setPick(product, dimension, id)}
      />
    )
  }

  return (
    <div
      data-no-glide-area=""
      className="squircle flex flex-col divide-y divide-border overflow-hidden rounded-item border border-border bg-surface-2/50"
    >
      {rows}
    </div>
  )
}
