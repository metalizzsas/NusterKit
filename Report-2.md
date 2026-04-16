# NusterKit Codebase Audit Report — April 2026

**Date**: 2026-04-16
**Scope**: Full codebase re-audit — security, architecture, concurrency, error handling, resource management, TypeScript quality, infrastructure
**Packages audited**: `@nuster/turbine`, `@nuster/ui`, `@nuster/simulation-server`, `@nuster/simulation-ui`
**Posture**: **Maximum strictness** — every finding is treated as a defect. Stability over convenience.
**Baseline**: Compared against the March 2026 audit (`Report.md`). Items fixed since then are noted.

---

## Table of Contents

1. [Progress Since Last Audit](#1-progress-since-last-audit)
2. [Remaining Security Vulnerabilities](#2-remaining-security-vulnerabilities)
3. [Event Emitter — Listener Leaks (Partially Fixed)](#3-event-emitter--listener-leaks-partially-fixed)
4. [ProgramBlockRunner — Remaining Issues](#4-programblockrunner--remaining-issues)
5. [IO Handlers — Concurrency & Atomicity](#5-io-handlers--concurrency--atomicity)
6. [Error Handling Deficiencies](#6-error-handling-deficiencies)
7. [Resource Leaks & Cleanup Gaps](#7-resource-leaks--cleanup-gaps)
8. [TypeScript & Code Quality](#8-typescript--code-quality)
9. [Infrastructure & Build](#9-infrastructure--build)
10. [Test Coverage](#10-test-coverage)
11. [Remediation Roadmap](#11-remediation-roadmap)

---

## 1. Progress Since Last Audit

Significant improvements have been made since the March 2026 report. The following issues from `Report.md` are now resolved:

| # | Original Issue | Status | Evidence |
|---|---------------|--------|----------|
| 2.2 | `removeAllListeners()` in PBR destroys global state | **FIXED** | `ProgramBlockRunner.ts:289-301` now uses `removeListener()` with stored references |
| 6.x | Express deprecated patterns | **FIXED** | Migrated to Fastify 5.8.5 with Zod validation + OpenAPI |
| 1.7 | Error information disclosure (`res.status(500).end(String(ex))`) | **FIXED** | Global error handler returns generic `{ error: "Internal server error" }` (app.ts:137-143) |
| 7.x | `console.log` in production code | **FIXED** | Zero `console.log` in `packages/turbine/src/` — all logging via `TurbineEventLoop` + Pino |
| 7.x | `@ts-ignore` proliferation | **IMPROVED** | Reduced to 1 instance in turbine (was multiple), 6 remain in simulation-server |
| 7.x | `as any` proliferation | **IMPROVED** | Reduced to 1 instance in turbine (`deepInsert.ts:53`), 2 in simulation-server |
| 9.1 | No graceful shutdown | **FIXED** | `GracefulShutdown` class with reverse-order disposal + 10s timeout (app.ts:44, utils/GracefulShutdown.ts) |
| 9.4 | WAGO reconnection stacking | **FIXED** | Exponential backoff with `connecting` guard and `scheduleReconnect()` (WAGO.ts:80-91) |
| 9.5-9.7 | Missing `dispose()` on controllers | **FIXED** | `EX260Sx.dispose()` (line 209), `WAGO.dispose()` (line 156) both implemented |
| 10.x | TypeScript strict mode disabled | **FIXED** | `"strict": true` in tsconfig.json |
| 11.x | Docker non-root, health checks, unpinned images | **FIXED** | All Dockerfiles: pinned SHA256, non-root user (UID 1001), HEALTHCHECK directives |
| 11.x | Missing CI pipeline | **FIXED** | 4 GitHub Actions workflows: lint, test, build, Docker, security audit |
| 11.x | No input validation | **PARTIALLY FIXED** | Zod schemas on route bodies/params via `fastify-type-provider-zod` |
| 3.x | PBR `removeAllListeners` | **FIXED** | Now stores handler refs and calls `removeListener` per-event (PBR.ts:289-301) |

**Summary**: ~20 of 66 original issues resolved. The codebase has improved substantially in infrastructure, TypeScript quality, and framework modernization. Critical gaps remain in security, listener lifecycle, and error handling.

---

## 2. Remaining Security Vulnerabilities

### 2.1 CRITICAL — No Authentication on Any API Endpoint

**Files**: `packages/turbine/src/app.ts` (lines 149-302), all files in `packages/turbine/src/routes/`

All routes remain unauthenticated. No JWT, API keys, or token validation. Anyone with network access can:
- Start/stop machine cycles (`/v1/cycle/*`)
- Write values to IO gates controlling physical hardware (`/v1/io/*`)
- Reboot/shutdown the system (`/reboot`, `/shutdown`)
- Force software updates (`/forceUpdate`)
- Reconfigure the machine (`POST /config`)

**Recommendation**: Implement authentication middleware on Fastify. At minimum, add API key validation for machine-critical endpoints (`/v1/cycle/*`, `/v1/io/*`, `/reboot`, `/shutdown`, `/forceUpdate`, `POST /config`).

---

### 2.2 HIGH — Open CORS (All Origins Allowed)

**File**: `packages/turbine/src/app.ts:120`

```typescript
await app.register(fastifyCors); // No configuration — accepts all origins
```

Default `@fastify/cors` with no options allows all origins, all methods, all headers. Any website can make cross-origin requests to control the machine.

**Recommendation**: Configure explicit `origin` whitelist.

---

### 2.3 HIGH — SSRF in CallToAction Route

**File**: `packages/turbine/src/routes/calltoaction.ts:31-35`

```typescript
const ctaRequest = await fetch(
    `http://localhost:${process.env.PORT}${cta.api_endpoint}`,
    { method: cta.api_method, body: cta.api_body ?? undefined }
);
```

`api_endpoint` is user-controlled via database. No allowlist, no URL validation. An attacker who can write to the database (trivial without auth) can trigger `/reboot`, `/shutdown`, or any internal endpoint.

**Recommendation**: Validate `api_endpoint` against a hardcoded allowlist of safe routes.

---

### 2.4 HIGH — No Rate Limiting

No rate limiting middleware on any endpoint. No `@fastify/rate-limit` dependency.

**Recommendation**: Add `@fastify/rate-limit` with sensible defaults, and stricter limits on critical endpoints.

---

### 2.5 HIGH — WebSocket Without Authentication

**File**: `packages/turbine/src/websocket/WebsocketDispatcher.ts:30`

```typescript
this.wsServer = new WebSocketServer({server: httpServer, path: productionEnabled ? '' : '/ws/'});
```

No authentication on WebSocket connections. All connected clients receive all broadcast data including machine status, IO states, and modals. No origin validation, no message rate limiting.

---

### 2.6 MEDIUM — Missing HTTP Security Headers

No security headers set globally:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Content-Security-Policy`

**Recommendation**: Add `@fastify/helmet` or set headers manually.

---

### 2.7 LOW — Balena API Key in URL Query Strings

**Files**: `packages/turbine/src/app.ts:212, 220, 249, 504, 509`

```typescript
await fetch(`${process.env.BALENA_SUPERVISOR_ADDRESS}/v1/update?apikey=${process.env.BALENA_SUPERVISOR_API_KEY}`, ...);
```

API key visible in logs, error traces. Mitigated by the fact that this key is ephemeral (regenerated per container run), but still not best practice.

**Recommendation**: Use `Authorization` header if the Balena Supervisor supports it.

---

## 3. Event Emitter — Listener Leaks (Partially Fixed)

### 3.1 FIXED — PBR `removeAllListeners` → `removeListener`

`ProgramBlockRunner.ts:289-301` now stores references and uses targeted `removeListener()` for all 10 event types. This is a significant improvement.

### 3.2 CRITICAL — IOGate Listener Never Removed

**File**: `packages/turbine/src/io/IOGates/IOGate.ts:45-57`

```typescript
TurbineEventLoop.on(`io.update.${this.name}`, async (options) => {
    // ... handler code
    await this.write(options.value);
    await options.callback?.();
});
```

IOGate registers a listener in its constructor. There is **no `dispose()` method** and no cleanup. IOGates are created once per machine configuration, so the leak is bounded to one per gate per machine lifecycle. However, if the machine is reconfigured without restarting, old gate listeners accumulate.

**Recommendation**: Add `dispose()` to IOGate that calls `TurbineEventLoop.removeListener()`.

---

### 3.3 CRITICAL — ContainerRegulation: 6+ Listeners Never Removed

**File**: `packages/turbine/src/containers/ContainerRegulation.ts:52-112`

The constructor registers **6+ event listeners** per regulation instance:

| Line | Event | Removed on dispose? |
|------|-------|---------------------|
| 52 | `container.${name}.regulation.${name}.get_state` | **No** |
| 56 | `container.${name}.regulation.${name}.get_target` | **No** |
| 60 | `container.${name}.regulation.${name}.set_state` | **No** |
| 75 | `container.${name}.regulation.${name}.set_target` | **No** |
| 87 | `io.updated.${sensor}` | **No** |
| 106 | `io.updated.${security_gate}` (per security gate) | **No** |

The `dispose()` method (line 226) only clears the `regulationTimer` interval — it does not remove any of these listeners.

**Impact**: With 10 containers × 2 regulations × 3 security gates = 90+ leaked listeners per machine lifecycle. Over multiple PBR runs that recreate containers, this grows unbounded.

**Recommendation**: Store handler references and remove them in `dispose()`.

---

### 3.4 HIGH — Container Sensor Listeners Never Removed

**File**: `packages/turbine/src/containers/Containers.ts:50-56`

```typescript
for(const sensor of this.sensors ?? []) {
    TurbineEventLoop.on(`io.updated.${sensor.io}`, async (gate) => { ... });
}
```

Listeners registered in constructor with no cleanup. `Containers` has no `dispose()` method.

---

### 3.5 HIGH — IOReadParameterBlock Listener Never Removed

**File**: `packages/turbine/src/pbr/ParameterBlocks/machine/IOReadParameterBlock.ts:22-24`

```typescript
this.ctx.io.on(`updated.${this.gateName.data}`, (gate) => {
    this.#gateValue = gate.value;
});
```

Parameter blocks register listeners in their constructor but have no `dispose()` mechanism. Since parameter blocks are instantiated per PBR step, per run, these accumulate.

---

### 3.6 Listener Leak Impact Estimate

For a machine with 10 containers, 20 regulations, 50 IO gates, running 10 PBR cycles:

| Source | Listeners/run | After 10 runs |
|--------|--------------|---------------|
| ContainerRegulation (6+ each) | ~120 | ~1,200 |
| Container sensors | ~20 | ~200 |
| IOReadParameterBlock | ~30 | ~300 |
| IOGate (one-time, on config) | 50 | 50 |
| **Total** | | **~1,750** |

The `TurbineEventLoop` has a max listener count of 300. These orphaned listeners will cause the EventEmitter to emit warnings, degrade performance, and execute stale handlers.

---

## 4. ProgramBlockRunner — Remaining Issues

### 4.1 HIGH — IOWriteProgramBlock Timer Race (Legacy Path)

**File**: `packages/turbine/src/pbr/ProgramBlocks/machine/IOWriteProgramBlock.ts:45-84`

The legacy event-based code path (when `ctx` is not available) creates three timers: `retryTimer` (setTimeout 1s), `timeoutTimer` (setTimeout 2s), and `abortCheckTimer` (setInterval 250ms). The `settle()` function clears all timers, but if the Promise's main callback never fires (e.g., the event listener on `io.updated.*` never triggers), the `abortCheckTimer` polls indefinitely.

**Impact**: Zombie `setInterval` timers if IO events are lost.

---

### 4.2 HIGH — StartTimerProgramBlock: Timer Lifecycle Depends on External Storage

**File**: `packages/turbine/src/pbr/ProgramBlocks/flow/StartTimerProgramBlock.ts:39-45`

```typescript
const timer = setInterval(async () => { ... }, timerInterval * 1000);
this.ctx.timerStart({ name: timerName, timer, enabled: true });
```

The `setInterval` reference is passed to the PBR context. If registration fails or the block is disposed before the timer is stored, the interval is never cleared.

---

### 4.3 MEDIUM — PBR Pause/Resume IO Snapshot Race

**File**: `packages/turbine/src/pbr/ProgramBlockRunner.ts:164-169`

On pause, the PBR takes an IO snapshot then resets all gates:

```typescript
this.setState("paused");
this.ioPauseSnapshot = structuredClone(this.ctx.io.snapshot());
await this.ctx.io.resetAll();
```

Between `snapshot()` and `resetAll()`, regulation loops or external events can modify IO gates. The snapshot may capture intermediate state that doesn't match what should be restored on resume.

---

## 5. IO Handlers — Concurrency & Atomicity

### 5.1 CRITICAL — EX260Sx: Non-Atomic Read-Modify-Write

**File**: `packages/turbine/src/io/IOHandlers/EX260Sx.ts:133-206`

The `writeData()` method performs a read-modify-write cycle to set a single bit in a 16/32-bit register:

1. Acquire mutex (line 138)
2. Read current register state via `readData2(0x96)` (line 150)
3. Parse binary, modify one bit (lines 156-178)
4. Write back (line 197)

The `writeMutex` protects concurrent `writeData()` calls, **but `readData2()` uses an event-based Promise** that waits for a `SendRRData Received` event with no timeout:

```typescript
return new Promise<Buffer>((resolve) => {
    this.controller.events.once("SendRRData Received", (result: dataItem[]) => {
        // resolve only on matching packet
    });
});
```

**Issue 1**: If the event never fires or the packet doesn't match the filter (line 124), the Promise hangs forever. The mutex is never released, deadlocking all subsequent writes.

**Issue 2**: `readData2()` is called inside the write mutex, but it issues its own network write (`controller.write()` at line 111) outside any protection. If a parallel `readData()` call exists, the EtherNet/IP responses could be mismatched.

**Recommendation**: Add a timeout to the `readData2()` Promise. Consider a connection-level mutex that covers all EtherNet/IP operations.

---

### 5.2 HIGH — AsyncMutex: No Timeout Protection

**File**: `packages/turbine/src/utils/AsyncMutex.ts:9-16`

```typescript
async acquire(): Promise<void> {
    if (!this._locked) {
        this._locked = true;
        return;
    }
    return new Promise<void>((resolve) => {
        this._queue.push(resolve); // Waits indefinitely
    });
}
```

If a mutex holder crashes without calling `release()`, all waiters block forever. This is the root cause of potential deadlocks in EX260Sx.

**Recommendation**: Add an optional timeout to `acquire()` that rejects after N ms.

---

### 5.3 HIGH — WAGO: Reconnect setTimeout Not Cancellable

**File**: `packages/turbine/src/io/IOHandlers/WAGO.ts:80-91`

```typescript
private scheduleReconnect(): void {
    setTimeout(async () => {
        const success = await this.connect();
        if (!success && !this.unreachable) {
            this.scheduleReconnect();  // Recursive
        }
    }, delay);
}
```

The `setTimeout` reference is not stored. If `dispose()` is called during a reconnect sequence, the pending timeout continues executing in the background, calling `this.connect()` on a disposed handler.

**Recommendation**: Store the timeout ID as an instance variable and clear it in `dispose()`.

---

### 5.4 MEDIUM — WAGO writeData/readData: No Mutex

**File**: `packages/turbine/src/io/IOHandlers/WAGO.ts:100-153`

Unlike EX260Sx, WAGO has no write mutex. Concurrent `writeData()` and `readData()` calls on the same Modbus TCP connection can interleave requests/responses. Modbus TCP is a request/response protocol — concurrent messages on one socket can corrupt the transaction.

**Recommendation**: Add an `AsyncMutex` to WAGO for serializing I/O operations.

---

## 6. Error Handling Deficiencies

### 6.1 CRITICAL — Unhandled `JSON.parse` in `/configs` Route

**File**: `packages/turbine/src/app.ts:155`

```typescript
const parsedSpecs = JSON.parse(rawSpecs) as MachineSpecs;
```

Inside a loop over `machinesPath` directories. No try/catch around the parse. If any `specs.json` is malformed, the entire route handler throws and returns 500. The loop has no per-iteration error boundary.

**Recommendation**: Wrap in try/catch and skip malformed entries.

---

### 6.2 CRITICAL — Unhandled `JSON.parse` in Startup Config Load

**File**: `packages/turbine/src/app.ts:402, 413`

```typescript
const parsedConfiguration = JSON.parse(rawConfiguration) as Configuration;
const parsedSpecs = JSON.parse(rawSpecs) as MachineSpecs;
```

These are in the machine setup path. A malformed `info.json` or `specs.json` crashes the entire startup sequence.

---

### 6.3 CRITICAL — Unhandled `JSON.parse` in Migration

**File**: `packages/turbine/src/migrate.ts:48`

```typescript
const migrationData = JSON.parse(migrationFileContent) as { ... };
```

No try/catch. A corrupt migration file crashes the process.

---

### 6.4 HIGH — Fetch Outside Try/Catch in `/forceUpdate`

**File**: `packages/turbine/src/app.ts:212`

```typescript
const req = await fetch(`${process.env.BALENA_SUPERVISOR_ADDRESS}/v1/update?...`, { ... });
```

This `fetch` is **outside** the preceding try/catch block (which ends at line 210). If the Balena Supervisor is unreachable, the route handler crashes with an unhandled rejection.

---

### 6.5 HIGH — Fetch Without Error Handling in Post-Update Service Restarts

**File**: `packages/turbine/src/app.ts:504-513`

```typescript
await fetch(`${process.env.BALENA_SUPERVISOR_ADDRESS}/v2/applications/${process.env.BALENA_APP_ID}/restart-service?...`);
await fetch(`...`);
```

Two `fetch` calls with no try/catch. If the Balena Supervisor is unreachable during startup (when `wasUpdated` is true), the entire startup sequence crashes.

---

### 6.6 HIGH — Bare Catch Blocks Lose Error Context

**Files**:
- `packages/turbine/src/app.ts:240` (`/reboot` route) — `catch { return reply.status(500).send(); }`
- `packages/turbine/src/app.ts:269` (`/shutdown` route) — `catch { return reply.status(500).send(); }`
- `packages/turbine/src/app.ts:298` (`/settings` GET) — `catch { return reply.status(500).send(); }`

These catch blocks swallow errors without logging. If these routes fail, there's no diagnostic information in the logs.

**Recommendation**: Log the error via `TurbineEventLoop.emit('log', 'error', ...)` before returning 500.

---

### 6.7 HIGH — Settings Error Response Leaks Internal Details

**File**: `packages/turbine/src/app.ts:288`

```typescript
return reply.status(500).send({ error: String(ex) });
```

The `POST /settings` error handler sends `String(ex)` to the client, which may include stack traces or internal paths.

**Recommendation**: Return a generic error message instead.

---

### 6.8 MEDIUM — `.then()` Without `.catch()` in Containers

**File**: `packages/turbine/src/containers/Containers.ts:131`

```typescript
this.socketData().then(data => { ... });
```

No `.catch()` handler. If `socketData()` throws, the rejection is unhandled.

---

### 6.9 MEDIUM — `.then()` Without `.catch()` in ProductStatusParameterBlock

**File**: `packages/turbine/src/pbr/ParameterBlocks/machine/ProductStatusParameterBlock.ts:28`

```typescript
this.ctx.containers.read(this.containerName.data).then((container) => { ... });
```

No `.catch()` handler on this Promise chain.

---

### 6.10 MEDIUM — `process.exit(1)` Bypasses Graceful Shutdown

**File**: `packages/turbine/src/app.ts:196`

```typescript
process.exit(1); // After writing config
```

After writing a new config to disk, the process calls `process.exit(1)` directly, bypassing the `GracefulShutdown` orchestrator. Active database connections, WebSocket connections, and IO handlers are not properly disposed.

**Recommendation**: Call `SoftExit()` then `process.exit(0)`.

---

## 7. Resource Leaks & Cleanup Gaps

### 7.1 HIGH — ContainerRegulation.dispose() Incomplete

**File**: `packages/turbine/src/containers/ContainerRegulation.ts:226-231`

`dispose()` only clears the `regulationTimer`. The 6+ event listeners registered in the constructor (lines 52-112) are never removed. See section 3.3.

---

### 7.2 HIGH — IOGate Has No dispose() Method

**File**: `packages/turbine/src/io/IOGates/IOGate.ts`

No `dispose()` method exists. The listener registered at line 45 persists indefinitely.

---

### 7.3 HIGH — WAGO scheduleReconnect() Timeout Not Tracked

**File**: `packages/turbine/src/io/IOHandlers/WAGO.ts:85`

The `setTimeout` in `scheduleReconnect()` is not stored as an instance variable. `dispose()` clears the keep-alive interval but cannot cancel pending reconnect timeouts. See section 5.3.

---

### 7.4 MEDIUM — WebsocketDispatcher setTimeout Not Cancellable

**File**: `packages/turbine/src/websocket/WebsocketDispatcher.ts:94-101`

```typescript
setTimeout(() => {
    if(this.connectPopups) { ... }
}, 2000);
```

The timeout reference is not stored. If the dispatcher is disposed within 2 seconds of popup setup, the callback fires on a disposed instance.

---

### 7.5 MEDIUM — EX260Sx readData2 Promise Can Hang Forever

**File**: `packages/turbine/src/io/IOHandlers/EX260Sx.ts:120-131`

```typescript
return new Promise<Buffer>((resolve) => {
    this.controller.events.once("SendRRData Received", (result: dataItem[]) => {
        for(const packet of result) {
            if(/* filter */) { resolve(packet.data); }
        }
    });
});
```

If the event fires but no packet matches the filter, the Promise never resolves. There is no timeout and no reject path. Combined with the write mutex, this can deadlock the entire EX260Sx controller.

---

## 8. TypeScript & Code Quality

### 8.1 GOOD — TypeScript Strict Mode Enabled

`packages/turbine/tsconfig.json` has `"strict": true`. All strict type-checking options are active.

### 8.2 LOW — Remaining `@ts-ignore` Usage

| File | Line | Context |
|------|------|---------|
| `packages/turbine/src/pbr/ProgramBlockStep.ts` | 185 | State assignment |
| `packages/simulation-server/src/simulationMachine.ts` | 49, 77, 82, 87 | Simulation machine setup (4 instances) |
| `packages/simulation-server/src/controllers/enip.ts` | 44 | ENIP controller |
| `packages/simulation-server/src/controllers/modbus.ts` | 18 | Modbus controller |

**1 in turbine, 6 in simulation-server**. Turbine usage is minimal and acceptable. Simulation-server should be cleaned up.

### 8.3 LOW — Remaining `as any` Usage

| File | Line | Context |
|------|------|---------|
| `packages/turbine/src/addons/deepInsert.ts` | 53 | Object merge |
| `packages/simulation-server/src/deepInsert.ts` | 50 | Duplicate of above |
| `packages/simulation-server/src/controllers/enip.ts` | 87 | Server type access |

### 8.4 MEDIUM — Biome `noExplicitAny` Disabled

**File**: `biome.json`

```json
"suspicious": { "noExplicitAny": "off" }
```

With `noExplicitAny` disabled, new `any` types can be introduced without lint warnings. Similarly, `noNonNullAssertion` is off, allowing unchecked `!` assertions.

**Recommendation**: Enable both rules at least at `warn` level.

### 8.5 MEDIUM — Code Duplication Between Packages

`packages/turbine/src/addons/deepInsert.ts` and `packages/simulation-server/src/deepInsert.ts` are near-identical copies (both 53/50 lines, same logic, same `as any` cast).

**Recommendation**: Extract to a shared package or move to turbine's public exports.

### 8.6 INFO — Large Files

| File | Lines | Suggestion |
|------|-------|------------|
| `packages/turbine/src/app.ts` | 539 | Extract standalone routes into separate route files |
| `packages/turbine/src/pbr/ProgramBlockRunner.ts` | 549 | Extract event setup, state management, and step execution |

---

## 9. Infrastructure & Build

### 9.1 GOOD — Docker Setup

All 4 Dockerfiles are well-structured:
- Pinned SHA256 base image (`node:24-alpine@sha256:...`)
- Multi-stage builds (base → build → production)
- Non-root user (`nodejs`, UID 1001)
- `HEALTHCHECK` with sensible intervals
- pnpm pinned to `10.33.0`

### 9.2 GOOD — CI/CD Pipeline

4 GitHub Actions workflows covering lint (Biome), TypeScript checks, tests (Vitest), builds, Docker multi-platform (amd64/arm64), and security audit (`pnpm audit`).

### 9.3 GOOD — Graceful Shutdown

`GracefulShutdown` class with reverse-order disposal, 10s timeout, per-resource error handling. Resources registered throughout `app.ts` (Prisma, machine, regulations, IO router, WebSocket, Fastify).

### 9.4 MEDIUM — `pnpm audit` Is Non-Blocking

**File**: `.github/workflows/ci.yaml`

```yaml
run: pnpm audit --prod || true
```

The `|| true` means audit failures never break CI. Known vulnerabilities can ship without anyone noticing.

**Recommendation**: Remove `|| true` or use `--audit-level=critical` to fail only on critical CVEs.

### 9.5 MEDIUM — ts-node Version Mismatch

**File**: `package.json`

```json
"dependencies": { "ts-node": "10.9.2" },
"peerDependencies": { "ts-node": "10.9.1" }
```

Peer dependency declares 10.9.1 but actual dependency is 10.9.2.

### 9.6 LOW — Simulation-Server Still Uses Express

While turbine migrated to Fastify, `simulation-server` still uses Express 4.21.0 with the `cors` package. Not critical for a dev-only tool, but inconsistent.

---

## 10. Test Coverage

### 10.1 Turbine: 14 Unit Tests

| Area | Test Files | Coverage |
|------|-----------|----------|
| PBR | `ProgramBlockRunner.unit.test.ts`, `ProgramBlock.unit.test.ts`, `ProgramBlockStep.unit.test.ts`, `SleepProgramBlock.unit.test.ts`, `IOWriteProgramBlock.unit.test.ts`, `IOReadParameterBlock.unit.test.ts`, `GetRegulationStateParameterBlock.unit.test.ts` | PBR lifecycle, block execution |
| IO | `IOConcurrency.unit.test.ts`, `IOBusAdapter.unit.test.ts` | Concurrency, bus adapter |
| Utils | `AsyncMutex.unit.test.ts`, `callbackWithTimeout.unit.test.ts`, `GracefulShutdown.unit.test.ts`, `validateEnv.unit.test.ts` | Utilities |
| WebSocket | `WebsocketDispatcher.unit.test.ts` | Broadcast behavior |
| Services | `ScopedEmitter.unit.test.ts` | Scoped events |

### 10.2 Missing Test Coverage

| Area | Files | Risk |
|------|-------|------|
| Routes (all 7) | `calltoaction.ts`, `containers.ts`, `cycle.ts`, `io.ts`, `maintenances.ts`, `network.ts`, `profiles.ts` | No route-level tests |
| app.ts standalone routes | `/configs`, `/config`, `/forceUpdate`, `/reboot`, `/shutdown`, `/settings` | No integration tests |
| ContainerRegulation | `ContainerRegulation.ts` | Regulation loop untested |
| IOGate | `IOGate.ts`, `MappedGate.ts`, `PT100Gate.ts` | Gate read/write untested |
| EX260Sx | `EX260Sx.ts` | Bit manipulation logic untested |
| WAGO | `WAGO.ts` | Reconnection logic untested |
| Machine | `Machine.ts` | Orchestration untested |
| UI package | All | No unit tests (only `svelte-check`) |
| simulation-server | All | No runtime tests (only `tsc --noEmit`) |
| simulation-ui | All | No runtime tests |

**Test ratio**: ~14 test files for ~80+ source files ≈ **~17% coverage** (by file count, not line coverage).

### 10.3 Recommendations

1. **P0**: Integration tests for PBR lifecycle (start, pause, resume, stop, crash recovery)
2. **P0**: Route-level tests for critical endpoints (`/v1/cycle/*`, `/v1/io/*`)
3. **P1**: Concurrency tests for EX260Sx read-modify-write
4. **P1**: ContainerRegulation loop tests
5. **P2**: WAGO reconnection/failover tests

---

## 11. Remediation Roadmap

### Phase 0 — Immediate Safety Fixes (Day 1-3)

| # | Task | Ref | Effort |
|---|------|-----|--------|
| 1 | Add try/catch around `JSON.parse` in `/configs` route | 6.1 | 15 min |
| 2 | Add try/catch around `JSON.parse` in startup config load | 6.2 | 15 min |
| 3 | Add try/catch around `JSON.parse` in `migrate.ts` | 6.3 | 15 min |
| 4 | Wrap `fetch` in `/forceUpdate` in try/catch | 6.4 | 10 min |
| 5 | Wrap post-update `fetch` calls in try/catch | 6.5 | 10 min |
| 6 | Add error logging to bare catch blocks | 6.6 | 15 min |
| 7 | Replace `process.exit(1)` in config POST with `SoftExit()` | 6.10 | 15 min |
| 8 | Fix `String(ex)` leaking in `/settings` POST error response | 6.7 | 5 min |

### Phase 1 — Listener Leak Fixes (Week 1)

| # | Task | Ref | Effort |
|---|------|-----|--------|
| 1 | Add `dispose()` to IOGate with listener removal | 3.2 | 1 hr |
| 2 | Complete `ContainerRegulation.dispose()` — store and remove all 6+ listeners | 3.3 | 2 hr |
| 3 | Add `dispose()` to `Containers` — remove sensor listeners | 3.4 | 1 hr |
| 4 | Add `dispose()` to `IOReadParameterBlock` — remove `updated.*` listener | 3.5 | 1 hr |
| 5 | Add `.catch()` to all dangling `.then()` chains | 6.8, 6.9 | 30 min |

### Phase 2 — IO Safety (Week 2)

| # | Task | Ref | Effort |
|---|------|-----|--------|
| 1 | Add timeout to `EX260Sx.readData2()` Promise | 5.1, 7.5 | 2 hr |
| 2 | Add optional timeout to `AsyncMutex.acquire()` | 5.2 | 1 hr |
| 3 | Store and cancel WAGO reconnect timeout in `dispose()` | 5.3, 7.3 | 1 hr |
| 4 | Add AsyncMutex to WAGO for I/O serialization | 5.4 | 2 hr |
| 5 | Store and cancel WebsocketDispatcher popup timeout | 7.4 | 30 min |

### Phase 3 — Security Hardening (Week 3-4)

| # | Task | Ref | Effort |
|---|------|-----|--------|
| 1 | Implement API key authentication middleware on Fastify | 2.1 | 1 day |
| 2 | Configure CORS with explicit origin whitelist | 2.2 | 1 hr |
| 3 | Add SSRF allowlist to CallToAction endpoint | 2.3 | 2 hr |
| 4 | Add `@fastify/rate-limit` | 2.4 | 2 hr |
| 5 | Add WebSocket authentication (token in query/header) | 2.5 | 4 hr |
| 6 | Add HTTP security headers | 2.6 | 1 hr |

### Phase 4 — Code Quality & Testing (Week 5-8)

| # | Task | Ref | Effort |
|---|------|-----|--------|
| 1 | Enable `noExplicitAny` and `noNonNullAssertion` in Biome at `warn` level | 8.4 | 1 hr |
| 2 | Extract shared `deepInsert` utility | 8.5 | 1 hr |
| 3 | Split `app.ts` standalone routes into separate files | 8.6 | 4 hr |
| 4 | Clean up simulation-server `@ts-ignore` usage | 8.2 | 2 hr |
| 5 | Make `pnpm audit` blocking in CI for critical CVEs | 9.4 | 30 min |
| 6 | Add route-level integration tests | 10.3 | 2-3 days |
| 7 | Add PBR lifecycle integration tests | 10.3 | 2 days |
| 8 | Add EX260Sx concurrency tests | 10.3 | 1 day |

---

## Summary

| Category | Critical | High | Medium | Low | Total |
|----------|----------|------|--------|-----|-------|
| Security (2.x) | 1 | 4 | 1 | 1 | 7 |
| Event Emitter (3.x) | 2 | 2 | 0 | 0 | 4 |
| ProgramBlockRunner (4.x) | 0 | 2 | 1 | 0 | 3 |
| IO Handlers (5.x) | 1 | 3 | 0 | 0 | 4 |
| Error Handling (6.x) | 3 | 4 | 3 | 0 | 10 |
| Resource Leaks (7.x) | 0 | 3 | 2 | 0 | 5 |
| TypeScript & Quality (8.x) | 0 | 0 | 2 | 2 | 4 |
| Infrastructure (9.x) | 0 | 0 | 2 | 1 | 3 |
| Test Coverage (10.x) | 0 | 0 | 1 | 0 | 1 |
| **Total** | **7** | **18** | **12** | **4** | **41** |

### vs. Previous Audit

| Metric | March 2026 | April 2026 | Change |
|--------|-----------|-----------|--------|
| Total issues | 66 | 41 | **-25 (-38%)** |
| Critical | 19 | 7 | **-12 (-63%)** |
| High | 27 | 18 | **-9 (-33%)** |
| Medium | 18 | 12 | **-6 (-33%)** |
| Low | 2 | 4 | +2 |

The most dangerous remaining issues are:
1. **No authentication** — anyone on the network can control hardware (2.1)
2. **Listener leaks in ContainerRegulation and IOGate** — unbounded memory growth (3.2, 3.3)
3. **EX260Sx deadlock risk** — `readData2()` can hang forever with mutex held (5.1)
4. **Unhandled `JSON.parse`** — can crash startup or route handlers (6.1-6.3)

Phase 0 and Phase 1 are mechanical fixes that can be completed in under a week. Phase 2 (IO safety) and Phase 3 (security) should follow before any feature work.
