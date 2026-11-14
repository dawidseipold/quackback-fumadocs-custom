/**
 * How crazy-hub is divided (decision 12, docs/decisions.md):
 *
 * - **Product** is the main division and part of the URL (`/trainer/docs`). Everything in a product's
 *   nav group (ideas, roadmap, changelog, docs, downloads) belongs to that product. What is common to
 *   the whole hub (the start page, later news, terms, contact) sits outside the product group.
 * - **Dimensions** are the lower divisions a product has (the trainer: game and renderer). The visitor
 *   picks them under the product picker; the choice is kept per product.
 * - Each **section** of a product says which dimensions its content varies by. The trainer's docs differ
 *   per game and renderer, its downloads per game only, and ideas, roadmap and changelog are shared by
 *   all games. A picker that doesn't apply to the open section is marked as shared there.
 *
 * Adding a product, a game, a story mod or a renderer is one entry here.
 */
import {
  BookOpen,
  Download,
  Lightbulb,
  Map as MapIcon,
  ScrollText,
  type LucideIcon,
} from 'lucide-react'
import { useSyncExternalStore } from 'react'
import { m } from '../paraglide/messages.js'
import { issues } from './issues'

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

export type Dimension = 'game' | 'renderer'
export type SectionId = 'ideas' | 'roadmap' | 'changelog' | 'docs' | 'downloads'

export interface Section {
  id: SectionId
  /** What its content differs by; the rest is shared across the product. */
  varies: Dimension[]
}

export interface Product extends Choice {
  /** The URL segment: `/trainer/…`. */
  slug: string
  /** The lower divisions, in picker order. */
  dimensions: Partial<Record<Dimension, Choice[]>>
  /** The product's pages, in nav order. */
  sections: Section[]
}

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

export const PRODUCTS: Product[] = [
  {
    id: 'gothic-trainer',
    slug: 'trainer',
    title: 'Crazy Gothic Trainer',
    short: 'GT',
    description: 'In-game trainer for Gothic',
    status: 'available',
    dimensions: { game: GAMES, renderer: RENDERERS },
    sections: [
      { id: 'ideas', varies: [] },
      { id: 'roadmap', varies: [] },
      { id: 'changelog', varies: [] },
      { id: 'docs', varies: ['game', 'renderer'] },
      { id: 'downloads', varies: ['game'] },
    ],
  },
]

/** How every section looks in the nav and on its page, whatever the product. */
export const SECTION_META: Record<
  SectionId,
  { label: () => string; description: () => string; icon: LucideIcon; issue: number }
> = {
  ideas: {
    label: m.nav_ideas,
    description: m.page_ideas_description,
    icon: Lightbulb,
    issue: issues.feedback,
  },
  roadmap: {
    label: m.nav_roadmap,
    description: m.page_roadmap_description,
    icon: MapIcon,
    issue: issues.roadmaps,
  },
  changelog: {
    label: m.nav_changelog,
    description: m.page_changelog_description,
    icon: ScrollText,
    issue: issues.changelog,
  },
  docs: {
    label: m.nav_docs,
    description: m.page_docs_description,
    icon: BookOpen,
    issue: issues.docs,
  },
  downloads: {
    label: m.nav_downloads,
    description: m.page_downloads_description,
    icon: Download,
    issue: issues.downloads,
  },
}

export const DIMENSION_LABEL: Record<Dimension, () => string> = {
  game: m.context_game,
  renderer: m.context_renderer,
}

export const productBySlug = (slug: string | undefined) => PRODUCTS.find((p) => p.slug === slug)

/** The section a path is in (`/trainer/docs/install` → trainer, docs). */
export function locate(pathname: string): { product?: Product; section?: SectionId } {
  const [slug, section] = pathname.split('/').filter(Boolean)
  const product = productBySlug(slug)
  return {
    product,
    section: product?.sections.find((s) => s.id === section)?.id,
  }
}

// ------------------------------------------------------------------ the picked game and renderer

export type Picks = Partial<Record<Dimension, string>>

const firstAvailable = (list: Choice[]) =>
  (list.find((c) => c.status === 'available') ?? list[0]).id

export function defaultPicks(product: Product): Picks {
  const picks: Picks = {}
  for (const [dimension, list] of Object.entries(product.dimensions) as [Dimension, Choice[]][]) {
    picks[dimension] = firstAvailable(list)
  }
  return picks
}

/** Keeps only known ids; anything else falls back to the product's default. */
export function parsePicks(product: Product, raw: string | null): Picks {
  let value: Picks = {}
  try {
    value = raw ? (JSON.parse(raw) as Picks) : {}
  } catch {
    value = {}
  }
  const picks = defaultPicks(product)
  for (const dimension of Object.keys(picks) as Dimension[]) {
    const id = value[dimension]
    if (product.dimensions[dimension]?.some((c) => c.id === id)) picks[dimension] = id
  }
  return picks
}

export const choiceOf = (list: Choice[], id: string | undefined) =>
  list.find((c) => c.id === id) ?? list[0]

// A tiny store over localStorage, one entry per product: the server renders the defaults, the browser
// the saved choice.
const cache = new Map<string, Picks>()
const listeners = new Set<() => void>()
const keyOf = (product: Product) => `crazy-hub:picks:${product.id}`

function read(product: Product): Picks {
  let picks = cache.get(product.id)
  if (!picks) {
    try {
      picks = parsePicks(product, localStorage.getItem(keyOf(product)))
    } catch {
      picks = defaultPicks(product)
    }
    cache.set(product.id, picks)
  }
  return picks
}

export function setPick(product: Product, dimension: Dimension, id: string) {
  const picks = { ...read(product), [dimension]: id }
  cache.set(product.id, picks)
  try {
    localStorage.setItem(keyOf(product), JSON.stringify(picks))
  } catch {
    // private mode: the choice lasts until the page closes
  }
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

const serverPicks = new Map<string, Picks>()
export function usePicks(product: Product): Picks {
  return useSyncExternalStore(
    subscribe,
    () => read(product),
    () => {
      if (!serverPicks.has(product.id)) serverPicks.set(product.id, defaultPicks(product))
      return serverPicks.get(product.id) as Picks
    }
  )
}
