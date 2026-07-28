# ToolJet — submission instructions

Real, PR-buildable marketplace confirmed:
`docs.tooljet.com/docs/contributing-guide/marketplace/creating-a-plugin`,
normally scaffolded via `tooljet-cli plugin create <name> --type api`. This
directory matches that generated shape by hand, cross-checked against a
real, current plugin in the repo (`plugins/packages/sendgrid`, pulled live
via `gh api` — manifest.json, operations.json, and index.ts structure all
mirror it) and `plugins/packages/common`'s real interfaces
(`QueryService`, `QueryError`, `QueryResult`).

## What's here

```
lib/manifest.json      datasource definition — API key auth field
lib/operations.json     5 operations' input fields
lib/types.ts            SourceOptions / QueryOptions
lib/index.ts             QueryService implementation (got-based HTTP calls)
lib/icon.svg
package.json, tsconfig.json
```

## Verified, not assumed

`@tooljet-plugins/common` isn't published to npm (`file:../common` inside
their monorepo — confirmed via `npm view`, 404) — a full `npm install` +
`tsc` the way Activepieces got wasn't possible against the real package.
Instead: fetched `plugins/packages/common/lib/{query.error,query_result.type,
query_service.interface}.ts` directly via `gh api`, wrote a local stub
matching those exact interfaces, and ran `tsc` against `index.ts` +
`types.ts` with that stub — **clean, exit 0**. That verifies the code is
internally type-consistent with the real interfaces as of today; it does
not verify against the monorepo's actual build tooling (Nx, the plugin
CLI's scaffolding conventions), which needs a real ToolJet dev checkout.

## Steps (needs the account owner)

1. Clone `ToolJet/ToolJet`, copy this directory to
   `plugins/packages/anakin/`.
2. Run the real build from repo root (`npm run build` scoped to the
   plugin, per their contributing guide) to catch anything the stub-based
   check above couldn't (Nx workspace resolution, the actual `got` version
   pinned in their root `package.json`, etc).
3. Test in a running ToolJet instance.
4. Open a PR per `docs.tooljet.com/docs/contributing-guide/marketplace/creating-a-plugin`.

## Not done

Typechecks against a faithful stub of the real interfaces, but never built
or run inside the actual ToolJet monorepo/instance.
