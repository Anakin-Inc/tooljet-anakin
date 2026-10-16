# ToolJet: how this ships

## Route

Third-party connectors go in ToolJet's **marketplace**, `marketplace/plugins/<id>/`
of `ToolJet/ToolJet` (see `marketplace/AGENTS.md` upstream). Built-in connectors
live in `plugins/packages/`; this plugin used to target that folder, which was
the wrong route. A PR to `ToolJet/ToolJet` (`main`) adds:

- `marketplace/plugins/anakin/` (this repo's contents)
- an `anakin` entry in `server/src/assets/marketplace/plugins.json`
  (`id` = directory name = manifest `source.kind`)
- `marketplace/package-lock.json` (workspace link from `npm i`)
- `docs/docs/marketplace/plugins/anakin.md`, plus entries in
  `docs/docs/marketplace/marketplace_overview.md` and `docs/sidebars.js`

Once merged and released, ToolJet uploads marketplace builds to its marketplace
host, and the plugin appears under **Settings > Marketplace** on **self-hosted**
ToolJet. Marketplace pages are hidden on ToolJet Cloud
(`frontend/src/Routes/MarketplaceRoute.jsx`), so Cloud users can't install
marketplace plugins.

## Verified (2026-10-16, against ToolJet main)

From `marketplace/` in a ToolJet checkout with this plugin copied in:

| Check | Result |
|---|---|
| `npm run build --workspace=@tooljet-marketplace/anakin` (ncc) | pass, exit 0 |
| `npx tsc --noEmit -p plugins/anakin/tsconfig.json` | pass, exit 0 |
| `npm run validate:plugin -- anakin` | `PASS anakin` |
| `npm run validate:plugin -- --all` | 48 checked, 0 failed |
| `ESLINT_USE_FLAT_CONFIG=false npx eslint 'plugins/anakin/lib/**/*.ts'` | clean, exit 0 |
| `any` in `lib/*.ts` | 0 |
| Built `dist/index.js` against a local fake api.anakin.io (31 cases: request paths, bodies, coercion, required fields, error text, testConnection) | 31/31 |
| Built `dist/index.js` `testConnection` against the live API with an invalid key | `{"status":"failed","message":"HTTP 401: UNAUTHORIZED: Invalid API key."}` |

Not verified: a happy-path call with a real API key, and the UI check in a running
ToolJet instance (needs a full ToolJet server and Postgres).

## Upstream process notes

- CONTRIBUTING asks feature contributors to open an issue first and wait for a
  maintainer. Recent third-party marketplace PRs (Firecrawl #17530, Directus
  #18412, Grok #18312) went straight to a PR, and most are still open. Merged
  marketplace plugins (OpenRouter #18005, TypeSafe #18006) came from ToolJet staff.
- The CLA assistant asks every committer to sign on the PR.
- `plugins.json` gets a conflict whenever another plugin lands. Rebase and re-append
  the entry; don't hand-merge.
