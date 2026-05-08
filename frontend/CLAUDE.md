# CLAUDE.md — Frontend

This file provides guidance to Claude Code (claude.ai/code) when working with code in the frontend directory.

## Commands

All commands should be run from the `frontend/` directory:

- `bun run dev` — Start dev server
- `bun run build` — Production build
- `bun run build:dev` — Development-mode build
- `bun run preview` — Preview production build
- `bun run lint` — Lint with ESLint
- `bun run format` — Format with Prettier

No test framework is configured.

## Architecture

**Framework**: TanStack Start v1.167+ with Vite 7, deployed to Cloudflare Workers.

**Routing**: File-based via `@tanstack/react-router`. Route files live in `src/routes/` and export a `Route` created with `createFileRoute("/path")`. The `routeTree.gen.ts` file is auto-generated — never edit it.

| Path | File | Description |
|------|------|-------------|
| `/` | `routes/index.tsx` | Landing/marketing page |
| `/workspace` | `routes/workspace.tsx` | Dashboard with stats, knowledge graph, pipelines |
| `/chat` | `routes/chat.tsx` | AI chat interface |
| `/devices` | `routes/devices.tsx` | Device management |
| `/remote` | `routes/remote.tsx` | Remote control channels |

**Root layout** (`__root.tsx`): Defines the HTML shell (`RootShell`), wraps children in `QueryClientProvider`, and provides 404/error components.

**Server entry** (`server.ts`): Custom Cloudflare Workers entry with error handling that intercepts SSR errors and renders a branded error page. The `error-capture.ts` module captures original errors via global listeners.

**Start config** (`start.ts`): Creates TanStack Start instance with `errorMiddleware` for server-side error handling.

**Vite config**: Uses `@lovable.dev/vite-tanstack-config` which auto-includes all plugins (tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare, componentTagger). Do NOT add these plugins manually.

## Key Conventions

- **Path alias**: Use `@/` imports (e.g., `@/components/ui/button`, `@/lib/utils`)
- **UI components**: `src/components/ui/` contains 47 shadcn/ui components — do not hand-edit these; use `npx shadcn@latest add <component>` to add new ones
- **App components**: `src/components/dashboard/` contains app-specific components (Sidebar, TopNav, StatCard, KnowledgeGraph, PipelineRuns)
- **Styling**: Dark theme, oklch color format, JetBrains Mono font. Custom utility classes in `styles.css`: `.glow-primary`, `.text-glow`, `.panel` (glass-morphism), `.dash-pulse`, `.scanline`
- **CSS variables**: Colors are defined as CSS custom properties in `:root` within `src/styles.css` and registered in `@theme inline` for Tailwind
- **Class merging**: Use `cn()` from `@/lib/utils` (clsx + tailwind-merge)
- **No `server-only` package**: Use `*.server.ts` naming convention instead (ESLint rule enforces this)
- **No `index.html`**: TanStack Start generates the HTML shell from `__root.tsx`
- **State**: Local `useState` for UI, `@tanstack/react-query` for server state, `react-hook-form` + `zod` for forms
- **No API layer yet**: All data is hardcoded mock data within components
- **Prettier**: 100 char print width, double quotes, trailing commas, semicolons
- **Responsive**: `use-mobile.tsx` hook provides breakpoint detection at 768px

## Deployment

Cloudflare Workers via `wrangler.jsonc`. App name: `tanstack-start-app`. Requires `nodejs_compat` flag.
