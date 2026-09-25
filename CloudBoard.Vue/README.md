# CloudBoard.Vue - Developer Documentation

CloudBoard.Vue is the current CloudBoard frontend: a Vue 3 + TypeScript rewrite of `CloudBoard.Angular`, providing the same interactive flowchart canvas, node types, and Keycloak-backed authentication.

`CloudBoard.Angular` is kept in the repository for reference but is no longer wired into the Aspire AppHost (see `CloudBoard.AppHost/Program.cs`) — this app is the one that runs.

## Getting Started

For installation and setup instructions, see the [main CloudBoard documentation](../README.md#development-setup) in the repository root.

Run standalone with:

```bash
npm install
npm run dev
```

The dev server proxies `/api` to `CloudBoard.ApiService` using the same Aspire-injected `services__apiservice__*` environment variables that `CloudBoard.Angular`'s `proxy.conf.js` reads (see `vite.config.ts`) — when launched outside of Aspire, no proxy target is configured and API calls will simply fail until pointed at a running backend.

## Architecture Overview

### Core Technologies

- **Vue 3** (Composition API, `<script setup>`) with **Vite**
- **Pinia** for the small amount of genuinely shared state (auth session, toolbar zoom events)
- **Vue Router** for routing and the auth guard
- **PrimeVue** (Aura theme) — the Vue sibling of PrimeNG, same component set used by CloudBoard.Angular
- **Tailwind CSS** (v4, via `@tailwindcss/vite`) for utility styling
- **@vue-flow/core** (Vue Flow) — replaces `@foblex/flow` for the canvas. Vue Flow's Handle-based connection model is used in `connectionMode: 'loose'` to reproduce Angular's free-floating, multi-connector-per-side connection UX (see `composables/useConnectionDrag.ts` and `views/cloudboard/CloudboardNode.vue`) — **this is the area most worth a manual pass**, since the interaction couldn't be exercised against a live backend while porting it.

### Project Structure

```
src/
├── assets/          # Global CSS (Tailwind + PrimeIcons imports)
├── composables/      # useNodeProperty (per-node debounced property edits),
│                      # useConnectionDrag (the floating-connector interaction)
├── directives/       # v-blur-on-enter
├── models/           # Domain types (cloudboard.ts) and DTO<->domain mapping (mapper.ts)
├── router/           # Routes + auth guard
├── services/         # apiClient.ts (hand-written fetch client, mirrors the NSwag-generated
│                      # Angular client) plus one module per API area (cloudboardService,
│                      # nodeService, connectorService, connectionService), keycloakApi, token
├── stores/           # Pinia: auth (session/user), flowControl (toolbar zoom bus)
└── views/
    ├── cloudboard/    # CloudboardView (canvas page), Toolbar, PropertiesPanel,
    │                  # CloudboardOpen/Edit dialogs, CloudboardNode (generic node
    │                  # wrapper + connector bars), nodes/ (the 5 node types)
    └── *.vue          # Home, Login, AuthCallback, LogoutSuccess, Projects, Timeline
```

Unlike the Angular services (which held `BehaviorSubject`s the components subscribed to),
`cloudboardService`/`nodeService`/`connectorService`/`connectionService` are plain async
functions with no internal state — the original Angular services didn't actually hold
shared reactive state either (each component owned its own board/list), so there was
nothing for Pinia to usefully centralize there.

### Node Types

- **SimpleNote**, **CardNode**, **LinkCollection**, **ImageNode**, **CodeBlock**

To add a new node type:
1. Create the component in `src/views/cloudboard/nodes/`
2. Add the type to the `NodeType` enum in `src/models/cloudboard.ts`
3. Register it in `contentComponents` in `CloudboardNode.vue`
4. Add default properties/name in `src/services/nodeService.ts`

## API Client

`src/services/apiClient.ts` is hand-written (fetch + Promises) rather than generated,
since the repo's OpenAPI generator (`generator/`) is hard-coded to NSwag's Angular
template. If the API contract changes, update this file by hand to match, or extend
`generator/Program.cs` to also emit a `Fetch`-template client and port the shape across.

## Authentication

Same Keycloak Authorization Code flow as CloudBoard.Angular: `stores/auth.ts` owns
session state and wires itself into `apiClient.ts` via `setAuthHook` so API requests
carry a bearer token and retry once on a 401 (attempting a token refresh first).

## Testing

No test runner is set up yet — CloudBoard.Angular's Karma/Jasmine setup doesn't carry
over. If you add tests, Vitest is the natural fit for a Vite project.

## Deployment

```bash
npm run build   # type-checks (vue-tsc) then builds a static bundle to dist/
npm run preview # serve the production build locally
```

The Aspire AppHost publishes this app as a static website (`PublishAsStaticWebsite()` in
`CloudBoard.AppHost/Program.cs`), the same as CloudBoard.Angular was.
