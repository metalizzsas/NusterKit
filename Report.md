# NusterKit Codebase Audit Report

**Date**: 2026-03-12 (updated 2026-04-13)
**Scope**: Full codebase audit — security, architecture, race conditions, API type safety, error handling, concurrency, TypeScript strictness, infrastructure, coding standards
**Packages audited**: `@nuster/turbine`, `@nuster/ui`, `@nuster/simulation-server`, `@nuster/simulation-ui`
**Posture**: **Maximum strictness** — every finding is treated as a defect. Stability over convenience.

---

## Table of Contents

1. [Critical Security Vulnerabilities](#1-critical-security-vulnerabilities)
2. [Event Emitter — Race Conditions & Listener Leaks](#2-event-emitter--race-conditions--listener-leaks)
3. [ProgramBlockRunner — Race Conditions & Safety Issues](#3-programblockrunner--race-conditions--safety-issues)
4. [IO Handlers — Concurrency & Atomicity](#4-io-handlers--concurrency--atomicity)
5. [WebSocket & Fetch API — Type Safety & Reliability](#5-websocket--fetch-api--type-safety--reliability)
6. [Deprecated & Outdated Patterns](#6-deprecated--outdated-patterns)
7. [Code Quality Issues](#7-code-quality-issues)
8. [Error Handling Deficiencies](#8-error-handling-deficiencies)
9. [Resource Leaks & Shutdown Failures](#9-resource-leaks--shutdown-failures)
10. [TypeScript Strictness Violations](#10-typescript-strictness-violations)
11. [Infrastructure & Build Issues](#11-infrastructure--build-issues)
12. [Mandatory Coding Standards](#12-mandatory-coding-standards)
13. [Rewrite Roadmap](#13-rewrite-roadmap)

---

## 1. Critical Security Vulnerabilities

### 1.1 CRITICAL — Missing Authentication on All API Endpoints

**Files**: `packages/turbine/src/app.ts` (lines 181-357)

Every route in the turbine API is unauthenticated. Anyone with network access can:
- Read/write machine configurations (`GET/POST /config`)
- Control IO gates (`/v1/io/*`)
- Start/stop machine cycles (`/v1/cycle/*`)
- Reboot/shutdown the system (`GET /reboot`, `GET /shutdown`)
- Force software updates (`GET /forceUpdate`)

**Recommendation**: Implement JWT or token-based auth middleware on all routes. At minimum, add API key validation for machine-critical endpoints.

---

### 1.2 CRITICAL — Open CORS (All Origins Allowed)

**Files**:
- `packages/turbine/src/app.ts:165`
- `packages/simulation-server/src/server.ts:10`

```typescript
ExpressApp.use(cors()); // Allows ALL origins
```

Any website can make cross-origin requests to the API and control the machine.

**Recommendation**: Whitelist specific origins.

---

### 1.3 CRITICAL — SSRF in CallToAction

**Files**:
- `packages/turbine/src/routers/CallToAction.ts:37`
- `packages/ui/src/lib/utils/callToAction.ts:14`

The server fetches URLs stored in the database without validation:
```typescript
const ctaRequest = await fetch(`http://localhost:${process.env.PORT}${cta.api_endpoint}`, {
    method: cta.api_method,
    body: cta.api_body ?? undefined
});
```

**Recommendation**: Validate `api_endpoint` against an allowlist of known routes.

---

### 1.4 LOW — API Key Exposed in URL Query Strings

**Files**:
- `packages/turbine/src/app.ts:138, 143, 249, 262, 299`
- `packages/turbine/src/Machine.ts:95, 106`

```typescript
fetch(`${process.env.BALENA_SUPERVISOR_ADDRESS}/v2/state/status?apikey=${process.env.BALENA_SUPERVISOR_API_KEY}`)
```

> **Note**: The Balena Supervisor API key is regenerated on each container run. It is a short-lived, per-session token — not a persistent secret. This significantly reduces the risk of key leakage via URL query strings or server logs.

**Recommendation**: Pass keys via `Authorization` header if the Balena Supervisor supports it, but this is low priority given the ephemeral nature of the key.

---

### 1.5 HIGH — Hardcoded Default Password

**Files**: `packages/ui/src/routes/(connected)/settings/+page.server.ts:10, 34`

```typescript
if(password !== (env.PASSWORD ?? 'Nuster'))
```

- Default password `Nuster` hardcoded, no rate limiting, no lockout.

---

### 1.6 HIGH — Open Redirect via UIEndpoint

**Files**: `packages/ui/src/routes/(connected)/containers/[id]/+page.server.ts:90`

```typescript
if(callToAction.UIEndpoint)
    return redirect(302, callToAction.UIEndpoint); // No validation
```

---

### 1.7 MEDIUM — Error Information Disclosure

**Files**: `packages/turbine/src/app.ts:342`

```typescript
res.status(500).end(String(ex)); // Exposes stack traces
```

---

### 1.8 MEDIUM — No Rate Limiting, No Input Validation on IO Routes

No rate limiting middleware anywhere. IO routes (`IORouter.ts:83-104`) accept arbitrary float values with no range validation before writing to hardware.

---

## 2. Event Emitter — Race Conditions & Listener Leaks

### 2.1 Architecture Overview

The entire turbine backend communicates through a single `TurbineEventLoop` (Node.js `EventEmitter` subclass, max 300 listeners). It carries **50+ event types** across IO, containers, PBR, maintenance, logging, and modals.

**Definition**: `packages/turbine/src/events/eventLoop.ts`
**Instance**: `packages/turbine/src/events/index.ts`

The event loop is typed via `EventLoopEvents` interface (good), but the fundamental architecture creates tight coupling and makes race conditions inevitable.

#### Alternatives to the Global Event Emitter

| Approach | How it works | Pros | Cons |
|----------|-------------|------|------|
| **Direct method calls with DI** | Components receive typed references to their dependencies at construction. PBR calls `ioBus.write(gate, value)` instead of emitting `io.update.gate`. | Simplest to reason about; full type safety; no listener leaks; stack traces show the real call chain. | Requires an explicit wiring layer (a composition root or DI container). Can create circular dependency issues if not carefully structured. |
| **Reactive streams (RxJS Observables)** | Replace events with typed Observable streams. Each subsystem exposes an `Observable<T>` that consumers subscribe to. Subscriptions are disposed via `takeUntil(destroy$)`. | Built-in operators for debounce, throttle, combineLatest, race conditions. Subscriptions are composable and auto-cleanable. | Adds a runtime dependency (~40KB). Steeper learning curve. Debugging operator chains can be opaque. |
| **Actor model (e.g. xstate, or lightweight custom)** | Each subsystem (PBR, IO, Regulation) is a state machine with a typed message inbox. Communication is via `actor.send(message)`. | Eliminates impossible state transitions by design; makes concurrency explicit; each actor processes messages sequentially (no races). | Significant architectural shift. xstate has a learning curve. Custom actor implementations can be under-featured. |
| **Message bus with typed channels (e.g. mitt, emittery)** | Similar to EventEmitter but with stricter typing, no global singleton, and scoped instances per subsystem. | Low migration cost from current EventEmitter. Better typing than Node.js EventEmitter. Can scope per-PBR-instance. | Doesn't solve the fundamental decoupling issues — still event-driven with implicit dependencies. |
| **Command/Query pattern (CQRS-lite)** | Writes go through a `CommandBus.dispatch(command)` with explicit handlers. Reads are direct method calls. | Clear separation of reads and writes; easy to add middleware (logging, validation, locking) around commands. | More boilerplate. Over-engineered for simple point-to-point communication. |

**Recommendation**: For NusterKit's scale and constraints (embedded system, single-process Node.js), **direct method calls with DI** is the best fit. It eliminates the entire class of listener leaks and ordering bugs with zero runtime dependencies. The Phase 2 roadmap already proposes this architecture (IOBus, PBREngine, RegulationController with explicit method calls). For subsystems that genuinely need pub/sub (e.g., status broadcasting to WebSocket clients), use a scoped, typed emitter like `emittery` rather than a global bus.

---

### 2.2 CRITICAL — `removeAllListeners()` Destroys Global State

**File**: `packages/turbine/src/pbr/ProgramBlockRunner.ts:220-232`

```typescript
private disposeEvents() {
    TurbineEventLoop.removeAllListeners('pbr.profile.read');
    TurbineEventLoop.removeAllListeners('pbr.timer.exists');
    TurbineEventLoop.removeAllListeners('pbr.timer.start');
    TurbineEventLoop.removeAllListeners('pbr.timer.stop');
    // ... 8 more removeAllListeners calls
}
```

This removes **ALL** listeners for these events globally, not just the ones registered by this PBR instance. If any other part of the system listens to these events, their listeners are destroyed silently.

**Impact**: Impossible to run concurrent PBR instances. Even sequential runs risk a window where listeners from the new PBR are removed by the old one's disposal.

**Recommendation**: Store listener references and use `removeListener(event, ref)` instead. Or use an `AbortController`-based pattern for scoped listener cleanup.

---

### 2.3 CRITICAL — Listener Memory Leaks (8 Patterns)

Listeners are registered in constructors and **never removed**. Over time, especially across multiple PBR runs, listener count grows unbounded.

| Location | Listeners/instance | Cleanup? |
|----------|-------------------|----------|
| `ProgramBlock.ts:18-22` | 4 (`pbr.stop`, `pbr.status.update`, `pbr.pause`, `pbr.resume`) | Never removed |
| `ProgramBlockStep.ts:81-104` | 3+ (`pbr.step.${name}.stop`, `pbr.pause`, `pbr.resume`) | Never removed |
| `ContainerRegulation.ts:85-110` | 2+ per regulation (`io.updated.*`) | Never removed |
| `Containers.ts:50-56` | 1 per sensor (`io.updated.*`) | Never removed |
| `SensorMaintenance.ts:28-35` | 2-3 (`io.updated.*`, `maintenance.read.*`) | Never removed |
| `IOGate.ts:45-57` | 1 per gate (`io.update.*`) | Never removed |
| `IOReadParameterBlock` | 1 per block (`io.updated.*`) | Never removed |
| `ReadVariableParameterBlock` | 1 per block (`pbr.variable.write`) | Never removed |

**Concrete impact**: A PBR with 15 steps, each containing 3 program blocks = ~60 leaked listeners per run. After 10 runs: 600 orphaned listeners still firing on every event.

**Recommendation**: Implement a `Disposable` pattern. Each class that registers listeners must implement `dispose()` that removes them. Use `AbortSignal` or a `DisposableGroup` to automate cleanup.

---

### 2.4 HIGH — Callback-Based Promises Can Deadlock

**File**: `packages/turbine/src/pbr/ProgramBlockRunner.ts:160-162`

```typescript
await new Promise<void>(resolve => {
    TurbineEventLoop.emit(`io.update.${gate}`, { value, callback: () => resolve() });
});
```

If no listener handles `io.update.${gate}`, or if the listener throws before calling `callback()`, this promise **never resolves**. The PBR hangs forever.

**Affected patterns**:
- IO writes from PBR (`io.update.*`)
- IO snapshot requests (`io.snapshot`)
- IO reset (`io.resetAll`)
- Variable reads (`pbr.variable.read`)
- Timer existence checks (`pbr.timer.exists`)
- Regulation state reads (`container.*.regulation.*.get_state`)

**Recommendation**: Add timeouts to all callback-based promise patterns:
```typescript
await Promise.race([
    new Promise<void>(resolve => { TurbineEventLoop.emit(..., { callback: resolve }); }),
    new Promise<void>((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000))
]);
```

---

### 2.5 HIGH — PBRSecurityCondition Listener Removal Fails Silently

**File**: `packages/turbine/src/pbr/PBRSecurityCondition.ts:84-89`

```typescript
// In dispose():
TurbineEventLoop.removeListener('pbr.status.update', this.pbrStateListener);
```

`this.pbrStateListener` is a method reference, but the listener was registered with a bound version or inline arrow. `removeListener` compares by reference — this will **silently fail**, leaving the listener active after disposal.

**Impact**: Security condition callbacks fire on disposed PBR instances, potentially calling `pbr.stop` on a PBR that already ended.

---

### 2.6 MEDIUM — Events Emitted Before Listeners Ready

Machine variable listeners are registered in the `Machine` constructor (`Machine.ts:86`), but PBR events can be emitted immediately. If a PBR reads a machine variable before `Machine` finishes constructing, the event has no listener.

---

### 2.7 MEDIUM — Circular Event Cascades

Several event chains form cycles:
1. `io.updated.X` → ContainerRegulation → `io.update.Y` → IOGate → `io.updated.Y` → ...
2. `pbr.stop` → PBR.end() → `pbr.status.update` → state handlers → may emit more events
3. Container sensor → `io.updated.*` → Container.unloadProduct() → `container.updated.*`

No infinite loops observed (state guards prevent re-entry), but cascading state changes across the system are hard to reason about and debug.

---

## 3. ProgramBlockRunner — Race Conditions & Safety Issues

### 3.1 Architecture Overview

The PBR executes machine cycles as a sequence of steps. Each step contains program blocks (IO writes, sleeps, loops, conditionals). Security conditions monitor IO gates and can abort execution.

**Key files**:
- `packages/turbine/src/pbr/ProgramBlockRunner.ts` — Cycle lifecycle
- `packages/turbine/src/pbr/ProgramBlockStep.ts` — Step execution
- `packages/turbine/src/pbr/PBRSecurityCondition.ts` — Safety guards
- `packages/turbine/src/pbr/ProgramBlocks/` — Individual block implementations
- `packages/turbine/src/pbr/ParameterBlocks/` — Dynamic value resolution

---

### 3.2 CRITICAL — `setInterval` Leak in IOWriteProgramBlock

**File**: `packages/turbine/src/pbr/ProgramBlocks/machine/IOWriteProgramBlock.ts:55-58`

```typescript
// Retry timeout at 2000ms
setTimeout(() => {
    if(this.executed !== true) {
        TurbineEventLoop.emit("pbr.stop", "controllerError");
    }
}, 2000);

// Watchdog interval — NEVER CLEARED
setInterval(() => {
    if(signal?.aborted === true && this.executed !== true) {
        resolve();
    }
}, 250);
```

This `setInterval` runs **forever** — it is never cleared, even after the promise resolves. Each IO write operation during a cycle leaks one interval. A cycle with 50 IO writes = 50 leaked intervals polling every 250ms indefinitely.

Additionally, the `setTimeout` at 1000ms can trigger a retry that races with the original write, causing duplicate hardware commands.

**Impact**: Memory leak, CPU waste, potential double-writes to hardware.

**Recommendation**: Store interval ID and clear it in all exit paths. Use `AbortSignal` to cancel timers.

---

### 3.3 CRITICAL — Security Guard Check-Then-Act Race

**File**: `packages/turbine/src/pbr/PBRSecurityCondition.ts:62-66`

```typescript
this.#statusBlock.subscribe((data) => {
    if(this.disabledFlag === true) return;   // Check 1
    this.state = data;                       // Update
    if(this.state === "error" && this.#pbrState === "started")  // Check 2
        this.subscriber?.(this.toJSON());    // Action
});
```

Between the guard checks and the subscriber callback:
- The PBR could transition to "paused" or "ending"
- `this.disabledFlag` could be set to `true` by `dispose()`
- The subscriber calls `pbr.stop` which triggers cascading state changes

**Risk**: Security violation reported after PBR has already stopped/paused. In the worst case, a stop event fires during disposal, operating on stale state.

**At the step level** (`ProgramBlockStep.ts:74-76`): Step security conditions call `step.crash()` via callback. If the step has already ended normally between the guard check and the callback execution, `crash()` is a no-op (guard: `state !== "started"`). But the crash event was already emitted.

---

### 3.4 HIGH — AbortController Reset During Execution

**File**: `packages/turbine/src/pbr/ProgramBlockStep.ts:123-127`

```typescript
if(this.type === "multiple" && this.runCount > 0) {
    this.stepRuncontroller = new AbortController();  // NEW controller
    this.endReason = undefined;
}
```

For "multiple" type steps (loops), the `AbortController` is replaced on each iteration. But if program blocks from the previous iteration are still executing asynchronously when the new iteration starts, they hold a reference to the **old** signal. A crash/end targeting the new controller won't abort those in-flight blocks.

**Impact**: Zombie blocks from previous iterations continue executing after the step has moved on.

---

### 3.5 HIGH — Step Overtime Timer Ignores Ongoing Pauses

**File**: `packages/turbine/src/pbr/ProgramBlockStep.ts:135-144`

```typescript
this.stepOvertimeTimer = setTimeout(() => {
    if(this.state === "started") {
        TurbineEventLoop.emit("pbr.stop", "overtime");
    }
}, (this.duration * 2 * 1000) + this.overallPausedTime);
```

`overallPausedTime` is computed **once** when the timer is set. If the cycle pauses **after** the timer is created, the timeout doesn't extend. The timer fires while the step is paused, triggering a false overtime stop.

**Recommendation**: Cancel and recreate the overtime timer on pause/resume.

---

### 3.6 HIGH — Pause/Resume IO Snapshot Race

**File**: `packages/turbine/src/pbr/ProgramBlockRunner.ts:125-130`

```typescript
// Pause:
TurbineEventLoop.emit('io.snapshot', { callback: (snapshot) => {
    this.ioSnapshot = snapshot;
}});
TurbineEventLoop.emit('io.resetAll');  // Fires BEFORE snapshot callback may complete
this.pauseStartDate = Date.now();      // Set AFTER both emits
```

The `io.resetAll` event fires immediately after `io.snapshot`. If `io.resetAll` is handled before the snapshot callback executes, the snapshot captures **post-reset** values (all zeros) instead of pre-pause values.

On resume (`lines 156-169`):
```typescript
TurbineEventLoop.emit(`io.update.${gate}`, { value: this.ioSnapshot[gate] });
```
Restores from a potentially empty/wrong snapshot, resulting in wrong IO state after resume.

---

### 3.7 MEDIUM — ForProgramBlock Caches Loop Limit

**File**: `packages/turbine/src/pbr/ProgramBlocks/flow/ForProgramBlock.ts:35-39`

```typescript
const loopCount = this.limit.data;  // Resolved ONCE
for (; this.currentIteration < loopCount; this.currentIteration++) {
    // limit.data could change during loop if backed by a dynamic ParameterBlock
```

If `limit` is a `ReadVariableParameterBlock` and a `pbr.variable.write` event changes the variable mid-loop, the loop count doesn't update. This is probably intentional, but it's a semantic inconsistency — the variable appears to be dynamic but isn't.

---

### 3.8 MEDIUM — StartTimerProgramBlock Race on Timer Existence

**File**: `packages/turbine/src/pbr/ProgramBlocks/flow/StartTimerProgramBlock.ts:33-52`

```typescript
TurbineEventLoop.emit("pbr.timer.exists", { timerName, callback: (exists: boolean) => {
    if (exists === true) return;
    const timer = setInterval(async () => { ... }, timerInterval * 1000);
    TurbineEventLoop.emit("pbr.timer.start", { name: timerName, timer, enabled: true });
}});
```

The callback is synchronous within the emit, but if two `StartTimerProgramBlock`s with the same name execute in quick succession, both callbacks check existence, both see `false`, and both create duplicate intervals.

---

## 4. IO Handlers — Concurrency & Atomicity

### 4.1 Architecture Overview

IO gates are the bridge between software and physical hardware (valves, sensors, heaters). Three independent paths can write to the same gate simultaneously:
1. **API routes** (`IORouter.ts`) — manual user control
2. **PBR cycle** (`IOWriteProgramBlock`) — automated cycle execution
3. **ContainerRegulation** (`ContainerRegulation.ts`) — PID-like temperature control

There are **no mutexes, locks, or write queues** anywhere in the IO system.

---

### 4.2 CRITICAL — EX260Sx Read-Modify-Write is Not Atomic

**File**: `packages/turbine/src/io/IOHandlers/EX260Sx.ts:146-193`

The EX260Sx handler manipulates individual bits within 16-bit hardware registers. Each bit write requires:
1. Read the full register from hardware
2. Modify the target bit in memory
3. Write the full register back

```
Scenario: Two concurrent writes to different bits of the same register

T0: Gate1.write() reads register = 0x0000
T1: Gate2.write() reads register = 0x0000  (same stale value!)
T2: Gate1 sets bit 0:  value = 0x0001
T3: Gate2 sets bit 1:  value = 0x0002
T4: Gate1 writes 0x0001 to hardware
T5: Gate2 writes 0x0002 to hardware  ← Gate1's bit is LOST
```

**Impact**: Silent data corruption on hardware outputs. Bits can be randomly cleared, causing valves/heaters to turn off unexpectedly during a cycle.

**Recommendation**: Implement a per-register mutex so only one RMW operation can execute at a time.

---

### 4.3 CRITICAL — API Writes Bypass Lock Mechanism

**File**: `packages/turbine/src/routers/IORouter.ts:83-104`

```typescript
this.router.post("/:name/:value", async (req, res) => {
    // ...
    await gate.write(value);  // Direct write, NO lock check
});
```

The `locked` flag on IOGate exists but is **only used for snapshot exclusion** during pause. API writes completely ignore it. During a regulated cycle:

```
T0:  ContainerRegulation sets HeaterPlus=1 with lock=true
T1:  User sends POST /io/HeaterPlus/0
T2:  API calls gate.write(0) directly — lock ignored
T3:  HeaterPlus = 0, regulation state inconsistent
T10: Next regulation loop (10s later) reasserts HeaterPlus=1
```

**Impact**: Manual overrides during regulation create 10-second glitches. Worse, during a PBR cycle, API writes can fight with cycle writes in a ping-pong pattern.

**Recommendation**: Check `gate.locked` in the API route. Reject writes to locked gates with `409 Conflict` by default. Add a `?force=true` query parameter to allow explicit lock override when the operator intentionally needs to bypass the lock (e.g., emergency manual control):

```typescript
this.router.post("/:name/:value", async (req, res) => {
    const gate = this.gates.find(g => g.name === req.params.name);
    if (gate.locked && req.query.force !== "true") {
        return res.status(409).json({ error: "Gate is locked", hint: "Use ?force=true to override" });
    }
    await gate.write(value);
});
```

---

### 4.4 HIGH — IOGate Read/Write Has No Synchronization

**File**: `packages/turbine/src/io/IOGates/IOGate.ts:60-86`

```typescript
async write(data: number): Promise<boolean> {
    await this.writetoController(data, word);
    this.value = data;                              // State update
    TurbineEventLoop.emit(`io.updated.${this.name}`, this.toJSON());  // Broadcast
    return true;
}
```

Between `writetoController` completing and `this.value` being updated, another caller can read `this.value` and get the **old** value. The IO scanner (running every 500ms) could read a gate mid-write, broadcasting a stale value to the WebSocket.

---

### 4.5 HIGH — Regulation Loop Has No Overlap Protection

**File**: `packages/turbine/src/containers/ContainerRegulation.ts:112`

```typescript
setInterval(this.regulationLoop.bind(this), 10000);
```

If `regulationLoop()` takes more than 10 seconds (e.g., due to slow hardware communication), the next invocation starts while the previous one is still running. Both iterate over the same actuators and issue competing writes.

Additionally, the regulation loop is **never cleared** — it runs for the lifetime of the process, even when regulation is disabled (`this.state === false` just makes it return early, but the interval keeps firing).

---

### 4.6 MEDIUM — IO Scanner Can Stall on Single Gate

**File**: `packages/turbine/src/routers/IORouter.ts:117-123`

```typescript
this.timer = setInterval(async () => {
    for(const g of this.gates.filter((g) => g.bus == "in")) {
        await g.read();  // Sequential, blocking
    }
}, this.ioScannerInterval);
```

Each gate is read sequentially. If one gate's hardware read hangs (timeout, network issue), all subsequent gates are blocked. No per-read timeout exists.

---

### 4.7 MEDIUM — Hardware Failure Silent Propagation

**WAGO** (`WAGO.ts:74-98`): If `this.unreachable` is true, emits `pbr.stop` with "controllerUnreachable" but returns `void` — the caller (`IOGate.writetoController`) doesn't know the write failed and proceeds to update `this.value`.

**EX260Sx** (`EX260Sx.ts:134`): Throws a string `"EX260Sx: Unreachable"` (not an Error object). This propagates up through `IOGate.write()` which has no try/catch, causing an unhandled rejection in the IO scanner.

---

## 5. WebSocket & Fetch API — Type Safety & Reliability

### 5.1 Architecture Overview

- **WebSocket**: Turbine broadcasts a `Status` snapshot to all UI clients every 500ms
- **Fetch API**: UI uses `fetch()` in SvelteKit server hooks and `+page.server.ts` files to call turbine. **~45+ fetch call sites**, all untyped at the boundary.
- **No shared type contract**: Types are defined in turbine and imported by UI as a devDependency, but there is no runtime validation.

---

### 5.2 CRITICAL — UI Blindly Trusts Turbine Type Exports (No Runtime Contract)

The UI package imports TypeScript interfaces directly from `@nuster/turbine` as a `devDependency` and uses them as `as` casts on raw `fetch()` responses. This creates a **false sense of type safety** — the types are checked at compile time but have **zero runtime enforcement**.

**The coupling**: 30+ files across `ui` and `simulation-ui` import types from deep internal paths in turbine:

```typescript
// hooks.server.ts — runs on EVERY page load
import type { Status } from "@nuster/turbine/types";
import type { MachineData } from "@nuster/turbine/types/hydrated/machine";

const response = await fetch(`http://${TURBINE_ADDRESS}/machine`);
machineData = await response.json() as MachineData;  // ← compile-time lie
```

**Why this is dangerous**:
1. The `as MachineData` cast tells TypeScript "trust me, this is a `MachineData`" — but the compiler **never checks the actual HTTP response**
2. If turbine adds a field, renames a field, changes a type from `string` to `number`, or makes a field nullable — TypeScript **will not catch it**. The UI compiles fine but crashes or renders garbage at runtime
3. The UI imports from 8+ deep internal paths (`types/hydrated`, `types/hydrated/machine`, `types/hydrated/io`, `types/hydrated/cycle`, `types/hydrated/containers`, `types/spec/nuster`, `types/spec/cycle`, `types/spec/iogates`, `types/docs`, `types/utils`) — making turbine's internal file structure a public API surface that cannot be refactored
4. The dependency is a `devDependency` at a pinned version (`"@nuster/turbine": "2.3.4"`), meaning the types can silently drift from the actual running turbine version

**Affected imports** (complete list):

| Import path | Consumer files |
|-------------|---------------|
| `@nuster/turbine/types` | `hooks.server.ts`, `app.d.ts`, `nuster.ts`, `configure/+page.server.ts`, `settings/edit/+page.server.ts` |
| `@nuster/turbine/types/hydrated` | `+page.server.ts` (3 files), `state.ts`, `maintenances/+layout.server.ts`, `settings/+page.server.ts` |
| `@nuster/turbine/types/hydrated/machine` | `hooks.server.ts`, `app.d.ts`, `settings/+page.server.ts` |
| `@nuster/turbine/types/hydrated/io` | `gate.svelte` (ui), `gate.svelte` + `element.svelte` (simulation-ui) |
| `@nuster/turbine/types/hydrated/cycle` | `CycleStep.svelte` |
| `@nuster/turbine/types/hydrated/containers` | `ContainerRegulation.svelte` |
| `@nuster/turbine/types/spec/nuster` | `callToAction.ts`, `Toast.svelte`, `+layout.svelte` |
| `@nuster/turbine/types/spec/cycle` | `+page.server.ts` |
| `@nuster/turbine/types/spec/iogates` | `+page.server.ts` (simulation-ui) |
| `@nuster/turbine/types/docs` | `help/+page.server.ts` |
| `@nuster/turbine/types/utils` | `ContainerRegulation.svelte` |

**Recommendation**: Replace this pattern entirely with **OpenAPI + openapi-fetch**:

1. **Turbine side**: Add Swagger/OpenAPI spec generation (e.g., `swagger-jsdoc` or `@asteasolutions/zod-to-openapi`) to the turbine Express app. Every route gets a typed schema that describes the actual response shape. This is the **single source of truth**.

2. **UI side**: Replace raw `fetch()` + `as Type` with `openapi-fetch`, a zero-overhead typed fetch client generated from the OpenAPI spec. The types come from the spec, not from importing turbine internals.

3. **Remove the dependency**: The UI no longer needs `@nuster/turbine` as a dependency at all — not even as a devDependency. The API contract is defined by the OpenAPI spec, not by importing TypeScript interfaces from the server package.

```typescript
// Before: import types from turbine, cast blindly
import type { ProfileHydrated } from "@nuster/turbine/types/hydrated";
const profiles = await fetch("/v1/profiles").then(r => r.json()) as ProfileHydrated[];

// After: types generated from OpenAPI spec, response validated
import createClient from "openapi-fetch";
import type { paths } from "./generated/api";  // generated from turbine's OpenAPI spec

const client = createClient<paths>({ baseUrl: `http://${TURBINE_ADDRESS}` });
const { data, error } = await client.GET("/v1/profiles");
// data is typed AND validated — no cast needed, errors are explicit
```

**Benefits**:
- **Runtime safety**: The spec defines what the API actually returns, not what we hope it returns
- **Decoupled packages**: UI and turbine communicate through a spec, not through shared source code
- **Version-safe**: If turbine changes a response shape, the spec changes, the generated types change, and the UI gets a compile error — instead of a silent runtime bug
- **Auto-documentation**: Swagger UI gives free interactive API docs at `/api-docs`
- **Catch drift**: CI can validate that the running turbine matches the spec (contract testing)

---

### 5.3 HIGH — No Fetch Error Handling on Most GET Requests

**Pattern observed**: Most GET fetches have **zero error handling**:

```typescript
// hooks.server.ts:48 — runs on EVERY page load
const [settingsResponse, realtimeResponse] = await Promise.all([
    fetch(`http://${TURBINE_ADDRESS}/settings`),      // No try-catch
    fetch(`http://${TURBINE_ADDRESS}/realtime`)        // No try-catch
]);
```

If turbine is temporarily unreachable (restart, network hiccup), every page load crashes with an unhandled fetch error.

**Other unhandled GETs**:
- Profile list, premade list, maintenance list, help files, changelog, machine data, IO data

**Recommendation**: Wrap all fetches in try-catch. Return fallback data or error states for GET requests.

---

### 5.4 HIGH — WebSocket Broadcast Can Stack Up

**File**: `packages/turbine/src/app.ts:394-397`

```typescript
setInterval(async () => {
    if(machine !== undefined && websocketDispatcher !== undefined)
        websocketDispatcher.broadcastData(await machine.socketData(), "status");
}, 500);
```

If `machine.socketData()` takes >500ms (e.g., many containers, slow DB queries), the next interval fires while the previous `await` is still pending. Multiple concurrent broadcasts stack up, consuming memory and potentially sending out-of-order updates.

**Recommendation**: Use a flag to skip broadcasts while the previous one is still in-flight:
```typescript
let broadcasting = false;
setInterval(async () => {
    if (broadcasting) return;
    broadcasting = true;
    try { /* broadcast */ } finally { broadcasting = false; }
}, 500);
```

#### Alternative: Redis Pub/Sub Instead of WebSocket Polling

The current architecture uses a `setInterval` polling loop to push status to WebSocket clients every 500ms, regardless of whether state actually changed. An alternative approach is to use **Redis Pub/Sub** as the transport layer:

| Aspect | Current (WebSocket + polling) | Redis Pub/Sub |
|--------|-------------------------------|---------------|
| **When data is sent** | Every 500ms, even if nothing changed | Only when state actually changes |
| **Multiple server instances** | Not supported — single-process broadcasting | Natively supports fan-out across multiple turbine processes |
| **Backpressure** | None — broadcasts stack up if slow | Redis handles buffering; clients receive at their own pace |
| **Complexity** | Low — just a setInterval | Adds Redis as infrastructure dependency |
| **Latency** | Fixed 500ms max (polling interval) | Near-instant — publish on state change |

**How it would work**:
1. When IO state, PBR status, or container state changes, publish a message to a Redis channel (`nuster:status`)
2. A lightweight subscriber process (or the same process) reads from the channel and pushes to WebSocket clients
3. Optionally, use Redis Streams instead of Pub/Sub for durability and replay capability

**Verdict**: Redis Pub/Sub eliminates the polling anti-pattern and gives event-driven updates with lower latency. However, it adds Redis as a runtime dependency, which is significant for an embedded system running on Balena. **If the system already runs Redis** (e.g., for caching or session storage), this is a clear win. If not, the overhead of managing a Redis container may not justify the improvement — in that case, the simpler fix (in-flight flag + event-driven broadcasting instead of polling) is more appropriate.

---

### 5.5 MEDIUM — WebSocket Has No Heartbeat or Reconnection

**Server** (`WebsocketDispatcher.ts`): No ping/pong frames. Stale connections (client disconnected without close frame) accumulate and receive broadcast attempts that fail silently.

**Client** (`+layout.svelte:55-78`): On `onerror` or `onclose`, the websocket is set to null and the UI shows "disconnected". **No automatic reconnection**. The user must manually reload the page.

**Recommendation**: Implement ping/pong heartbeat server-side (every 30s). Add exponential-backoff reconnection on the client.

---

### 5.6 MEDIUM — Popup Promise.all Has No Error Handling

**File**: `packages/turbine/src/websocket/WebsocketDispatcher.ts:55`

```typescript
Promise.all<CallToActionFront>(
    (popup.callToActions ?? []).map(cta => CalltoActionRouter.generateCallToAction(cta))
).then(v => {
    this.broadcastData({...popup, callToActions: v }, "popup");
});
// No .catch() — unhandled rejection if any CTA generation fails
```

---

### 5.7 LOW — Sequential Fetches Where Parallel is Possible

Multiple `+page.server.ts` files make independent fetches sequentially:

```typescript
// settings/+page.server.ts — 3 independent requests, all sequential
const req = await fetch(`/machine`);
const reqCycleCount = await fetch(`/v1/maintenances/cycleCount`);
const changelogRequest = await fetch(`/static/CHANGELOG.md`);
```

**Recommendation**: Use `Promise.all()` for independent requests.

---

## 6. Deprecated & Outdated Patterns

### 6.1 Node.js 18 — End of Life (April 2025)

All Dockerfiles except `simulation-ui` use `node:18-alpine`. Upgrade to Node.js 22 LTS.

### 6.2 ESLint 8 + Prettier — Replace with Biome

All packages use `.eslintrc.json` (ESLint 8, deprecated) and Prettier for formatting. Replace both with **Biome**, a single tool that handles linting and formatting with near-zero configuration.

**Why Biome over ESLint 9**:
- Single tool replaces ESLint + Prettier (fewer devDependencies, no plugin conflicts)
- Written in Rust — 10-100x faster than ESLint on large codebases
- Opinionated defaults that cover most of ESLint's recommended rules + Prettier formatting
- First-class TypeScript and JSX support out of the box

**Setup**: Place `biome.json` at the monorepo root to enforce consistent rules across all packages:

```jsonc
// biome.json (monorepo root)
{
    "$schema": "https://biomejs.dev/schemas/2.0.0/schema.json",
    "organizeImports": {
        "enabled": true
    },
    "linter": {
        "enabled": true,
        "rules": {
            "recommended": true,
            "suspicious": {
                "noExplicitAny": "warn",
                "noConsole": "warn"
            },
            "style": {
                "useConst": "error",
                "noVar": "error"
            },
            "correctness": {
                "noUnusedVariables": "warn",
                "noUnusedImports": "error"
            }
        }
    },
    "formatter": {
        "enabled": true,
        "indentStyle": "tab",
        "lineWidth": 120
    },
    "javascript": {
        "formatter": {
            "quoteStyle": "double",
            "semicolons": "always"
        }
    }
}
```

**Migration steps**:
1. `npm install --save-dev --workspace-root @biomejs/biome`
2. Create `biome.json` at monorepo root
3. Remove per-package `.eslintrc.json`, `.prettierrc`, and related devDependencies
4. Replace `lint`/`format` scripts with `biome check --write .`
5. Run `biome check --write .` once to auto-fix formatting across the codebase
6. Add `biome check` to CI pipeline

### 6.3 Svelte 4 → Svelte 5

Current: `svelte@^4.2.17`. Svelte 5 runes (`$state`, `$derived`, `$effect`) replace reactive `$:` and stores with better TypeScript support and performance.

### 6.4 TailwindCSS v3 → v4

Current: `tailwindcss@^3.4.3`. v4 brings CSS-first config and performance improvements.

### 6.5 CommonJS Config Files

`packages/ui/postcss.config.cjs` and `tailwind.config.cjs` use `require()`/`module.exports`. Convert to ESM.

### 6.6 Minor Code Patterns

- `instanceof Array` instead of `Array.isArray()` — `state.ts:11,87`, `MaintenanceStatusParameterBlock.ts:19`
- Loose equality (`==`/`!=`) — `WAGO.ts:90,118`, `Cycle.svelte:75-77`, `state.ts:43`
- Promise chains instead of async/await — `Machine.ts:95-116`

---

## 7. Code Quality Issues

### 7.1 Console.log in Production

9 instances across `PasswordField.svelte`, `Select.svelte`, `simulationMachine.ts`, `modbus.ts`, `server.ts`.

### 7.2 `@ts-ignore` Directives

7 instances across `ProgramBlockStep.ts:175`, `enip.ts:44`, `modbus.ts:18`, `simulationMachine.ts:49,77,82,87`. Each one hides a real type error that must be resolved with proper types.

### 7.3 `any` Types

| File | Line | Code | Fix |
|------|------|------|-----|
| `deepInsert.ts` (turbine) | 53 | `...value as any` | Use proper generic constraint |
| `deepInsert.ts` (simulation-server) | 14, 50 | `let tempObj: MachineSpecs \| any` | Remove `any` union |
| `server.ts` (simulation-server) | 19 | `Request<any, any, ...>` | Type the params generics |

### 7.4 Duplicate Code

`deepInsert.ts` exists identically in both `turbine` and `simulation-server`. Extract to shared package.

### 7.5 Large Files

- `app.ts` (445 lines) — mixes Express setup, config, file I/O, update logic
- `NetworkRouter.ts` (398 lines) — deeply nested D-Bus async
- `ProgramBlockRunner.ts` (466 lines) — entire cycle lifecycle
- `Cycle.svelte` (11.4K) — logic and presentation mixed

### 7.6 TypeScript Not Fully Strict

`noUnusedLocals`, `noUnusedParameters`, `noImplicitReturns` all commented out in tsconfig.

### 7.7 HIGH — Unsafe Type Assertions

| File | Line | Code | Risk |
|------|------|------|------|
| `CycleRouter.ts` | 129 | `this.program as unknown as ProgramBlockRunnerHydrated` | Double assertion chain — bypasses type system entirely |
| `NetworkRouter.ts` | 143-144 | `addresses[1][0][0][0][1][1][0] as string` | Deep nested access with cast — crashes on shape change |
| `ProfilesRouter.ts` | 59 | `cta.APIEndpoint?.body as string` | Cast on optional value |
| All `+page.server.ts` | multiple | `await req.json() as Type` | 45+ unvalidated JSON casts across UI |

### 7.8 MEDIUM — Missing Return Types on Public Methods

| File | Method | Implicit return |
|------|--------|----------------|
| `PT100Gate.ts:19` | `public async read()` | `Promise<boolean>` |
| `PT100Gate.ts:28` | `public async write()` | `Promise<boolean>` |
| `MappedGate.ts:29` | `public async read()` | `Promise<boolean>` |
| `MappedGate.ts:40` | `public async write(data: number)` | `Promise<boolean>` |

---

## 8. Error Handling Deficiencies

### 8.1 CRITICAL — Unhandled Promise Rejections (Floating Promises)

Every floating promise is a silent failure. In a machine controller, silent failures can cause physical damage.

| # | File | Line | Code | Impact |
|---|------|------|------|--------|
| 1 | `WebsocketDispatcher.ts` | 55 | `Promise.all(...).then(v => { ... })` — no `.catch()` | Popup CTAs silently fail, clients never notified |
| 2 | `app.ts` | 120 | `fetch(...simulation.../config)` — floating, no await/catch | Simulation config push silently fails |
| 3 | `Containers.ts` | 86, 102, 127 | `this.socketData().then(...)` — 3 instances, no `.catch()` | Container state events silently lost |
| 4 | `CountableMaintenance.ts` | 23 | `super.checkTracker().then(...)` — no `.catch()` | Maintenance duration stuck in undefined state |
| 5 | `SensorMaintenance.ts` | 37 | `super.checkTracker().then(...)` — no `.catch()` | Duration progress permanently -1 |
| 6 | `SensorMaintenance.ts` | 49 | `void prisma.maintenance.update(...)` — deliberately fire-and-forget | DB out-of-sync with in-memory state |
| 7 | `ProfilesRouter.ts` | 29 | `prisma.profile.deleteMany(...).then(...)` — no `.catch()` | Premade profiles silently fail to load |
| 8 | `Machine.ts` | 95-116 | Nested `.then()` chains — inner `res.json()` failure swallowed | Hypervisor data silently stale |

**Rule**: Every `Promise` must be either `await`ed or have a `.catch()` handler. No exceptions.

---

### 8.2 CRITICAL — JSON.parse Without Try/Catch

**File**: `app.ts:96, 107`

```typescript
const parsedConfiguration = JSON.parse(rawConfiguration) as Configuration;
const parsedSpecs = JSON.parse(rawSpecs) as MachineSpecs;
```

If either JSON file is corrupted (partial write, disk error, manual edit mistake), the entire application crashes on startup with no recovery.

**Recommendation**: Wrap in try/catch, log the error, and fall back to a known-good default or refuse to start with a clear error message.

---

### 8.3 CRITICAL — Async Express Routes Without Try/Catch

Every `async (req, res) => { ... }` handler that throws leaves the HTTP response hanging forever (Express does not catch async errors by default).

| File | Route | Unguarded async call |
|------|-------|---------------------|
| `ContainersRouters.ts:23` | `POST /:container/load/:series` | `await container.loadProduct(...)` |
| `ContainersRouters.ts:38` | `POST /:container/unload` | `await container.unloadProduct()` |
| `ContainersRouters.ts:55` | `POST /:container/regulation/:name/state/:state` | `await` event emit callback |
| `ContainersRouters.ts:65` | `POST /:container/regulation/:name/target/:target` | `await` event emit callback |
| `IORouter.ts:83` | `POST /:name/:value` | `await gate.write(value)` |
| `app.ts:215` | `POST /config` | File system writes |

**Recommendation**: Add a global async error-catching middleware or wrap every handler:
```typescript
const asyncHandler = (fn: RequestHandler) => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);
```

---

### 8.4 CRITICAL — Zero Validation on All 37 API Routes

The turbine Express app has **37 routes across 8 routers** with **zero schema validation** on any request body, route parameter, query parameter, or response. Not a single route validates its input before using it.

**Current API surface** (no validation on any of these):

| Router | Routes | Unvalidated inputs |
|--------|--------|--------------------|
| `app.ts` | 9 routes | `POST /config` writes raw `req.body` to filesystem; `POST /settings` accepts arbitrary JSON |
| `IORouter` | 1 route | `parseFloat(req.params.value) \|\| 0` — invalid input silently becomes `0` |
| `ProfilesRouter` | 5 routes | `req.body as ProfileHydrated` — cast, not validated; ID param used directly in Prisma |
| `ContainersRouter` | 4 routes | `parseInt(req.params.target)` — `NaN` propagates to regulation hardware |
| `CycleRouter` | 8 routes | `req.body as ProfileHydrated` — unvalidated profile sent to PBR |
| `MaintenanceRouter` | 3 routes | Name param used in lookup (existence-checked but not format-validated) |
| `NetworkRouter` | 4 routes | `req.body.ssid` / `req.body.password` — presence-checked but not sanitized |
| `CalltoActionRouter` | 1 route | ID param used in Prisma query |

**Additional Express-specific problems**:
- **No async error handling**: Every `async (req, res) => { ... }` handler that throws leaves the HTTP response hanging forever. Express does not catch async rejections by default (see 8.3)
- **No centralized error format**: Some routes return `res.status(404).end("not found")`, others return `res.json({ error: "..." })`, others return `res.end("ok")` — the UI has to guess the shape
- **No response validation**: Routes return ad-hoc JSON objects — if the shape changes, no one knows until the UI breaks

**Recommendation**: Migrate from Express to **Fastify + zod** (see Phase 3 in roadmap). Fastify provides:
- Built-in schema validation on every route (params, querystring, body, response)
- Native async/await support — no `asyncHandler` wrapper needed
- Automatic 400 responses with structured error messages on validation failure
- `@fastify/swagger` auto-generates OpenAPI spec directly from route schemas
- `fastify-type-provider-zod` gives compile-time types FROM zod schemas — one schema, three benefits (validation + types + OpenAPI)

---

### 8.5 HIGH — Response Status Never Checked Before JSON Parse

Every fetch call in the UI parses `.json()` without checking if the response was successful:

```typescript
// hooks.server.ts:48-49 — runs on EVERY page load
const response = await fetch(`http://${TURBINE_ADDRESS}/machine`);
machineData = await response.json() as MachineData;  // What if response is 500?
```

If turbine returns a 500 error with an HTML body, `.json()` throws, crashing the page. If it returns a JSON error object, it gets cast to `MachineData` silently, rendering garbage.

**Rule**: Always check `response.ok` before parsing. Never `as` cast without runtime validation.

---

### 8.6 HIGH — Error-Swallowing Catch Blocks

| File | Line | Code | Problem |
|------|------|------|---------|
| `ProfilesRouter.ts` | 137 | `.catch(() => { res.status(404).end("failed to save profile") })` | Real error (constraint violation, permission denied) replaced with generic 404 |
| `WAGO.ts` | 37 | `.catch(error => TurbineEventLoop.emit('log', ...))` | Connection failure logged but execution continues as if connected |
| `Containers.ts` | 117-124 | `catch(ex) { emit('log', '...was not found...') }` | Actual Prisma error discarded, misleading message logged |

**Rule**: Every catch block must either (a) log the actual error object, (b) re-throw, or (c) return an explicit error state. Never swallow.

---

### 8.7 HIGH — Thrown Strings Instead of Error Objects

**File**: `EX260Sx.ts:98, 134, 149`

```typescript
throw "EX260Sx: Unreachable";
throw "EX260Sx: Empty Data returned";
```

Thrown strings have no stack trace, don't match `instanceof Error`, and break error-handling middleware. Callers catching `Error` objects will miss these entirely.

**Rule**: Always `throw new Error(...)`. Never `throw "string"`.

---

### 8.8 MEDIUM — Global Unhandled Rejection Handler Insufficient

**File**: `app.ts:441-442`

```typescript
process.on('unhandledRejection', (error: Error) =>
    TurbineEventLoop.emit('log', 'error', "unhandledPromiseRejection: " + error.stack));
```

The process logs the error and **continues running with corrupted state**. For a machine controller, continuing after an unhandled rejection is more dangerous than crashing, because the system is now in an unknown state.

**Recommendation**: Log, attempt graceful shutdown (`SoftExit()`), then `process.exit(1)`. Let the container orchestrator restart.

---

## 9. Resource Leaks & Shutdown Failures

### 9.1 CRITICAL — SoftExit Does Not Clean Up Resources

**File**: `app.ts:364-381`

`SoftExit()` only disables regulations and resets IO. It does **not**:
- Clear the WebSocket broadcast `setInterval` (line 394)
- Clear the hypervisor polling `setInterval` (`Machine.ts:94`)
- Stop the IO scanner (`IORouter.ts:117`)
- Clear regulation loop intervals (`ContainerRegulation.ts:112`)
- Close WAGO/EX260Sx Modbus connections
- Close the Prisma database connection
- Close the WebSocket server
- Close the Express HTTP server

After `SoftExit()`, the process continues running with orphaned intervals, open sockets, and active hardware connections.

**Recommendation**: Implement a `GracefulShutdown` class that tracks all resources and disposes them in reverse order of creation.

---

### 9.2 CRITICAL — `process.exit(1)` Without Cleanup

**File**: `app.ts:230`

```typescript
process.exit(1);
```

Hard exit without awaiting `SoftExit()`. Open file handles, database transactions, and hardware writes are abruptly terminated. Data corruption is possible.

---

### 9.3 HIGH — Regulation Loop Interval Never Cleared

**File**: `ContainerRegulation.ts:112`

```typescript
setInterval(this.regulationLoop.bind(this), 10000);
```

No reference stored. Cannot be cleared on dispose, container removal, or shutdown. The loop runs for the lifetime of the process, even when regulation is disabled (`this.state === false` makes it return early, but the interval keeps firing).

If containers are recreated (configuration change), old regulation loops accumulate.

---

### 9.4 HIGH — WAGO Reconnection Can Stack Infinitely

**File**: `WAGO.ts:46-57`

```typescript
setInterval(() => {
    this.connected = this.client.isOpen;
    if(this.connected === false) {
        this.connect();  // async, not awaited
    }
}, 2000);
```

`this.connect()` is async but not awaited. If `connect()` takes >2 seconds, the next interval fires `connect()` again while the previous is still pending. Cascading failed connections stack up, consuming memory and network resources.

**Recommendation**: Add retry counter with exponential backoff. Await connect or use a lock.

---

### 9.5 HIGH — ENIPController.close() Is a No-Op

**File**: `enip.ts:83-86`

```typescript
close() {
    //this.enip.close();
}
```

ENIP sockets are never closed. Leaked on every simulation restart.

---

### 9.6 HIGH — WebsocketDispatcher Has No close() Method

No way to shut down the WebSocket server. Stale connections accumulate, broadcasts fail silently.

---

### 9.7 MEDIUM — ModbusController close() Ignores Errors

**File**: `modbus.ts:63-66`

```typescript
close() {
    this.modbus.close(() => {});  // Empty callback, errors silently dropped
}
```

---

### 9.8 MEDIUM — Hypervisor Polling Interval Not Stored

**File**: `Machine.ts:94`

```typescript
setInterval(async () => { ... }, 10000);
```

No reference. Cannot be cleared. Two async fetches per tick, not coordinated.

---

## 10. TypeScript Strictness Violations

### 10.1 CRITICAL — tsconfig Missing Strict Safety Options

Both `turbine` and `simulation-server` have the following safety options **commented out or missing**:

```jsonc
// These MUST be enabled:
"noUnusedLocals": true,
"noUnusedParameters": true,
"noImplicitReturns": true,
"noFallthroughCasesInSwitch": true,
"noUncheckedIndexedAccess": true,     // Prevents array[i] returning T instead of T | undefined
"exactOptionalPropertyTypes": true,   // Prevents undefined assignment to optional props
"forceConsistentCasingInFileNames": true
```

`noUncheckedIndexedAccess` is especially critical — the codebase has multiple unguarded array accesses (e.g., `NetworkRouter.ts:143` accessing `addresses[1][0][0][0][1][1][0]`).

---

### 10.2 HIGH — `as unknown as T` Double Assertion

**File**: `CycleRouter.ts:129`

```typescript
this.program as unknown as ProgramBlockRunnerHydrated
```

This completely bypasses the type system. The compiler cannot verify any relationship between the source and target types. If the actual runtime shape diverges, the error will manifest as a silent data corruption, not a type error.

---

### 10.3 HIGH — DOM lib in Backend tsconfig

**File**: `turbine/tsconfig.json`

```jsonc
"lib": ["DOM", "es2023"]
```

The `DOM` lib is included in a Node.js backend package. This silently makes browser-only APIs (like `window`, `document`, `fetch` with browser signatures) available without error, masking accidental usage of browser-specific code.

**Fix**: Remove `DOM` from turbine's lib. Use `"lib": ["es2023"]` only.

---

### 10.4 HIGH — Inconsistent Strict Mode Across Packages

| Package | strict | verbatimModuleSyntax | checkJs | noUncheckedIndexedAccess |
|---------|--------|---------------------|---------|--------------------------|
| turbine | true | false | false | missing |
| simulation-server | true | false | false | missing |
| ui | true (via SvelteKit) | true | n/a | missing |
| simulation-ui | true (via SvelteKit) | missing | n/a | missing |

All packages must have identical strictness. A type that passes in one package but fails in another creates false confidence.

---

### 10.5 MEDIUM — 7 `@ts-ignore` Directives Hiding Real Bugs

Each `@ts-ignore` is a potential runtime crash that the compiler would have caught:

| File | Line | What it hides |
|------|------|---------------|
| `ProgramBlockStep.ts` | 175 | State assignment type mismatch |
| `enip.ts` | 44 | Gate mapping type error |
| `modbus.ts` | 18 | Gate mapping type error |
| `simulationMachine.ts` | 49 | `readGates()` call type error |
| `simulationMachine.ts` | 77 | PT100 gate value assignment |
| `simulationMachine.ts` | 82 | Mapped gate value assignment |
| `simulationMachine.ts` | 87 | Generic gate value assignment |

**Rule**: Zero `@ts-ignore` policy. Every instance must be resolved with proper types or `@ts-expect-error` with an explanation comment.

---

## 11. Infrastructure & Build Issues

### 11.1 CRITICAL — `/package.json` in .gitignore

**File**: `.gitignore:5`

```
/package.json
```

The root `package.json` is excluded from git tracking. This means cloning the repository produces a broken workspace that cannot install dependencies.

**Fix**: Remove this line immediately.

---

### 11.2 CRITICAL — Dockerfile Missing entrypoint.sh COPY

**File**: `turbine/Dockerfile`

`CMD ["/bin/sh", "entrypoint.sh"]` references a script that is never `COPY`'d into the image. The container will fail to start.

---

### 11.3 HIGH — All Containers Run as Root

None of the 4 Dockerfiles declare a non-root user. Containers run with full root privileges.

**Fix** (add to all Dockerfiles):
```dockerfile
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
USER nodejs
```

---

### 11.4 HIGH — Non-Pinned Docker Base Images

| Dockerfile | Base image | Problem |
|------------|-----------|---------|
| turbine | `node:18-alpine` | Floating tag — pulls different image on every build |
| ui | `node:18-alpine` | Same |
| simulation-server | `node:18-alpine` | Same |
| simulation-ui | `node:20-alpine` | **Different Node version** than the others + floating |

The root `package.json` declares `"node": "18.x"` but `simulation-ui` uses Node 20. Non-deterministic builds and cross-environment inconsistencies.

**Fix**: Pin to exact digest, e.g. `node:18.20.2-alpine@sha256:...`

---

### 11.5 HIGH — No Docker Health Checks

No `HEALTHCHECK` directive in any Dockerfile. Container orchestrators (Balena, Docker Compose) cannot detect when a service is unhealthy and restart it.

---

### 11.6 HIGH — Environment Variables Used Without Validation

| Variable | File | Usage | Problem |
|----------|------|-------|---------|
| `BALENA_SUPERVISOR_ADDRESS` | `app.ts`, `Machine.ts` | Interpolated into fetch URLs | If undefined → `fetch("undefined/v2/...")` — silent HTTP error |
| `BALENA_SUPERVISOR_API_KEY` | `app.ts`, `Machine.ts` | Passed as query param | If undefined → `apikey=undefined` — auth fails silently |
| `SIMULATION_ADDRESS` | `app.ts:120` | Fetch URL | If undefined → broken URL |
| `SIMULATION_PORT` | `app.ts:120` | Fetch URL | If undefined → broken URL |
| `DATABASE_URL` | Prisma | Connection string | If undefined → Prisma crashes on first query |

**Recommendation**: Validate all required env vars at startup. Fail fast with a clear error message listing which variables are missing.

```typescript
const required = ['DATABASE_URL', 'PORT'] as const;
for (const key of required) {
    if (!process.env[key]) throw new Error(`Missing required env var: ${key}`);
}
```

---

### 11.7 HIGH — No .env.example File

No documentation of required environment variables. New developers must reverse-engineer which variables are needed by reading all source files.

---

### 11.8 MEDIUM — pnpm-workspace.yaml References Non-Existent Path

```yaml
packages:
  - 'packages/*'
  - 'simulation/*'      # ← doesn't exist, simulation packages are in packages/simulation-*
```

---

### 11.9 MEDIUM — Per-Package Lock Files

`.npmrc` sets `shared-workspace-lockfile=false`, creating separate `pnpm-lock.yaml` per package. This allows dependency version drift between packages within the same monorepo.

**Fix**: Use `shared-workspace-lockfile=true` and a single root lockfile.

---

### 11.10 MEDIUM — Inconsistent Build Scripts

| Package | build | dev | start | test | lint |
|---------|-------|-----|-------|------|------|
| turbine | yes | yes | yes | yes | yes |
| ui | yes | yes | no | no | yes |
| simulation-ui | yes | yes | no | empty | yes |
| simulation-server | yes | yes | yes | no | no |

Every package must have all five scripts. Missing `test` and `lint` scripts mean those packages are never checked in CI.

---

### 11.11 MEDIUM — Deep Internal Imports

25+ files import from deep internal paths like `@nuster/turbine/types/spec/iogates` instead of barrel exports. This creates tight coupling to turbine's internal file structure.

**Fix**: Create barrel exports (`types/index.ts`) and import from `@nuster/turbine/types`.

---

### 11.12 LOW — .dockerignore References Wrong Files

`turbine/.dockerignore` references `yarn.lock` and `.yarnrc.yml` — the project uses pnpm, not yarn.
Root `.dockerignore` excludes `packages/nuster` and `packages/dashboard` which don't exist.

---

## 12. Mandatory Coding Standards

These rules are **non-negotiable**. Every rule exists because a specific bug in this codebase would have been prevented by it. CI must enforce all of them.

### 12.1 Error Handling

| Rule | Rationale | Enforced by |
|------|-----------|-------------|
| Every `Promise` must be `await`ed or have `.catch()` | Floating promises → silent failures (8.1) | `biome: noFloatingPromises` + `tsconfig: noUncheckedIndexedAccess` |
| Every `catch` block must log the actual error object | Swallowed errors → impossible debugging (8.6) | Code review |
| Every async Express handler must be wrapped in try/catch or `asyncHandler` | Unhandled throws → hanging HTTP responses (8.3) | Biome custom rule or middleware |
| `JSON.parse` must always be in a try/catch | Corrupted files → crash on startup (8.2) | Code review |
| Never `throw "string"` — always `throw new Error(...)` | No stack trace, breaks instanceof (8.7) | `biome: noThrowLiteral` |
| Check `response.ok` before `.json()` on every fetch | Non-200 response → silent garbage data (8.5) | Shared `typedFetch` wrapper |

### 12.2 Resource Management

| Rule | Rationale | Enforced by |
|------|-----------|-------------|
| Every `setInterval` must store its ID and have a clear path to `clearInterval` | Leaked intervals → memory + CPU waste (3.2, 9.3, 9.4) | Code review |
| Every `setTimeout` in a disposable context must be cleared on disposal | Timers firing on dead objects → crashes (3.5) | Code review |
| Async callbacks in `setInterval` must be guarded against overlap | Overlapping async work → race conditions (9.3, 5.4) | In-flight flag pattern |
| Every class that registers event listeners must implement `dispose()` | Leaked listeners → memory, phantom events (2.3) | Code review + base class |
| Every opened connection (Modbus, WebSocket, DB) must have a corresponding close | Resource leaks → socket exhaustion (9.5, 9.6) | `GracefulShutdown` class |

### 12.3 Type Safety

| Rule | Rationale | Enforced by |
|------|-----------|-------------|
| Zero `@ts-ignore` — use `@ts-expect-error` with an explanation if unavoidable | Hidden type errors → runtime crashes (10.5) | `biome: noBannedTypes` or grep in CI |
| Zero `any` — use `unknown` and narrow with type guards | `any` disables all type checking downstream (7.3) | `biome: noExplicitAny` |
| Zero `as Type` casts on external data (API responses, JSON.parse) — validate with zod/valibot | Casts lie to the compiler (7.7, 5.2) | Code review |
| All public methods must have explicit return types | Implicit returns can change without notice | `biome: useExplicitReturnType` (pending proposal) or eslint equivalent |
| Enable `noUncheckedIndexedAccess` in all tsconfigs | `array[i]` returns `T` not `T \| undefined` — hides null bugs (10.1) | `tsconfig.json` |
| Enable `exactOptionalPropertyTypes` in all tsconfigs | Prevents `undefined` assignment to optional props | `tsconfig.json` |

### 12.4 Input Validation

| Rule | Rationale | Enforced by |
|------|-----------|-------------|
| Every route parameter and request body must be validated with a schema (zod/valibot) | Unvalidated input → NaN propagation, type confusion (8.4) | Validation middleware |
| `parseInt`/`parseFloat` results must be checked for `NaN` | `NaN` propagates through arithmetic silently | Schema validation at boundary |
| Env vars must be validated at startup — fail fast if missing | Undefined vars → broken URLs, silent auth failures (11.6) | Startup validation module |

### 12.5 Concurrency

| Rule | Rationale | Enforced by |
|------|-----------|-------------|
| No read-modify-write on shared hardware registers without a mutex | Lost updates → hardware corruption (4.2) | IOBus architecture |
| No concurrent writes to the same IO gate from multiple sources without locking | Write conflicts → valve/heater glitches (4.3, 4.4) | Gate lock mechanism |
| Regulation loops must check for overlap before executing | Slow loop + fast interval → competing writes (4.5) | In-flight guard |

### 12.6 Biome Configuration

All of the above is enforced via a single `biome.json` at monorepo root (see section 6.2). The following rules map directly to bugs found in this audit:

```jsonc
// biome.json (monorepo root)
{
    "$schema": "https://biomejs.dev/schemas/2.0.0/schema.json",
    "organizeImports": { "enabled": true },
    "linter": {
        "enabled": true,
        "rules": {
            "recommended": true,
            "suspicious": {
                "noExplicitAny": "error",          // 7.3 — zero any
                "noConsole": "warn",                // 7.1 — no console in prod
                "noFallthroughSwitchClause": "error",
                "noConfusingVoidType": "error",
                "noAsyncPromiseExecutor": "error"
            },
            "style": {
                "useConst": "error",
                "noVar": "error",
                "noNonNullAssertion": "error",      // 7.7 — no value!.prop
                "useTemplate": "error"              // enforce template literals
            },
            "correctness": {
                "noUnusedVariables": "error",       // 7.6 — was commented out in tsconfig
                "noUnusedImports": "error",
                "noVoidTypeReturn": "error",
                "useExhaustiveDependencies": "error"
            },
            "nursery": {
                "noFloatingPromises": "error"       // 8.1 — the #1 bug source
            },
            "complexity": {
                "noExcessiveCognitiveComplexity": "error"
            }
        }
    },
    "formatter": {
        "enabled": true,
        "indentStyle": "tab",
        "lineWidth": 120
    },
    "javascript": {
        "formatter": {
            "quoteStyle": "double",
            "semicolons": "always"
        }
    }
}
```

### 12.7 CI Pipeline Requirements

Every PR must pass:

1. `biome check` — lint + format (zero warnings policy)
2. `tsc --noEmit` — type checking with full strict mode
3. `pnpm test` — all packages
4. `pnpm build` — build succeeds
5. `docker build` — all Dockerfiles build successfully

No PR merges with any failing check. No `// biome-ignore` without a linked issue explaining why.

---

## 13. Rewrite Roadmap

### Phase 0 — Immediate Fixes (Day 1-3)

These are **non-code** or **one-line** fixes that prevent catastrophic failures:

| # | Issue | Fix | Ref |
|---|-------|-----|-----|
| 1 | `/package.json` in .gitignore | Remove line from `.gitignore` | 11.1 |
| 2 | Missing `COPY entrypoint.sh` in Dockerfile | Add COPY before CMD | 11.2 |
| 3 | `process.exit(1)` without cleanup | Replace with `await SoftExit(); process.exit(1)` | 9.2 |
| 4 | `throw "string"` in EX260Sx | Replace with `throw new Error(...)` | 8.7 |
| 5 | `JSON.parse` without try/catch at startup | Wrap in try/catch | 8.2 |
| 6 | ENV validation at startup | Add validation module, fail fast | 11.6 |
| 7 | Add `.env.example` | Document all required env vars | 11.7 |

### Phase 1 — Critical Safety Fixes (Week 1-2)

These can cause **hardware damage or safety incidents** and should be fixed immediately in the current codebase.

| # | Issue | Fix | Files | Ref |
|---|-------|-----|-------|-----|
| 1 | `setInterval` leak in IOWriteProgramBlock | Store ref, clear on resolve/abort | `IOWriteProgramBlock.ts` | 3.2 |
| 2 | EX260Sx non-atomic RMW | Add per-register async mutex | `EX260Sx.ts` | 4.2 |
| 3 | API writes bypass IO lock | Check `gate.locked` + `?force=true` override | `IORouter.ts` | 4.3 |
| 4 | Overtime timer ignores pauses | Cancel/recreate on pause/resume | `ProgramBlockStep.ts` | 3.5 |
| 5 | Pause snapshot race | Await snapshot before emitting resetAll | `ProgramBlockRunner.ts` | 3.6 |
| 6 | Callback promises can deadlock | Add timeouts to all callback-based promises | Multiple PBR files | 2.4 |
| 7 | removeAllListeners destroys global state | Use per-instance listener refs | `ProgramBlockRunner.ts` | 2.2 |
| 8 | Listener memory leaks | Add `dispose()` to all classes | `ProgramBlock.ts`, `ProgramBlockStep.ts`, etc. | 2.3 |
| 9 | All floating promises | Add `.catch()` or `await` to every promise | 8 files (see 8.1) | 8.1 |
| 10 | Async Express routes without try/catch | Add `asyncHandler` wrapper | All routers | 8.3 |
| 11 | SoftExit missing resource cleanup | Clear all intervals, close all connections | `app.ts` | 9.1 |
| 12 | Regulation interval never cleared | Store ref, clear on dispose | `ContainerRegulation.ts` | 9.3 |

### Phase 2 — Refactor Event Emitter Architecture (Week 3-6)

The root cause of most race conditions is the global event emitter pattern. However, **not all EventLoop usages are harmful** — a full audit reveals three distinct communication patterns with different treatment:

#### 2a. EventLoop Usage Audit

| Pattern | % of usages | Examples | Verdict |
|---------|------------|----------|---------|
| **Request/Response with callbacks** | ~60% | `io.update.*`, `io.snapshot`, `container.load/unload.*`, `regulation.*.get_state/set_state`, `pbr.timer.*`, `pbr.variable.read`, `pbr.profile.read`, `maintenance.read.*`, `machine.read_variable.*` | **Replace with direct method calls** — these are async function calls disguised as events, and are the source of deadlocks (2.4), listener leaks (2.3), and race conditions (3.8) |
| **Fan-out state notifications** | ~30% | `io.updated.*`, `pbr.status.update`, `pbr.pause/resume`, `pbr.variable.write`, `container.updated.*`, `log` | **Keep as pub/sub** — multiple independent listeners genuinely need these. Forcing direct calls would create tight coupling and circular dependencies |
| **Broadcast commands** | ~10% | `pbr.stop`, `io.resetAll`, `nuster.modal` | **Keep as pub/sub** — system-wide signals that need to reach all active components |

#### 2b. What to Replace — Direct Method Calls with DI

These events are point-to-point or request/response patterns. Replace them with typed async methods on the owning class. This directly fixes issues **2.2, 2.3, 2.4, 2.5, 3.3, 3.8**.

**IO operations**:
```typescript
// Before: emit and pray someone answers
TurbineEventLoop.emit("io.update.HeaterPlus", { value: 1, callback: () => resolve() });

// After: direct call, compiler-enforced, timeout-safe
await ioBus.write("HeaterPlus", 1);
```

**Container operations**:
```typescript
// Before: callback-based request/response
TurbineEventLoop.emit("container.Tank1.regulation.Heat.get_state", { callback: (state) => { ... } });

// After: direct method call
const state = await containers.get("Tank1").regulation("Heat").getState();
```

**PBR internal operations**:
```typescript
// Before: timer existence check via event (race condition if two blocks check simultaneously)
TurbineEventLoop.emit("pbr.timer.exists", { timerName, callback: (exists) => { ... } });

// After: direct method on PBR instance (atomic check-and-create possible)
const exists = pbr.timerExists(timerName);
```

**Full list of events to replace**:

| Subsystem | Events → Direct methods | Target class |
|-----------|------------------------|--------------|
| IO | `io.update.*`, `io.snapshot`, `io.resetAll` | `IOBus` |
| Containers | `container.load.*`, `container.unload.*`, `container.read.*` | `ContainerManager` |
| Regulation | `regulation.*.get_state`, `regulation.*.set_state`, `regulation.*.get_target`, `regulation.*.set_target` | `ContainerRegulation` |
| PBR | `pbr.timer.exists`, `pbr.timer.start`, `pbr.timer.stop`, `pbr.variable.read`, `pbr.profile.read`, `pbr.setPausable` | `PBREngine` |
| Maintenance | `maintenance.read.*`, `maintenance.append.*` | `MaintenanceManager` |
| Machine | `machine.read_variable.*`, `machine.config` | `Machine` |
| Profiles | `profile.read` | `ProfileManager` |

#### 2c. What to Keep — Scoped Typed Emitters

These events have multiple independent consumers and are legitimate pub/sub. Move them from the **global** `TurbineEventLoop` to **scoped, typed emitters** (e.g., `emittery` or a minimal typed wrapper).

**Per-PBR-run emitter** (solves listener leaks — disposing the emitter disposes all listeners):
- `pbr.status.update` — consumed by steps, sleep blocks, security conditions, WebSocket
- `pbr.pause` / `pbr.resume` — consumed by every active step
- `pbr.stop` — consumed by all active PBR components
- `pbr.variable.write` — consumed by all ReadVariableParameterBlocks

**Per-IOBus emitter** (fan-out state changes):
- `io.updated.*` — consumed by ContainerRegulation, SensorMaintenance, IOReadParameterBlock, Containers

**Per-Container emitter**:
- `container.updated.*` — consumed by ProductStatusParameterBlock, WebSocket
- `regulation.*.state_updated` / `regulation.*.target_updated` — consumed by parameter blocks

**System-level emitter** (narrow, dedicated):
- `log` — centralized logging
- `nuster.modal` — broadcast to WebSocket clients

#### 2d. Proposed Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      IOBus (new)                            │
│  - Owns all IOGate instances                                │
│  - Async mutex per hardware register                        │
│  - write(gate, value): Promise<void>  ← replaces io.update  │
│  - snapshot(): Promise<Record>        ← replaces io.snapshot │
│  - resetAll(): Promise<void>          ← replaces io.resetAll │
│  - Emits: io.updated.* (scoped emitter, fan-out to          │
│    regulations, maintenance, parameter blocks)               │
└──────────────────────────┬──────────────────────────────────┘
                           │
              ┌────────────┼────────────┐
              ▼                         ▼
┌──────────────────────┐   ┌──────────────────────────────┐
│   PBREngine (new)    │   │  RegulationController (new)  │
│  - Owns steps        │   │  - Owns regulation loops     │
│  - Scoped AbortSignal│   │  - Calls ioBus.write()       │
│  - Per-run emitter   │   │    directly                  │
│    for pause/resume/ │   │  - Acquires IO locks         │
│    stop/status       │   │  - Proper cleanup on disable │
│  - timerExists(),    │   └──────────────────────────────┘
│    readVariable()    │
│    are direct methods│
└──────────┬───────────┘
           ▼
┌─────────────────────────────────────────────────────────────┐
│              StatusBroadcaster (new)                         │
│  - Subscribes to IOBus.emitter, PBREngine.emitter,          │
│    Container.emitter for state changes                      │
│  - Serializes to typed Status object                        │
│  - Pushes to WebSocket clients on change (not polling)      │
└─────────────────────────────────────────────────────────────┘
```

**Key principles**:
1. **No global event bus** — the single `TurbineEventLoop` with 50+ events is eliminated
2. **Direct method calls for request/response** — eliminates deadlocks, listener leaks, and race conditions
3. **Scoped emitters for fan-out** — each subsystem owns a typed emitter; disposing the subsystem disposes all listeners
4. **Scoped `AbortSignal`** — every PBR run gets one signal, propagated to all children
5. **Async mutex on hardware** — per-register lock in IOBus prevents RMW corruption
6. **Explicit ownership** — IOBus owns gates, PBREngine owns steps, RegulationController owns loops
7. **Event-driven status** — broadcaster reacts to scoped emitter events instead of polling every 500ms

### Phase 2.5 — Error Handling & Type Safety Hardening (Week 4-5)

Run in parallel with Phase 2. These are mechanical fixes that don't require architectural changes.

| # | Task | Scope | Ref |
|---|------|-------|-----|
| 1 | Install Biome, add `biome.json` at monorepo root | Root | 6.2, 12.6 |
| 2 | Remove all `.eslintrc.json`, `.prettierrc` files | All packages | 6.2 |
| 3 | Run `biome check --write .` to auto-fix formatting | All packages | 6.2 |
| 4 | Enable all strict tsconfig options (`noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, etc.) | All packages | 10.1 |
| 5 | Remove `DOM` from turbine's `lib` | `turbine/tsconfig.json` | 10.3 |
| 6 | Resolve all 7 `@ts-ignore` directives | Multiple files | 10.5 |
| 7 | Replace all `any` with `unknown` + type guards | Multiple files | 7.3 |
| 8 | Replace all `as Type` casts on external data with zod/valibot validation | All `+page.server.ts`, routers | 7.7, 5.2 |
| 9 | ~~Add `asyncHandler` wrapper to all Express async routes~~ — **deferred to Phase 3** (Fastify handles this natively) | — | 8.3 |
| 10 | ~~Add input validation to all route parameters~~ — **deferred to Phase 3** (Fastify + zod handles this natively) | — | 8.4 |
| 11 | Fix all error-swallowing catch blocks | Multiple files | 8.6 |
| 12 | Add `response.ok` check before `.json()` on all fetches | All UI `+page.server.ts` | 8.5 |
| 13 | Create barrel exports in turbine, migrate deep imports | All consumers | 11.11 |

### Phase 3 — Migrate to Fastify + Zod + OpenAPI (Week 5-8)

Replace Express with Fastify. Replace unvalidated `as` casts with zod schemas. Replace turbine type imports in UI with an auto-generated OpenAPI client. This single phase solves **8.3** (async errors), **8.4** (zero validation), **5.2** (blind type trust), and the Express→5 upgrade from the old Phase 5.

#### Why Fastify over Express + libraries

| Problem | Express fix (bolt-on) | Fastify fix (built-in) |
|---------|----------------------|----------------------|
| No input validation | `express-zod-api` or `express-openapi-validator` — separate library, manual wiring per route | Route schemas validated automatically — declare once, get validation + types + OpenAPI |
| Async handlers crash silently | Write custom `asyncHandler` wrapper (8.3) | Native async/await — unhandled errors return 500 with structured error automatically |
| No OpenAPI spec | `swagger-jsdoc` + JSDoc annotations on every route — separate layer from validation | `@fastify/swagger` auto-generates spec from route schemas — zero annotation overhead |
| No typed req/res | Manual `as` casts | `fastify-type-provider-zod` infers TypeScript types FROM zod schemas — one schema, three benefits |
| No centralized error format | Write custom error middleware | Built-in error handler with consistent JSON error responses |

With Express, fixing these problems requires 3-4 libraries that must stay compatible with each other. With Fastify, they are all framework features.

#### Step 1 — Define zod schemas for all 37 routes (turbine)

Every route gets a schema for params, querystring, body, and response:

```typescript
import { z } from "zod";

// Shared schemas (replace the old TypeScript interfaces)
export const ProfileHydratedSchema = z.object({
    id: z.string().uuid(),
    name: z.string().min(1),
    isPremade: z.boolean(),
    values: z.array(z.object({
        fieldName: z.string(),
        value: z.number(),
    })),
    // ... all fields validated
});

export const IOWriteParamsSchema = z.object({
    name: z.string().min(1),
    value: z.string().regex(/^-?\d+(\.\d+)?$/, "Must be a number"),
});

export const IOWriteQuerySchema = z.object({
    force: z.enum(["true", "false"]).optional().default("false"),
});
```

#### Step 2 — Migrate routes to Fastify (turbine)

```typescript
import Fastify from "fastify";
import { serializerCompiler, validatorCompiler, ZodTypeProvider } from "fastify-type-provider-zod";

const app = Fastify({ logger: true });
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

// Before (Express): no validation, async crash, no types
// router.post("/:name/:value", async (req, res) => {
//     const gate = this.gates.find(g => g.name == req.params.name);
//     const value = parseFloat(req.params.value) || 0;  // NaN silently becomes 0
//     await gate.write(value);
//     res.end("ok");
// });

// After (Fastify + zod): validated, typed, async-safe, auto-documented
app.withTypeProvider<ZodTypeProvider>().post("/v1/io/:name/:value", {
    schema: {
        params: IOWriteParamsSchema,
        querystring: IOWriteQuerySchema,
        response: {
            200: z.object({ ok: z.literal(true) }),
            404: z.object({ error: z.string() }),
            409: z.object({ error: z.string(), hint: z.string() }),
        },
    },
}, async (request, reply) => {
    // request.params is typed as { name: string, value: string } — validated by zod
    const gate = this.gates.find(g => g.name === request.params.name);
    if (!gate) return reply.status(404).send({ error: "Gate not found" });

    if (gate.locked && request.query.force !== "true") {
        return reply.status(409).send({ error: "Gate is locked", hint: "Use ?force=true to override" });
    }

    const value = parseFloat(request.params.value); // safe — regex already validated
    await gate.write(value);
    return { ok: true as const };
    // If gate.write() throws → Fastify returns 500 automatically, no try/catch needed
});
```

#### Step 3 — Auto-generate OpenAPI spec (turbine)

```typescript
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";

await app.register(fastifySwagger, {
    openapi: {
        info: { title: "NusterKit Turbine API", version: "3.0.0" },
    },
    transform: jsonSchemaTransform, // from fastify-type-provider-zod
});
await app.register(fastifySwaggerUi, { routePrefix: "/api-docs" });

// After app.ready(), export spec:
// fs.writeFileSync("openapi.json", JSON.stringify(app.swagger(), null, 2));
```

Every route's zod schema is automatically converted to an OpenAPI spec. No JSDoc annotations, no separate schema files — **the validation schema IS the documentation**.

#### Step 4 — Generate typed client for UI

```bash
# In UI package:
pnpm add openapi-fetch
pnpm add -D openapi-typescript

# Generate types from turbine's spec:
npx openapi-typescript ../turbine/openapi.json -o src/generated/api.ts
```

```typescript
// Before: import turbine types, cast blindly
import type { ProfileHydrated } from "@nuster/turbine/types/hydrated";
const profiles = await fetch("/v1/profiles").then(r => r.json()) as ProfileHydrated[];

// After: types generated from OpenAPI spec, errors explicit
import createClient from "openapi-fetch";
import type { paths } from "./generated/api";

const client = createClient<paths>({ baseUrl: `http://${TURBINE_ADDRESS}` });
const { data, error } = await client.GET("/v1/profiles");
// data is typed from the spec — no cast, no import from turbine
// error is typed too — the UI knows exactly what error shapes are possible
```

#### Step 5 — Remove `@nuster/turbine` from UI dependencies

- Delete `"@nuster/turbine": "2.3.4"` from `packages/ui/package.json` and `packages/simulation-ui/package.json`
- Remove all 30+ `import type { ... } from "@nuster/turbine/..."` statements
- The UI and turbine are now fully decoupled — they communicate through the OpenAPI spec only

#### Step 6 — Add contract testing to CI

- In CI, start turbine, fetch its `/api-docs/openapi.json`, and diff against the committed spec
- If they differ, the build fails — preventing spec drift
- Add `openapi-typescript` codegen as a build step — if the spec changes, the UI types change, and type errors surface at compile time

#### Migration scope

| Component | Effort | Notes |
|-----------|--------|-------|
| 37 route handlers | Medium | Most are simple find/do/respond — translate nearly 1:1 |
| Custom `Router` base class | Low | Thin wrapper — replace with Fastify plugins |
| Express middleware (cors, json, cookies) | Low | `@fastify/cors`, built-in JSON, `@fastify/cookie` |
| WebSocket (`ws` library) | Low | `@fastify/websocket` — same API |
| Static file serving | Low | `@fastify/static` |
| 37 zod schemas to write | Medium | But this is the validation work we need anyway — Express would also need these |
| UI client migration (30+ fetch calls) | Medium | Mechanical replacement once types are generated |

**Why OpenAPI over tRPC**:
- tRPC requires both ends to be TypeScript and creates a build-time coupling (UI must import the router type from turbine — the same coupling problem we're trying to eliminate)
- OpenAPI is language-agnostic — if the turbine API is ever consumed by mobile apps, other services, or third-party integrations, the spec works for all of them
- openapi-fetch is zero-overhead (no runtime schema validation by default, just typed fetch) and can optionally add runtime validation
- Swagger UI gives free interactive API documentation for operators and debugging

### Phase 4 — Infrastructure Hardening (Week 7-9)

| # | Task | Ref |
|---|------|-----|
| 1 | Pin all Docker base images to exact digests | 11.4 |
| 2 | Add non-root user to all Dockerfiles | 11.3 |
| 3 | Add `HEALTHCHECK` to all Dockerfiles | 11.5 |
| 4 | Fix `pnpm-workspace.yaml` (remove `simulation/*`) | 11.8 |
| 5 | Switch to `shared-workspace-lockfile=true` | 11.9 |
| 6 | Add missing build/test/lint scripts to all packages | 11.10 |
| 7 | Implement `GracefulShutdown` class (track all resources, dispose in reverse order) | 9.1 |
| 8 | Fix ENIPController.close(), ModbusController.close(), add WebsocketDispatcher.close() | 9.5-9.7 |
| 9 | Add WAGO reconnection backoff (retry counter + exponential delay) | 9.4 |

### Phase 5 — Framework & Dependency Upgrades (Week 9-12)

| # | Upgrade | Breaking Changes |
|---|---------|-----------------|
| 1 | Node.js 18 → 22 | Minimal — test native fetch behavior |
| 2 | Svelte 4 → 5 | Runes migration — `$:` → `$derived`, stores → `$state` |
| 3 | TailwindCSS 3 → 4 | Config format changes |

Note: Express → Fastify migration is now part of Phase 3 (combined with OpenAPI + zod validation).

### Phase 6 — Testing & CI Hardening (Ongoing)

| # | Action | Priority |
|---|--------|----------|
| 1 | Set up CI pipeline (biome check + tsc + test + build + docker build) | P0 |
| 2 | Add integration tests for PBR lifecycle (start, pause, resume, stop, crash) | P0 |
| 3 | Add concurrency tests for IO writes (simulate parallel API + cycle + regulation) | P0 |
| 4 | Add WebSocket reconnection tests | P1 |
| 5 | Add CI security scanning (npm audit, Snyk, or similar) | P1 |
| 6 | Add property-based tests for IO gate state transitions | P2 |
| 7 | Add chaos tests: kill turbine mid-cycle, verify hardware returns to safe state | P2 |

---

## Summary

| Category | Critical | High | Medium | Low | Total |
|----------|----------|------|--------|-----|-------|
| Security (1.x) | 3 | 2 | 2 | 1 | 8 |
| Event Emitter (2.x) | 2 | 2 | 2 | 0 | 6 |
| ProgramBlockRunner (3.x) | 2 | 3 | 2 | 0 | 7 |
| IO Handlers (4.x) | 2 | 2 | 2 | 0 | 6 |
| WebSocket & Fetch (5.x) | 1 | 2 | 2 | 0 | 5 |
| Deprecated Patterns (6.x) | 0 | 0 | 0 | 0 | — |
| Code Quality (7.x) | 0 | 1 | 1 | 0 | 2 |
| Error Handling (8.x) | 4 | 3 | 1 | 0 | 8 |
| Resource Leaks & Shutdown (9.x) | 2 | 4 | 2 | 0 | 8 |
| TypeScript Strictness (10.x) | 1 | 3 | 1 | 0 | 5 |
| Infrastructure & Build (11.x) | 2 | 5 | 3 | 1 | 11 |
| **Total** | **19** | **27** | **18** | **2** | **66** |

### Issue count by priority

- **Phase 0 (Day 1-3)**: 7 immediate fixes — broken git, broken Docker, crash-on-startup bugs
- **Phase 1 (Week 1-2)**: 12 critical safety fixes — hardware damage, resource leaks, deadlocks
- **Phase 2 (Week 3-6)**: EventLoop architecture refactor — eliminates root cause of ~60% of race conditions
- **Phase 2.5 (Week 4-5)**: 13 error handling & type safety items — mechanical hardening
- **Phase 3-6**: API safety, infrastructure, upgrades, testing

The most dangerous issues remain in the IO layer (hardware corruption via non-atomic RMW, lock bypass), the PBR (leaked intervals, deadlocking promises), and **error handling** (floating promises, missing try/catch on every async route). Phase 0 and Phase 1 must complete before any framework or dependency work begins.
