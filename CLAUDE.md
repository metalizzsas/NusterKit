# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NusterKit is an industrial machine automation platform. Machines are defined via JSON specifications and controlled through a REST API (Turbine) with an operator-facing UI. The system manages machine cycles, IO controllers (Modbus/TCP, Ethernet/IP), profiles, containers, and maintenance tasks.

## Monorepo Structure

pnpm workspaces with 4 packages:

- **`packages/turbine`** (`@nuster/turbine`) — Fastify REST API + WebSocket server for machine control. Core of the system.
- **`packages/ui`** (`@nuster/ui`) — SvelteKit operator frontend. Connects to Turbine via auto-generated OpenAPI client.
- **`packages/simulation-server`** (`@nuster/simulation-server`) — Express server simulating hardware IO (dev only, private).
- **`packages/simulation-ui`** (`@nuster/simulation-ui`) — SvelteKit UI for the simulation server (dev only, private).

## Commands

```bash
# Development (starts all packages in parallel)
pnpm run dev

# Individual dev servers
pnpm run dev:turbine
pnpm run dev:ui
pnpm run dev:simulation

# Build (sequential: turbine -> ui -> simulation)
pnpm run build

# Lint & format (Biome, not ESLint)
pnpm run lint
pnpm run format

# Tests
pnpm run test                                          # all packages
pnpm --filter @nuster/turbine run test                 # turbine only (vitest watch)
pnpm --filter @nuster/turbine run test -- --run        # turbine single run
pnpm --filter @nuster/ui run test                      # ui type-check (svelte-check)

# OpenAPI type generation pipeline (turbine -> ui)
pnpm run openapi

# Versioning (changesets)
pnpm changeset         # create a changeset
pnpm run version       # bump versions
pnpm run release       # publish
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Fastify 5, Zod 4, fastify-type-provider-zod |
| Database | SQLite via Prisma |
| Frontend | SvelteKit 2, Svelte 5, TailwindCSS 4 |
| API client | openapi-fetch + openapi-typescript (auto-generated from Turbine's OpenAPI spec) |
| Industrial IO | modbus-serial, enip-ts, serialport |
| Linter/Formatter | Biome (tabs, 150-char lines, double quotes, semicolons) |
| Testing | Vitest (turbine), svelte-check (ui) |
| Runtime | Node.js 24.x, pnpm 10.33 |

## Architecture

### Turbine (Backend)

Single `Machine` instance per process holds all state. The Machine owns domain-specific routers:

- `IORouter` — IO gates and handlers (Modbus/TCP, Ethernet/IP, Serial)
- `CycleRouter` — Machine cycle execution via the Program Block Runner (`pbr/`)
- `ProfilesRouter` — Profile CRUD with skeleton-based validation
- `ContainersRouter` — Container/product management
- `MaintenanceRouter` — Preventive maintenance tracking
- `NetworkRouter` — Network status and Balena integration
- `CalltoActionRouter` — Dynamic call-to-action buttons

Service adapters (`services/`) mediate between routers and external concerns (IO bus, logging, etc.) via a `ServiceRegistry`.

All Fastify routes use Zod schemas via `fastify-type-provider-zod`. The OpenAPI spec is auto-extracted at build time and consumed by the UI.

WebSocket broadcasts full machine status every 500ms.

### UI (Frontend)

Type-safe API client auto-generated from Turbine's OpenAPI JSON (`src/lib/api/openapi.d.ts`). Uses `openapi-fetch` for requests. i18n via `svelte-i18n`. Virtual keyboard support for industrial touchscreens.

### OpenAPI Pipeline

```
turbine build:schemas -> openapi:extract -> openapi.json -> ui openapi:generate -> openapi.d.ts
```

Run `pnpm run openapi` at the root to sync after changing Turbine route schemas.

## Machine Configuration

Machines are defined by JSON files:

- **`/data/info.json`** (prod) or **`data/info.json`** (dev) — Current machine configuration (`Configuration` type)
- **`/machines/{model}/specs.json`** — Machine specifications (`MachineSpecs` type, validated against generated JSON Schema)
- **`/machines/{model}/static/i18n/`** — Translation files
- **`/machines/{model}/static/docs/`** — Documentation files

TypeScript types for these are in `packages/turbine/src/types/`. JSON Schemas are generated from these types via `ts-json-schema-generator`.

## Database

SQLite at `/data/database.db` (prod) or `data/database.db` (dev). Prisma schema at `packages/turbine/prisma/schema.prisma`.

Models: `Profile`, `ProfileValue`, `Container`, `Maintenance`, `CallToAction`.

## Ports

| Service | Port |
|---------|------|
| Turbine | 4080 |
| UI | 4081 |
| Simulation Server | 4082 |
| Simulation UI | 4084 |

Dev uses portless proxy (`*.nuster.localhost` domains).

## Versioning

Changesets with fixed versioning: `@nuster/turbine` and `@nuster/ui` are always released together at the same version. Simulation packages are private (tagged only, not published).
