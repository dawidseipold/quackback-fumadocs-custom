/**
 * What the visitor is looking at: one product of crazy-hub, one game, one renderer. The sidebar's
 * pickers set it; docs, downloads and later the ideas filters read it. One list per kind, so adding a
 * product, a game or a story mod is one entry here (from the old portal's `variants.ts`).
 */
import { useSyncExternalStore } from 'react'

export type Availability = 'available' | 'planned' | 'later'

export interface Choice {
  id: string
  title: string
  /** Two letters for the badge. */
  short: string
  description: string
  status: Availability
  /** Extra labels next to the title (e.g. "Story mod"). */
  tags?: string[]
}

export const PRODUCTS: Choice[] = [
  {
    id: 'gothic-trainer',
    title: 'Crazy Gothic Trainer',
    short: 'GT',
    description: 'In-game trainer for Gothic',
    status: 'available',
  },
]

export const GAMES: Choice[] = [
  {
    id: 'gothic-1',
    title: 'Gothic 1',
    short: 'G1',
    description: 'Steam · GothicMod 1.08k',
    status: 'available',
  },
  {
    id: 'gothic-2',
    title: 'Gothic 2',
    short: 'G2',
    description: 'Night of the Raven',
    status: 'planned',
  },
  {
    id: 'chronicles-of-myrtana',
    title: 'Chronicles of Myrtana',
    short: 'CM',
    description: 'Story mod for Gothic 2',
    status: 'later',
    tags: ['Story mod'],
  },
]

export const RENDERERS: Choice[] = [
  {
    id: 'gd3d11',
    title: 'GD3D11',
    short: 'DX',
    description: 'DirectX 11 renderer',
    status: 'available',
  },
  {
    id: 'original',
    title: 'Original',
    short: 'D7',
    description: "The game's own DirectX 7 renderer",
    status: 'planned',
  },
]

export const CHOICES = { product: PRODUCTS, game: GAMES, renderer: RENDERERS } as const
export type ContextKind = keyof typeof CHOICES
export type HubContext = Record<ContextKind, string>

const first = (list: Choice[]) => (list.find((c) => c.status === 'available') ?? list[0]).id

export const DEFAULT_CONTEXT: HubContext = {
  product: first(PRODUCTS),
  game: first(GAMES),
  renderer: first(RENDERERS),
}

const KEY = 'crazy-hub:context'

/** Keeps only known ids; anything else falls back to the default. */
export function parseContext(raw: string | null): HubContext {
  let value: Partial<HubContext> = {}
  try {
    value = raw ? (JSON.parse(raw) as Partial<HubContext>) : {}
  } catch {
    value = {}
  }
  const pick = (kind: ContextKind) =>
    CHOICES[kind].some((c) => c.id === value[kind])
      ? (value[kind] as string)
      : DEFAULT_CONTEXT[kind]
  return { product: pick('product'), game: pick('game'), renderer: pick('renderer') }
}

// A tiny store over localStorage: the server renders the defaults, the client the saved choice.
let current: HubContext | null = null
const listeners = new Set<() => void>()

function read(): HubContext {
  if (current) return current
  try {
    current = parseContext(localStorage.getItem(KEY))
  } catch {
    current = DEFAULT_CONTEXT
  }
  return current
}

export function setContext(kind: ContextKind, id: string) {
  current = { ...read(), [kind]: id }
  try {
    localStorage.setItem(KEY, JSON.stringify(current))
  } catch {
    // private mode: the choice lasts until the page closes
  }
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useHubContext(): HubContext {
  return useSyncExternalStore(subscribe, read, () => DEFAULT_CONTEXT)
}

export const choiceOf = (kind: ContextKind, id: string) =>
  CHOICES[kind].find((c) => c.id === id) ?? CHOICES[kind][0]
