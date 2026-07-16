# Campus and Clubs Monorepo

This repository is a monorepo managed with **pnpm workspaces**. It contains the frontend applications, shared packages, and backend services for the Campus and Clubs platform.

## Structure

- `clients/`: Client-facing applications (e.g., Web, Mobile).
  - `web/`: The primary web application.
- `packages/`: Shared and generated packages used across the apps (e.g., API clients, shared UI components).
- `services/`: Backend services.
  - `api/`: The main backend service built with Python and Django.

## Prerequisites

- **Node.js** & **pnpm**: Required for the frontend and monorepo management.
- **Python** & **uv**: Required for the backend Django service.

## Available Scripts

We use a task runner configured in `rav.yaml` (or you can run these manually). Here are the primary commands:

- `rav run web`: Starts the frontend web application in development mode (`pnpm --filter web dev`).
- `rav run server`: Starts the Django development server (`cd services/api && uv run python manage.py runserver`).
- `rav run migrations`: Generates new database migrations for the backend.
- `rav run migrate`: Applies database migrations.
- `rav run build`: Builds the frontend and any shared packages.
- `rav run start`: Starts the production build of the frontend.

Alternatively, you can use `pnpm` from the root directory for JavaScript/TypeScript projects:
- `pnpm --filter web dev`

## Backend (`services/api`)

The backend is a Django application structured into domain-specific apps (`accounts`, `clubs`, etc.) under `services/api/apps/` and core configurations under `services/api/core/`.

To set up the backend locally:
1. Navigate to `services/api`.
2. Install dependencies using `uv`.
3. Set up your local `.env` (refer to `.env.local`).
4. Run migrations and start the server.