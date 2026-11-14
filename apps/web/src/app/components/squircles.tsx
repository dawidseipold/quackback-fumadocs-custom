import { registerSquircles } from '@crazy-staff/ui'
import { useEffect } from 'react'

/** Squircle corners in Firefox/Safari (polyfill); `?fallback` forces the polyfill in Chromium. */
export function Squircles() {
  useEffect(() => {
    registerSquircles({ force: new URLSearchParams(location.search).has('fallback') })
  }, [])
  return null
}
