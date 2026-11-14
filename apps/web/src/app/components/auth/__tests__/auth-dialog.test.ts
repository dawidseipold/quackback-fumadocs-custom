import { describe, expect, it } from 'vitest'
import { usableProviders } from '../auth-dialog'

describe('usableProviders', () => {
  it('shows a provider only when it is switched on and registered on the server', () => {
    const ids = (oauth: Record<string, boolean>, registered: string[]) =>
      usableProviders(oauth, registered).map((p) => p.id)
    expect(ids({ github: true, google: true, password: true }, ['github'])).toEqual(['github'])
    expect(ids({ github: false }, ['github'])).toEqual([])
    expect(ids({ discord: true }, [])).toEqual([])
  })

  it('never lists password or generic OIDC as a button', () => {
    expect(usableProviders({ password: true, 'custom-oidc': true }, ['custom-oidc'])).toEqual([])
  })
})
