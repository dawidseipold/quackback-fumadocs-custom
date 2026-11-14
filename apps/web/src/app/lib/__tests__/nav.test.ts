import { describe, expect, it } from 'vitest'
import { navItemOf, navPosition } from '../nav'

describe('navItemOf', () => {
  it('matches the start page only on /', () => {
    expect(navItemOf('/')).toBe('/')
    expect(navItemOf('/trainer/roadmap')).toBe('/trainer/roadmap')
  })

  it('keeps a nested page under its section', () => {
    expect(navItemOf('/trainer/docs/getting-started/install')).toBe('/trainer/docs')
  })

  it('does not match a path that only shares a prefix', () => {
    expect(navItemOf('/trainer/docsearch')).toBeUndefined()
    expect(navItemOf('/admin')).toBeUndefined()
  })
})

describe('navPosition', () => {
  it('follows the order of the sidebar', () => {
    expect(navPosition('/')).toBe(0)
    expect(navPosition('/trainer/ideas')).toBe(1)
    expect(navPosition('/trainer/downloads')).toBeGreaterThan(navPosition('/trainer/docs'))
  })

  it('puts pages outside the sidebar after it', () => {
    expect(navPosition('/admin')).toBeGreaterThan(navPosition('/trainer/downloads'))
  })
})
