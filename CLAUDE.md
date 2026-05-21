# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run lint         # Run Biome linter
npm run format       # Format with Biome
npm run check        # Full Biome check
npm run check:fix    # Auto-fix all Biome issues
npm run generate:presets  # Regenerate src/lib/preferences/theme.ts from CSS preset files
```

No test suite is configured.

## Architecture

**Stack:** Next.js (App Router) + React 19 + TypeScript + Tailwind CSS v4 + Shadcn UI + Zustand

**App:** BoltForge Hardware — an inventory management system for hardware products. This connects to a real ASP.NET Core backend via `NEXT_PUBLIC_API_URL`.

### Route groups

All routes live under `src/app/(main)/`. Two groups:
- `(main)/auth/v1/` and `(main)/auth/v2/` — login/register pages (two visual variants)
- `(main)/dashboard/` — protected dashboard pages

`middleware.ts` guards all `/dashboard/*` routes: redirects to `/auth/v1/login` if `access_token` cookie is absent, and redirects authenticated users away from `/auth/*`.

### Dashboard pages

Each page under `src/app/(main)/dashboard/` maps to a sidebar section:
- `default/` — KPI cards, low-stock alerts, recent sales orders (fetches from `/api/v1/Dashboard`)
- `products/`, `categories/`, `warehouses/`, `stock/` — Inventory
- `suppliers/`, `purchase-orders/[id]/`, `purchase-returns/` — Procurement
- `customers/`, `sales-orders/[id]/`, `sales-returns/`, `payments/` — Sales
- `reports/` — Sales and purchase reports
- `users/`, `profile/` — Admin / account

### API layer

`src/lib/api/client.ts` exports two fetch wrappers:
- `serverFetch<T>` — for Server Components; reads `access_token` from Next.js `cookies()`
- `apiFetch<T>` — for Client Components; reads from `document.cookie`, silently retries once after calling `/api/v1/Auth/refresh` on 401, then redirects to login on failure

All domain API functions live in `src/lib/api/` (e.g. `products.ts`, `sales-orders.ts`). They call `apiFetch` or `serverFetch` and return typed results using the DTOs in `src/lib/api/types.ts`.

The generic response envelope is `ApiResponse<T>` (`isSuccess`, `message`, `data`, `errors`). Paginated endpoints return `PagedResult<T>` and accept `PagedQuery` params.

### Auth store

`src/stores/auth/auth-store.ts` holds the current `UserDto` and `isAuthenticated` flag in a vanilla Zustand store (SSR-safe, distributed via React context in `auth-provider.tsx`).

### Preferences & Theme system

Global UI preferences (theme mode, color preset, font, layout options) are stored in a Zustand store (`src/stores/preferences/`) and persisted to client cookies. A `ThemeBootScript` in the root layout prevents theme flicker by syncing preferences to `data-*` attributes on `<html>` before paint.

Available preferences:
- `theme_mode`: `"light" | "dark" | "system"`
- `theme_preset`: `"default" | "brutalist" | "soft-pop" | "tangerine"`
- `font`: 14 options (Geist, Inter, Roboto, etc.)
- `content_layout`: `"centered" | "full-width"`
- `navbar_style`: `"sticky" | "scroll"`
- `sidebar_variant`: `"sidebar" | "inset" | "floating"`
- `sidebar_collapsible`: `"icon" | "offcanvas"`

CSS preset files live in `src/styles/presets/`. The script `src/scripts/generate-theme-presets.ts` parses them and outputs `src/lib/preferences/theme.ts`. **Never edit `theme.ts` directly** — run `npm run generate:presets` or let the Husky pre-commit hook do it.

Colors use OkLCH format. Dark mode uses `@custom-variant dark (&:is(.dark *))` in `globals.css` — not Tailwind's built-in dark mode.

### Tailwind config

No `tailwind.config.ts`. Tailwind v4 is configured inline in `src/app/globals.css` via `@theme` and `@custom-variant` directives.

### Components

`src/components/ui/` — Shadcn-based primitives (excluded from Biome linting). Use `cn()` from `src/lib/utils.ts` for class merging, CVA for variant styling. Feature components are colocated with their route pages.

### Path alias

`@/*` maps to `src/*`.

## Linting & formatting

Biome replaces ESLint and Prettier. Line width: 120, indent: 2 spaces, quotes: double. Import order is enforced: react → next → packages → `@/*` aliases → relative paths. Run `npm run check:fix` to auto-fix.

## Environment

`NEXT_PUBLIC_API_URL` must be set to the backend base URL (e.g. `https://localhost:7080`). The API client prepends this to all paths.
