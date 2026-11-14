import { describe, expect, it } from 'vitest'
import { nav, navItemOf, navPosition } from '../nav'

describe('navItemOf', () => {
  it('matches the start page only on /', () => {
    expect(navItemOf('/')).toBe('/')
    expect(navItemOf('/roadmap')).toBe('/roadmap')
  })

  it('keeps a nested page under its section', () => {
    expect(navItemOf('/docs/getting-started/install')).toBe('/docs')
    expect(navItemOf('/changelog/abc')).toBe('/changelog')
  })

  it('does not match a path that only shares a prefix', () => {
    expect(navItemOf('/docsearch')).toBeUndefined()
    expect(navItemOf('/admin')).toBeUndefined()
  })
})

describe('navPosition', () => {
  it('follows the order of the sidebar', () => {
    const order = nav.flatMap((g) => g.items.map((i) => i.to))
    order.forEach((to, i) => expect(navPosition(to)).toBe(i))
  })

  it('puts pages outside the sidebar after it', () => {
    expect(navPosition('/admin')).toBe(nav.flatMap((g) => g.items).length)
  })
})
