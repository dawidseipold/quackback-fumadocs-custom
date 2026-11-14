/**
 * Server entry of crazy-hub: Quackback's own entry (`src/server.ts`: boot checks, warmup, response
 * finishing) wrapped in Paraglide's middleware, so every request renders in the visitor's language.
 */
import { createServerEntry } from '@tanstack/react-start/server-entry'
import upstream from '../server'
import { paraglideMiddleware } from './paraglide/server.js'

export default createServerEntry({
  fetch(request: Request) {
    return paraglideMiddleware(request, ({ request }) => upstream.fetch(request))
  },
})
