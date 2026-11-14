/**
 * The route tree of crazy-hub.
 *
 * Our UI lives in `src/app/routes` (file routes). Quackback's own `src/routes` stays in the repo untouched
 * (so upstream merges stay clean), but only its server routes are mounted here: the REST/auth/webhook
 * API under `/api`, the OAuth and discovery endpoints, feeds, robots and the sitemap. None of them render
 * UI. Quackback's page routes and `src/components` are therefore out of the build; their screens are
 * rebuilt on crazy-ui one PARITY.md row at a time.
 *
 * When an upstream merge adds a new server route outside `src/routes/api`, add it to `upstreamServer`.
 * Left out on purpose: the status page feed (`status/feed.ts`, PARITY.md: status page skipped) and the
 * help center's sitemap (`hc/`, decision 4). Add them back with their UI.
 */
import { physical, rootRoute, route } from '@tanstack/virtual-file-routes'

/** Paths are relative to `src/app` (the routes directory of the generator). */
const upstream = (file: string) => `../routes/${file}`

const upstreamServer = [
  physical('/api', upstream('api')),
  route(
    '/.well-known/oauth-authorization-server',
    upstream('[.]well-known.oauth-authorization-server.ts')
  ),
  route(
    '/.well-known/oauth-authorization-server/api/auth',
    upstream('[.]well-known.oauth-authorization-server.api.auth.ts')
  ),
  route(
    '/.well-known/oauth-protected-resource',
    upstream('[.]well-known.oauth-protected-resource.ts')
  ),
  route(
    '/.well-known/oauth-protected-resource/api/mcp',
    upstream('[.]well-known.oauth-protected-resource.api.mcp.ts')
  ),
  route('/.well-known/openid-configuration', upstream('[.]well-known.openid-configuration.ts')),
  route(
    '/.well-known/openid-configuration/api/auth',
    upstream('[.]well-known.openid-configuration.api.auth.ts')
  ),
  route('/robots.txt', upstream('robots[.]txt.ts')),
  route('/sitemap.xml', upstream('sitemap[.]xml.ts')),
  route('/changelog/feed', upstream('changelog/feed.ts')),
  route('/changelog/rss', upstream('changelog/rss.ts')),
  route('/changelog/rss.xml', upstream('changelog/rss[.]xml.ts')),
  route('/oauth/$integration/connect', upstream('oauth/$integration/connect.ts')),
  route('/oauth/$integration/callback', upstream('oauth/$integration/callback.ts')),
  route('/oauth/connector/callback', upstream('oauth/connector.callback.ts')),
  route('/e2e/widget', upstream('e2e.widget.ts')),
]

export const routes = rootRoute('root.tsx', [physical('', 'routes'), ...upstreamServer])
