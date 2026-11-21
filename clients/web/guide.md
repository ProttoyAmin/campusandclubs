# Frontend Architecture Migration Guide

This guide moves `clients/web` toward [web.architecture.md](./web.architecture.md) in small, reviewable steps. Keep the current app running and keep shipping features while each area migrates. Do not restart or rename the entire frontend first.

## The short plan

1. Isolate the SSR QueryClient and API credentials per request.
2. Add a reusable feature query-options pattern.
3. Move one safe route's critical data into a route loader.
4. Wire TanStack dehydration/hydration so SSR data is reused by the browser.
5. Give that route one metadata contract for SSR and client navigation.
6. Standardize writes through feature mutation hooks and query-key invalidation.
7. Repeat for other features when you touch them.

The existing Express + Vite + React Router Data Mode setup can support loaders and SSR without a framework migration. React Router documents this custom-server setup directly. [React Router custom framework](https://reactrouter.com/start/data/custom)

## Stage 0: Leave existing features in place

Do this first:

- Keep `features/club`, `features/user`, and the other current feature folders.
- Keep `src/routes.tsx` as the route-tree composer and each feature `router.tsx` as the owner of its branch.
- Keep `settings/routes` path builders while components still depend on them.
- Keep existing `http`, `services`, and `hooks` modules. Add the new query/mutation modules beside them and migrate callers gradually.
- Do not convert all UI contexts or form code to another library as part of this migration.

For new code, follow the target structure in the architecture doc. Move or delete old modules only after references are migrated and the feature still builds.

## Stage 1: Fix QueryClient lifetime

This is the first code change to make because it protects SSR isolation and is independent from route loaders.

### Current files to change

- `src/config/query-client.ts`
- `src/app.client.tsx`
- `src/app.server.tsx`
- Any module that imports the exported `queryClient` singleton, especially hooks, layouts, and socket handlers.

### Steps

1. Keep `createQueryClient()` as the factory. Keep a browser-only `getClientQueryClient()` that creates one client lazily and returns the same client for the life of that app tab.
2. Remove the module-level `export const queryClient = createQueryClient()` once callers have migrated.
3. In `app.client.tsx`, use `getClientQueryClient()` and pass that exact client to `AppProviders` and the browser route runtime.
4. In each SSR render request, call `createQueryClient()` and pass that new client to the server route runtime and `AppProviders`. Do not import a query client created at module scope.
5. In React hooks/components, use `useQueryClient()` from `@tanstack/react-query` for cache updates. For socket events handled inside `MainLayout`, call `useQueryClient()` there rather than importing a singleton.
6. On logout or account switch, cancel/remove private queries or clear the browser cache. Keep a successful sign-in in the same browser cache only if the user identity is unchanged.

The intended lifetime is: one QueryClient for a single server request; one stable QueryClient for the current browser app session. TanStack's SSR guide calls out the per-request server client as the user-isolation boundary. [TanStack Query SSR](https://tanstack.com/query/latest/docs/framework/react/guides/ssr)

## Stage 2: Separate browser and server API clients

Do this before adding protected SSR loaders.

### Current risks

- `settings/api/v1/client.ts` is a singleton and reads `document.cookie` from an interceptor.
- `BaseClient` always points at `api.v1.client`.
- Feature service objects are created at module scope, so they reuse that same client.
- The server request currently drops the incoming cookie and headers.

### Steps

1. Keep the current v1 browser client for browser navigation, including `withCredentials` and CSRF behavior.
2. Add a server client factory that takes the current Web `Request` (or an explicit cookie/header subset) and does not access `window` or `document`.
3. Construct server feature adapters from that request-scoped client. Do not use the module-level browser `club`, `user`, or auth service singleton from SSR loaders.
4. Preserve the original public URL, cookie header, abort signal, and relevant headers when adapting Express's request to the Web `Request` used by React Router.
5. Keep each API version explicit. Add v2 only when an endpoint actually uses it; don't migrate all endpoints to an empty v2 placeholder.
6. Normalize version-specific wire responses at the feature API boundary so pages and query options use a stable feature model.

Do not enable protected page SSR until the server API client can forward the current visitor's credentials safely and the backend authorizes every endpoint.

## Stage 3: Migrate one feature to shared query options

Choose a low-risk page whose initial data is public or does not depend on the current user. A public club detail page is a candidate only after verifying that its SSR response does not reveal private membership or permission fields.

Add these beside the existing feature files:

```text
features/<feature>/
  api/
    <feature>.queries.ts
    <feature>.mutations.ts
  model/
    <feature>.keys.ts
    <feature>.types.ts
```

For each read, define one query-options factory containing its key and query function. Include all request variables in the key: resource ID, filters, pagination, tenant, and identity where relevant. Use the same options in the route loader and component.

```ts
// The route loader waits for critical page data.
await runtime.queryClient.ensureQueryData(
  clubQueries.detail(runtime.api.club, params.slug),
);

// The page observes that same cache entry.
const { data: club } = useSuspenseQuery(
  clubQueries.detail(browserApi.club, slug),
);
```

The page can now be reused in loaders and nested components without passing fetched records through several prop layers. Keep page forms and unsaved drafts in local React state or feature context; those are not server query data.

## Stage 4: Add route loaders before rendering the first page

Today, the feature route files mostly map paths to elements, and page hooks fetch after the component renders. Add loaders to the same Data Router route objects.

1. Evolve `src/routes.tsx` and feature route arrays to create a route tree from a small `RouteRuntime` dependency. The browser runtime contains the browser QueryClient/API client; each server request runtime contains a new QueryClient/server API client.
2. Add one loader to the selected route. It awaits critical query options and returns only route-specific values that are not already in TanStack Query (for example a redirect/status decision).
3. In the server request handler, run the matched route loaders through `createStaticHandler(...).query(request)` before creating the static router and rendering. Handle returned `Response` redirects and preserve `context.statusCode`.
4. In the browser, use the same route tree/runtime with `createBrowserRouter`. Client-side loaders run before the destination page renders; show `useNavigation()` pending UI for slow transitions.
5. Use the router's route `lazy` property for page/loader modules when splitting is useful. Keep the path and route ID known in the initial tree so the router can match the URL while loading route implementation. [React Router route loading](https://reactrouter.com/start/data/data-loading), [lazy routes](https://reactrouter.com/start/data/route-object)
6. Add an `errorElement` for the feature branch and translate expected API 404/403 errors into the right page state/status.

The goal is not to instantiate React page components manually. Define the route tree up front, let the router match it, load the route module and route-critical data, then render the page with its query cache ready.

## Stage 5: Connect query dehydration and hydration

There are two different hydration states: React Router route loader data and TanStack Query cache data. Both must be restored.

1. After server loaders finish, call `dehydrate(requestQueryClient)`.
2. Embed the dehydrated state in the HTML with a safe serializer. `config/dehydration.tsx` is a starting point; its current `<script type="application/json">` string helper is not connected to `server.ts` yet.
3. Keep React Router's static hydration data from `StaticRouterProvider` and pass it into `createBrowserRouter` on the client.
4. In `app.client.tsx`, extract and `hydrate(browserQueryClient, queryState)` **before** creating the browser router, because its initial loaders may read that cache.
5. Pass the same browser QueryClient to `AppProviders` and the route runtime.
6. Give SSR-prefetched queries a positive `staleTime` so the browser does not immediately fetch the same data again. Decide deliberately whether the query should revalidate in the background.
7. Only serialize successful, safe data. Do not serialize cookies, tokens, or server request objects.

The current `query-client.ts` already uses a positive default `staleTime`; keep that behavior unless a feature needs a different freshness window. TanStack documents the dehydrate/hydrate sequence and warns against a shared server QueryClient. [SSR guide](https://tanstack.com/query/latest/docs/framework/react/guides/ssr), [dehydrate](https://tanstack.com/query/latest/docs/framework/react/reference/functions/dehydrate), [hydrate](https://tanstack.com/query/latest/docs/framework/react/reference/functions/hydrate)

## Stage 6: Unify page metadata

1. Add a shared `PageMeta` type and put metadata on each route's `handle`.
2. Add one `RouteMetadata` component near the root layout. It reads `useMatches()`, selects the deepest matched route with metadata, and renders one title and description.
3. For dynamic pages, resolve metadata from route loader data (club/user name), not a second API request.
4. Use React 19 `<title>` and `<meta>` elements so the same component works during SSR and client navigation.
5. Replace the pathname switch in `src/meta/page.ts` and mount/replace `MetaUpdater` only after the route metadata source is ready. Do not maintain separate manual HTML metadata and effect-based client metadata.
6. Mark private account, chat, and settings routes `noindex`; keep public profiles and public club pages indexable only when their content is public.

React 19 hoists `<title>` and `<meta>` elements into the document head. React Router's `useMatches()` exposes loader data and route `handle`, which makes a route-owned metadata resolver possible. [React metadata](https://react.dev/reference/react-dom/components/title), [React Router `useMatches`](https://reactrouter.com/api/hooks/useMatches)

## Stage 7: Standardize API writes and action components

For each migrated feature:

1. Put the HTTP call in the feature API/service adapter.
2. Put `useMutation`, validation, pending/error behavior, and cache effects in a feature mutation hook.
3. Get the active cache with `useQueryClient()`. On success, update or invalidate the feature query-key family.
4. Let the page pass values to a presentational form; let an action component such as `SaveButton`, `FollowButton`, or `RoleSaveBar` call the mutation hook and display its state.
5. Use a React Router `action` or `fetcher` only when its navigation/progressive form semantics are useful. Pick one mutation owner for each user operation; do not submit the same edit to both a route action and a TanStack mutation. Router actions revalidate route loader data when they complete. [React Router actions](https://reactrouter.com/start/data/actions)

## Stage 8: Migrate one vertical slice at a time

Suggested order:

1. A public page with a small, safe data dependency.
2. Its nested feature layout and metadata.
3. One write flow on that same feature.
4. One protected page after server credentials and authorization are handled.
5. More complex feeds, chat, sockets, uploads, and account settings after the base request/hydration flow is stable.

For each migrated route, keep an explicit checklist:

- Does a direct document request match and load this route?
- Does critical route data finish before the page renders?
- Does the first browser render reuse SSR data without a duplicate request?
- Does client navigation use the same query key and API adapter?
- Are private cache entries isolated by request and removed on account changes?
- Do 404/403/500 responses render the intended page/status?
- Does page metadata match on initial SSR and subsequent navigation?
- Does a write update/invalidate the correct query family?

Once one slice is stable, use it as the working example for the next feature. Keep old hooks as thin wrappers while their callers migrate; remove them only after the final old call site is gone.

## A practical first milestone

Start with these small tasks rather than reorganizing folders:

1. Remove the server module-level QueryClient and create one in each `app.server.tsx` render.
2. Change the browser entry to use `getClientQueryClient()`.
3. Replace direct `queryClient` imports in the first set of hooks/components with `useQueryClient()`.
4. Add a request-scoped server API factory and preserve request cookies/headers in the Express-to-Web-Request adapter.
5. Choose one safe public page and move its critical query into a route loader.
6. Wire query dehydration/hydration for that page.

After that milestone, the architecture is demonstrated in production code and can be extended feature by feature. Keep the current route paths and visible UI stable while moving data ownership underneath them.
