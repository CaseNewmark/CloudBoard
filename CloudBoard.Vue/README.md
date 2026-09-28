# CloudBoard.Vue - Developer Documentation

CloudBoard.Vue is the CloudBoard frontend: a Vue 3 + TypeScript rewrite of the original Angular app, providing the same interactive flowchart canvas, node types, and Keycloak-backed authentication. The Angular frontend it replaced has since been removed from the repository.

## Getting Started

For installation and setup instructions, see the [main CloudBoard documentation](../README.md#development-setup) in the repository root.

Run standalone with:

```bash
npm install
npm run dev
```

The dev server proxies `/api` to `CloudBoard.ApiService` using the Aspire-injected `services__apiservice__*` environment variables (see `vite.config.ts`) — when launched outside of Aspire, no proxy target is configured and API calls will simply fail until pointed at a running backend.

## Architecture Overview

### Core Technologies

- **Vue 3** (Composition API, `<script setup>`) with **Vite**
- **Pinia** for the small amount of genuinely shared state (auth session, toolbar zoom events)
- **Vue Router** for routing and the auth guard
- **PrimeVue** (Aura theme) — the Vue sibling of PrimeNG, which the original Angular app used
- **Tailwind CSS** (v4, via `@tailwindcss/vite`) for utility styling
- **@vue-flow/core** (Vue Flow) — the Angular app used `@foblex/flow` for the canvas; Vue Flow's Handle-based connection model runs in `connectionMode: 'loose'` to reproduce that app's free-floating, multi-connector-per-side connection UX (see `composables/useConnectionDrag.ts` and `views/cloudboard/CloudboardNode.vue`)

### Project Structure

```
src/
├── assets/          # Global CSS (Tailwind + PrimeIcons imports)
├── composables/      # useNodeProperty (per-node debounced property edits),
│                      # useConnectionDrag (the floating-connector interaction)
├── directives/       # v-blur-on-enter
├── models/           # Domain types (cloudboard.ts) and DTO<->domain mapping (mapper.ts)
├── router/           # Routes + auth guard
├── services/         # apiClient.ts (hand-written fetch client) plus one module per API
│                      # area (cloudboardService, nodeService, connectorService,
│                      # connectionService), keycloakApi, token
├── stores/           # Pinia: auth (session/user), flowControl (toolbar zoom bus)
└── views/
    ├── cloudboard/    # CloudboardView (canvas page), Toolbar, PropertiesPanel,
    │                  # CloudboardOpen/Edit dialogs, CloudboardNode (generic node
    │                  # wrapper + connector bars), nodes/ (the 5 node types)
    └── *.vue          # Home, Login, AuthCallback, LogoutSuccess
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

Node components render inside PrimeVue's `Card`, which only renders named slots (`#title`, `#content`, ...);
content in the default slot is silently dropped.

### Editing and Undo

- Double-click a note's text or a card's title, subtitle or body to edit it in place (`InlineEditableText.vue`); double-click elsewhere on a node opens the properties panel.
- **Undo** `Ctrl/⌘+Z`, **redo** `Ctrl/⌘+Shift+Z` or `Ctrl+Y` (also in the toolbar). Shortcuts are ignored inside text fields, where the browser's own undo applies.
- **Copy/paste** `Ctrl/⌘+C` / `Ctrl/⌘+V` copies the selected nodes and the connections between them. The copy goes on the system clipboard as JSON (`utils/boardClipboard.ts`), so it also pastes into other boards and tabs; each repeated paste is offset 40px further. **Duplicate** with `Ctrl/⌘+D` or the node context menu.
- **Connections** point from the Out connector to the In connector (arrowhead at the target). Double-click a connection (or its label) to edit its label (`LabeledEdge.vue`).
- `composables/useBoardHistory.ts` records the current user's changes (add/delete/move/edit nodes, draw/delete connections) and replays undo/redo through the API, so other viewers see them live. It restores only the fields and property keys a change touched, so collaborators' edits to other fields survive. Elements recreated by undo get new IDs; the history maps old IDs to new ones.
- Node components and the properties panel report saves via `inject(boardHistoryInjectionKey)`; anything that saves a node should call `history.recordNodeSaved(node)`.

## API Client

`src/services/apiClient.ts` is hand-written (fetch + Promises) rather than generated. If
the API contract changes, update this file by hand to match the shapes in
`OpenApi/cloudboard-api.json`.

## Authentication

Keycloak Authorization Code flow: `stores/auth.ts` owns session state and wires itself
into `apiClient.ts` via `setAuthHook` so API requests carry a bearer token and retry once
on a 401 (attempting a token refresh first).

## Testing

No test runner is set up yet. Vitest is the natural fit for a Vite project.

## Deployment

```bash
npm run build   # type-checks (vue-tsc) then builds a static bundle to dist/
npm run preview # serve the production build locally
```

The Aspire AppHost publishes this app as a static website (`PublishAsStaticWebsite()` in
`CloudBoard.AppHost/Program.cs`).
