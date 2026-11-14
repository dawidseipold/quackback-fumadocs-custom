import { describe, expect, it } from 'vitest'
import { DEFAULT_CONTEXT, parseContext, choiceOf } from '../context'

describe('parseContext', () => {
  it('falls back to the first available choice of each kind', () => {
    expect(parseContext(null)).toEqual(DEFAULT_CONTEXT)
    expect(DEFAULT_CONTEXT).toEqual({
      product: 'gothic-trainer',
      game: 'gothic-1',
      renderer: 'gd3d11',
    })
  })

  it('keeps known ids and drops unknown or broken values', () => {
    expect(parseContext('{"game":"gothic-2","renderer":"nope"}')).toEqual({
      ...DEFAULT_CONTEXT,
      game: 'gothic-2',
    })
    expect(parseContext('not json')).toEqual(DEFAULT_CONTEXT)
  })
})

describe('choiceOf', () => {
  it('returns the choice, or the first one for an unknown id', () => {
    expect(choiceOf('game', 'chronicles-of-myrtana').tags).toContain('Story mod')
    expect(choiceOf('renderer', 'nope').id).toBe('gd3d11')
  })
})
