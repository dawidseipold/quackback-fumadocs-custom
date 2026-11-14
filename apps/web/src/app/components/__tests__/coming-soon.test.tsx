// @vitest-environment happy-dom
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '@testing-library/react'
import { Map } from 'lucide-react'
import { ComingSoon } from '../coming-soon'

afterEach(cleanup)

describe('ComingSoon', () => {
  it('points at the issue that builds the screen', () => {
    render(<ComingSoon icon={Map} issue={7} />)
    expect(screen.getByText('Coming soon')).toBeTruthy()
    expect(screen.getByText(/#7/)).toBeTruthy()
  })
})
