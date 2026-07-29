# ToolJet — submission instructions

Real, PR-buildable marketplace confirmed:
`docs.tooljet.com/docs/contributing-guide/marketplace/creating-a-plugin`,
normally scaffolded via `tooljet-cli plugin create <name> --type api`. This
directory matches that generated shape by hand, cross-checked against real,
current plugins in the repo (`plugins/packages/sendgrid`, `zendesk`,
`twilio`, `appwrite`, pulled live via `gh api`/raw.githubusercontent.com —
manifest.json, operations.json, and index.ts structure, plus the `dropdown`
sub-field type used for enum params like Wire's `visibility` and monitor's
`scope`/`watchMode`/`action`) and `plugins/packages/common`'s real
interfaces (`QueryService`, `QueryError`, `QueryResult`,
`ConnectionTestResult`).

## What's here

```
lib/manifest.json      datasource definition — API key auth field
lib/operations.json    28 operations' input fields
lib/types.ts            SourceOptions / QueryOptions
lib/index.ts             QueryService implementation (got-based HTTP calls)
lib/icon.svg
package.json, tsconfig.json
```

28 operations across scraping, mapping, crawling, AI search, agentic
search, Wire automation, website monitoring, AI visibility, browser
sessions, and AI browser automation — full parity with `anakin-mcp`'s 21
tools (3 were already covered; this pass added operations for the
remaining 18, several split into submit/get-result pairs to fit ToolJet's
synchronous per-query execution model — see README.md for the full table
and the reasoning).

## Verified, not assumed

`@tooljet-plugins/common` isn't published to npm (`file:../common` inside
their monorepo — confirmed via `npm view`, 404). Rather than write a
hand-rolled stub of its interfaces, this pass fetched the actual package
source live from `ToolJet/ToolJet@main` (`plugins/packages/common/lib/*.ts`,
all 11 files — `query.error.ts`, `query_result.type.ts`,
`connection_test_result.type.ts`, `query_service.interface.ts`, `oauth.ts`,
`utils.helper.ts`, `ssrf-protection.ts`, `queryBuilder.ts`, `app.type.ts`,
`user.type.ts`, `index.ts`) and the *actual* compiler settings this plugin
builds under: `plugins/tsconfig.json` (`strict: false`, `target: es2015`,
`module: commonjs`, `moduleResolution: node`, `skipLibCheck: true`,
`composite: true`) — the exact file this package's own `tsconfig.json`
extends via `"../../tsconfig.json"` once placed at
`plugins/packages/anakin/`. Installed the real package as a `file:` dependency
(matching this plugin's own `package.json` shape) and ran both
`tsc --noEmit` and a full `tsc -b` emit against `lib/index.ts` + `lib/types.ts`
— **clean, exit 0**, dist output produced. This is a materially stronger
check than typechecking against a hand-written stub: it caught one real bug
in the original 5-operation code — `testConnection` declared
`Promise<object>` where the real `QueryService` interface requires
`Promise<ConnectionTestResult>` (`{status: 'ok'|'failed', ...}`) — now fixed.

Ground truth for the 18 newly-added operations' request/response shapes
came directly from `anakin-mcp/src/client.ts` and `anakin-mcp/src/tools/*.ts`
(the same REST API, already implemented and tested there).

This verifies the code is internally type-consistent with the real
interfaces and real compiler settings as of today; it does not verify
against the monorepo's actual Nx build orchestration or the plugin CLI's
scaffolding conventions, which needs a real ToolJet dev checkout.

## Steps (needs the account owner)

1. Clone `ToolJet/ToolJet`, copy this directory to
   `plugins/packages/anakin/`.
2. Run the real build from repo root (`npm run build` scoped to the
   plugin, per their contributing guide) to catch anything the check above
   couldn't (Nx workspace resolution, the actual `got` version pinned in
   their root `package.json`, etc).
3. Test in a running ToolJet instance — in particular the async
   submit/get-result operations (Map a Site, Crawl a Site, Run Wire
   Read/Write Action, Start AI Visibility Search, Run Browser Task) and
   Wire's write-path/build/login operations, which have side effects on
   the target site or Anakin account and are best exercised against a
   sandbox catalog action first.
4. Open a PR per `docs.tooljet.com/docs/contributing-guide/marketplace/creating-a-plugin`.

## Not done

Typechecks against the real `@tooljet-plugins/common` source and the real
plugin-tier compiler settings, but never built or run inside the actual
ToolJet monorepo/Nx workspace or a live ToolJet instance.
