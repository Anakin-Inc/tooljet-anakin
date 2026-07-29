# Anakin plugin for ToolJet

Web scraping, site mapping/crawling, AI search, agentic research, Wire
automation (hundreds of pre-built site actions), website change monitoring,
AI-answer-engine visibility, saved browser sessions, and AI browser
automation — as a ToolJet datasource.

28 operations, covering all 21 capabilities of Anakin's API (full parity with
`anakin-mcp`'s tool set):

| Area | Operations |
|---|---|
| Web scraping | Extract Website Data, Get Scrape Result |
| Site mapping | Map a Site, Get Map Result |
| Site crawling | Crawl a Site, Get Crawl Result |
| AI search | Perform AI Search |
| Agentic search | Start Agentic Search, Get Agentic Search Result |
| Wire (automation catalog) | Discover Wire Actions, Browse Wire Catalog, Run Wire Read Action, Run Wire Write Action, Get Wire Job Result, List Wire Identities, Sign In To Wire Site, Build A New Wire Action |
| Website monitoring | Create Website Monitor, List Website Monitors, Get Monitor Changes, Control Website Monitor |
| AI visibility | Start AI Visibility Search, Get AI Visibility Result, List AI Visibility Sources |
| Browser sessions | List Browser Sessions, Delete Browser Session |
| AI browser automation | Run Browser Task, Get Browser Task Result |

Every asynchronous endpoint (map, crawl, Wire task execution, AI visibility
search, browser task) follows the same submit-then-poll shape as the
original Extract Website Data / Get Scrape Result pair: one operation
submits the job and returns its id, a paired "Get ... Result" operation
polls it. ToolJet queries execute synchronously per call, so polling to
completion the way `anakin-mcp`'s tools do (blocking for up to several
minutes) isn't appropriate here — the ToolJet convention is to let the app
builder poll on an interval or button click instead.

Wire's read and write actions are exposed as two separate operations (same
REST endpoint, `POST /wire/task`) to mirror the read/write safety split
`anakin-mcp` uses; Run Wire Write Action's description flags that
payment/checkout actions are refused server-side, matching the Anakin API's
own Connectors Directory policy.

Get a free API key at [anakin.io/dashboard](https://anakin.io/dashboard) —
500 credits, no card required.
