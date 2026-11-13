# quackback-fumadocs-custom

[Quackback](https://github.com/QuackbackIO/quackback) (feedback, roadmap, changelog, support, status)
with its help center turned into **documentation built on [Fumadocs](https://fumadocs.dev)** (`@fumadocs/base-ui`, the layout of fumadocs.dev),
packaged as a Docker image that drops in for the official one.

```
ghcr.io/dawidseipold/quackback-fumadocs-custom:latest
```

## What changes

- **Docs instead of Help center**, everywhere in English: module toggle, settings card, admin panel, portal tab.
  Articles are still written in Quackback's admin (or through its API), so translations, drafts,
  permissions and the AI assistant keep working.
- **Docs pages on Fumadocs** inside the portal, under Quackback's own header and session:
  - sidebar built from the published categories (as sections, with their icons) and articles;
  - search dialog (`Ctrl+K` or the sidebar field): Orama index over `/api/docs-search`, results per page
    and section, filter by category;
  - page outline in Fumadocs' "clerk" style, previous / next links, last-updated date, article feedback;
  - docs home with category cards; category pages.
- **Article components**, written in plain markdown (fenced blocks with JSON):

  | Markdown | Component |
  |---|---|
  | `> **Note:**` / `**Tip:**` / `**Warning:**` / `**Danger:**` / `**Success:**` (optional `- Title`) | callout |
  | ` ```cards ` `[{"title","description","href","icon"}]` | link cards (icon = heroicon name) |
  | ` ```steps ` / ` ```tabs ` / ` ```accordion ` `[{"title","body"}]` (body is markdown) | steps, tabs, accordions |
  | ` ```files ` indented tree, folders end with `/` | file tree |
  | ` ```options ` `{"Name": {"type","default","description","status"}}` | interactive option table |
  | ` ```keys ` `[{"keys":"Ctrl+K","action":"…"}]` | key bindings |
  | ` ```media ` `screenshot: caption` / `video: url \| caption` | media or placeholder |
  | ` ```trainer ` | replica of a game-trainer menu card (example of a project-specific block) |
  | inline `` `key:F1` ``, `` `status:OK` `` | key cap, status badge |
  | any other code block | Shiki highlighting with a copy button |

- **One look for the whole app** (`custom-docs/theme.css`): Fumadocs' neutral palette with the purple of
  fumadocs.dev for the portal, the docs and the admin. Portal pages sit in a rounded panel on a darker
  frame with the header as its top bar; the docs fill the window with the portal links in their top bar.
- **API additions**: `position` on help-center articles (sidebar order), `categoryNames` on changelog
  entries, `GET/POST /api/v1/changelog/categories` (create or recolour categories by name).

## App shell

Every portal page uses the same Fumadocs frame as the docs (`custom-docs/app-shell.tsx`): sidebar with the
workspace, search and the portal sections, a panel with one top bar (sections, Admin, notifications,
account). A page can move its own panel into the sidebar with `<SidebarSlot fallback={...}>` (the
feedback filters and the settings menu do). Pages slide in from the side of the link that opened them
(`page-transition.tsx`, framer-motion). Team members get `/design-system` with every token and component.

## Behaviour changes

- Only signed-in users can post ideas and vote; ideas can be voted down (a downvote takes a point off the score).
- No "Powered by" badge; `/about` lists the technologies and links to the source.
- No launch plan in the admin.

## UI audit

`python3 tools/ui-audit.py [/page,/page]` (Playwright + Chrome, a running portal with the demo seed) signs in,
screenshots every page into `/tmp/audit` and lists controls whose corners fall outside the tokens, pill-shaped
buttons and page errors.

## How it is built

`transform.py` runs on a checkout of the Quackback release in `QUACKBACK_VERSION`:

1. copies `patch/` (new files: `apps/web/src/custom-docs/*`, the search API route) into it;
2. applies exact text edits to upstream files. **Every edit must match exactly once**; if Quackback
   changed that code, the build stops with a list of what no longer matches, instead of producing a
   half-patched app;
3. renames "Help center" to "Docs" in English UI strings.

`dependencies.txt` lists the extra packages (Fumadocs UI/Core, Shiki), added with `bun add` before the
image build. The Fumadocs theme is mapped onto Quackback's CSS variables (`custom-docs/fumadocs.css`), so
the portal's branding colours apply to the docs too.

## Updating Quackback

1. Put the new tag in `QUACKBACK_VERSION` and push.
2. If the workflow fails at "Turn the help center into our docs", update the listed edits in `transform.py`.

## Running

Use the image in place of `ghcr.io/quackbackio/quackback` in Quackback's `docker-compose.yml`.
Then, in the admin: turn on **Docs** in Settings → General and keep the **Docs** tab in Portal → Navigation.

Local build: clone Quackback at the pinned tag, `python3 transform.py <checkout>`,
`cd <checkout>/apps/web && bun add $(cat dependencies.txt) && bun run build`.

## License

Quackback is AGPL-3.0; this repository's changes are under the same license.
