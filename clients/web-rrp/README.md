# web-rrp (React Router v7 scaffold)

Clean skeleton for the production React Router v7 migration. The existing
`clients/web` is untouched; this app will grow into its replacement
feature-by-feature.

## Run

```bash
# from repo root
pnpm install
pnpm --filter web-rrp dev      # http://localhost:3001
pnpm --filter web-rrp build
pnpm --filter web-rrp typecheck
```

Make sure your Django backend is up (API is proxied via `/api` →
`VITE_PUBLIC_API_URL`, default `http://localhost:8000`).

## What's in here

```
app/
├── root.tsx                 ← providers (QueryClient, Theme, Toaster) + <Outlet/>
├── routes.ts                ← route manifest (replaces old routes.tsx)
├── routes/
│   ├── _app/                ← AUTHENTICATED app shell (pathless layout)
│   │   ├── layout.tsx       ← paste MainLayout (+ Guard) here
│   │   ├── _index.tsx       ← home placeholder
│   │   └── $.tsx            ← 404 splat inside app
│   ├── auth/                ← PUBLIC auth subtree
│   │   ├── layout.tsx       ← paste AuthLayout here
│   │   ├── _index.tsx       ← redirects to /auth/sign-in
│   │   ├── sign-in/route.tsx
│   │   ├── sign-up/route.tsx
│   │   ├── callback/route.tsx
│   │   ├── forgot-password/route.tsx
│   │   └── account/
│   │       ├── reset-password.$key/route.tsx
│   │       ├── verify-email.$key/route.tsx
│   │       └── email/verify/route.tsx
│   └── activate.$uuid.$token/route.tsx
├── lib/
│   ├── http/client.ts       ← singleton axios instance (one place for auth/CSRF/401)
│   ├── http/types.ts        ← ApiError, PaginatedResponse, etc.
│   └── query/client.tsx     ← createQueryClient + QueryProvider (RQ)
├── features/
│   └── auth/
│       ├── auth.http.ts     ← AuthHttp class (inherits base http client)
│       ├── auth.keys.ts     ← RQ query-key factory
│       ├── hooks/           ← useSession, useAuthMutations, useSocials (stubs)
│       ├── loaders/         ← publicAuthLoader / protectedLoader / activationLoader
│       └── components/      ← auth-only components
├── providers/               ← theme, toaster, socket (stubs)
├── components/              ← shared components (shadcn primitives, etc.)
└── styles/app.css           ← tailwind + minimal auth/app shell styles
```

## Conventions

- **HTTP**: one axios instance at `app/lib/http/client.ts`. Per-feature
  classes (e.g. `AuthHttp`) import that single instance. Authorization,
  CSRF, and the global 401→logout handler live in that one file.
- **React Query stays.** TanStack Query is the primary data-fetching
  story. Loaders are optional — use them for SSR preload/redirects later;
  keep queries in features' `hooks/`.
- **Features are folders.** Each feature owns its `*.http.ts`, `*.keys.ts`,
  `hooks/`, `components/`, and (if SSR-relevant) `loaders/`.
- **Routes are file-based.** `route()` in `app/routes.ts` points to files
  in `app/routes/`. Every leaf file exports `meta`, optionally `loader`,
  and a default component.
- **Workspace imports.** `design`, `validation`, `@campus/api` are wired
  as workspace packages (same as the existing web app). Alias `@/*` → `app/*`.

## Porting a page from clients/web

1. Drop the page component into the matching
   `app/routes/<feature>/<segment>/route.tsx` (replace the placeholder).
2. Move forms / small components into that feature's `components/`.
3. Port hooks by copying the `useX` files into the feature's `hooks/` and
   point them at `authHttp`/`<feature>.http.ts` instead of importing
   axios directly.
4. Fill in the matching `<Feature>Http` method (request shape, response
   type) — all auth headers/CSRF come for free from the base client.
5. Paste layout JSX into `routes/_app/layout.tsx` (MainLayout) or
   `routes/auth/layout.tsx` (AuthLayout).
