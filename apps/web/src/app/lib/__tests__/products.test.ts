import { describe, expect, it } from 'vitest'
import { PRODUCTS, defaultPicks, locate, parsePicks, productBySlug } from '../products'

const trainer = PRODUCTS[0]

describe('products', () => {
  it('finds a product and section from the path', () => {
    expect(locate('/trainer/docs/install')).toMatchObject({ product: trainer, section: 'docs' })
    expect(locate('/trainer')).toMatchObject({ product: trainer, section: undefined })
    expect(locate('/')).toEqual({ product: undefined, section: undefined })
    expect(productBySlug('nope')).toBeUndefined()
  })

  it('declares what each trainer section varies by', () => {
    const varies = Object.fromEntries(trainer.sections.map((s) => [s.id, s.varies]))
    expect(varies).toEqual({
      ideas: [],
      roadmap: [],
      changelog: [],
      docs: ['game', 'renderer'],
      downloads: ['game'],
    })
  })
})

describe('picks', () => {
  it('defaults to the first available choice of each dimension', () => {
    expect(defaultPicks(trainer)).toEqual({ game: 'gothic-1', renderer: 'gd3d11' })
  })

  it('keeps known ids and drops unknown or broken values', () => {
    expect(parsePicks(trainer, '{"game":"gothic-2","renderer":"nope"}')).toEqual({
      game: 'gothic-2',
      renderer: 'gd3d11',
    })
    expect(parsePicks(trainer, 'not json')).toEqual(defaultPicks(trainer))
  })
})
