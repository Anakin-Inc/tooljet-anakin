# Anakin plugin for ToolJet

A ToolJet **marketplace plugin** (`marketplace/plugins/anakin/` in
[ToolJet/ToolJet](https://github.com/ToolJet/ToolJet)) for the
[Anakin](https://anakin.io) web data API: scraping, site mapping and crawling,
AI search, agentic search, Wire site actions, website monitoring, AI
visibility, saved browser sessions and AI browser tasks.

29 operations, covering every tool in
[`anakin-mcp`](https://github.com/Anakin-Inc/anakin-mcp):

| Area | Operations |
|---|---|
| Web scraping | Extract Website Data, Get Scrape Result |
| Site mapping | Map a Site, Get Map Result |
| Site crawling | Crawl a Site, Get Crawl Result |
| AI search | Perform AI Search |
| Agentic search | Start Agentic Search, Get Agentic Search Result |
| Wire | Discover Wire Actions, Browse Wire Catalog, Run Wire Read Action, Run Wire Write Action, Get Wire Job Result, List Wire Identities, Sign In To Wire Site, Build A New Wire Action, Check Wire Build Status |
| Website monitoring | Create Website Monitor, List Website Monitors, Get Monitor Changes, Control Website Monitor |
| AI visibility | Start AI Visibility Search, Get AI Visibility Result, List AI Visibility Sources |
| Browser sessions | List Browser Sessions, Delete Browser Session |
| AI browser automation | Run Browser Task, Get Browser Task Result |

A ToolJet query is a single request, so each long-running endpoint is split into a
start operation that returns the job id and a "Get ... Result" operation the app
polls (query trigger on an interval, or a button). `anakin-mcp` instead blocks
until the job finishes.

Run Wire Read Action and Run Wire Write Action call the same endpoint
(`POST /wire/task`). They are separate operations so you can tell from the query
alone whether it changes something on the target site.

Query fields come from ToolJet's codehinter as strings or resolved `{{ }}`
values. `lib/index.ts` converts each one to the type the API expects (numbers,
booleans, JSON objects, string lists given as arrays, JSON or comma-separated
text) and rejects bad input with an error that names the field.

**Test connection** lists Wire build requests (`GET /v1/wire/build-requests?limit=1`),
which is authenticated and spends no credits.

Get a free API key at [anakin.io/dashboard](https://anakin.io/dashboard)
(500 credits, no card required).

## Layout

```
lib/index.ts           QueryService (got)
lib/types.ts           SourceOptions / QueryOptions
lib/manifest.json      connection form: API key (encrypted)
lib/operations.json    query form: 29 operations
lib/icon.svg
__tests__/index.js     scaffold stub (ToolJet runs no marketplace tests)
package.json           @tooljet-marketplace/anakin, built with ncc
tsconfig.json
```

The upstream PR also adds the `server/src/assets/marketplace/plugins.json`
registry entry, the `marketplace/package-lock.json` workspace link, and the docs
page `docs/docs/marketplace/plugins/anakin.md`. See [SUBMIT.md](SUBMIT.md).
