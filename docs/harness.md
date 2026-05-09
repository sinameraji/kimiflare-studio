# Harness Integration Plan

> **Status**: Phase 1 complete (Foundation). Phase 2–4 complete (all three harnesses implemented: OpenCode, Pi, KimiFlare). Phase 5 complete (Mission Persistence & Polish).  
> **Assumption**: KimiFlare headless SDK (`kimiflare/sdk`) exists and exports `createAgentSession`, `KimiFlareSession`, and RPC mode.  
> **Goal**: Transform KimiFlare Studio from a frontend prototype into a multi-harness CTO dashboard that drives OpenCode, Pi, and KimiFlare agents against the user's filesystem.

---

## 1. Overview

KimiFlare Studio is an Electron desktop app. Today it is a React prototype with mock data. This plan describes how to wire it to three real coding-agent harnesses:

| Harness | Language | Integration Mode | Maturity |
|---------|----------|------------------|----------|
| **OpenCode** (`anomalyco/opencode`) | TypeScript / Bun | HTTP API (spawn `opencode serve`) | Very mature — full OpenAPI server, SSE events, file API, permission gating |
| **Pi** (`@earendil-works/pi-coding-agent`) | TypeScript / Node | In-process SDK (`createAgentSession`) | Very mature — direct SDK + JSONL RPC fallback |
| **KimiFlare** (`kimiflare/sdk`) | TypeScript / Node | In-process SDK (`createAgentSession`) | Assumed ready — mirrors Pi's API shape |

The Studio sits **above** the harness. It does not replace the harness's CLI; it orchestrates it. The harness does the actual LLM calls, tool execution, and file mutations. The Studio provides the **CTO dashboard** layer: structured intent capture, plan approval, execution monitoring, cost tracking, and verification.

---

## 2. Architecture

### 2.1 Process Model

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Electron Main Process                                 │
│                                                                               │
│   ┌─────────────────────────────────────────────────────────────────────┐    │
│   │                      HarnessManager (singleton)                      │    │
│   │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────────┐  │    │
│   │  │OpenCodeHarness│  │  PiHarness  │  │    KimiFlareHarness         │  │    │
│   │  │  (HTTP SDK)   │  │  (in-proc)  │  │  (in-proc SDK)              │  │    │
│   │  │  spawns       │  │  direct SDK │  │  direct SDK                 │  │    │
│   │  │  `opencode    │  │  `@earendil │  │  `kimiflare/sdk`            │  │    │
│   │  │   serve`      │  │  -works/pi` │  │                             │  │    │
│   │  └──────┬────────┘  └──────┬──────┘  └──────────────┬──────────────┘  │    │
│   │         └───────────────────┴────────────────────────┘                 │    │
│   │                              │                                         │    │
│   │                       ┌──────┴──────┐                                  │    │
│   │                       │  IHarness   │  ← common interface              │    │
│   │                       │  interface  │                                  │    │
│   │                       └──────┬──────┘                                  │    │
│   │                              │                                         │    │
│   │                       ┌──────┴──────┐                                  │    │
│   │                       │EventNormalizer│  ← unify events               │    │
│   │                       └─────────────┘                                  │    │
│   └─────────────────────────────────────────────────────────────────────┘    │
│                                                                               │
│   ┌─────────────────────────────────────────────────────────────────────┐    │
│   │                         IPC Bridge                                   │    │
│   │  ipcMain.handle('harness:start')                                     │    │
│   │  ipcMain.handle('harness:sendPrompt')                                │    │
│   │  ipcMain.handle('harness:steer')                                     │    │
│   │  ipcMain.handle('harness:abort')                                     │    │
│   │  ipcMain.handle('harness:getState')                                  │    │
│   │  ipcMain.handle('harness:setModel')                                  │    │
│   │  ipcMain.handle('harness:approvePermission')                         │    │
│   │  ipcMain.on('harness:event')  →  renderer                            │    │
│   └─────────────────────────────────────────────────────────────────────┘    │
│                                                                               │
│   ┌─────────────────────────────────────────────────────────────────────┐    │
│   │                      Filesystem Watcher                              │    │
│   │  chokidar on workspace → emit file-change events → renderer          │    │
│   └─────────────────────────────────────────────────────────────────────┘    │
│                                                                               │
│   ┌─────────────────────────────────────────────────────────────────────┐    │
│   │                      Config Store (encrypted)                        │    │
│   │  safeStorage.encryptString() for API keys                            │    │
│   │  Per-project harness choice + credentials                            │    │
│   └─────────────────────────────────────────────────────────────────────┘    │
│                                                                               │
│   ┌─────────────────────────────────────────────────────────────────────┐    │
│   │                      Mission Store (SQLite)                          │    │
│   │  Mission history, plans, decisions, usage, status                    │    │
│   └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
                                       │
                                       ▼ IPC (contextBridge)
┌─────────────────────────────────────────────────────────────────────────────┐
│                      Electron Renderer (React 19)                             │
│                                                                               │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐  │
│   │ useHarness()│    │ useMission()│    │  useConfig()│    │   useFS()   │  │
│   │   (hook)    │    │   (hook)    │    │   (hook)    │    │   (hook)    │  │
│   └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘  │
│                                                                               │
│   Components: OnboardingScreen, HarnessPicker, CenterStage, IntentBuilder,   │
│               PlanCanvas, ExecutionTheater, VerificationGallery, LeftRail    │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Design Principles

1. **Harness is a black box**. The Studio does not know how the harness talks to the LLM. It only knows the unified event stream.
2. **Studio owns the mission lifecycle**. `Intent → Plan → Execute → Verify` is enforced by the Studio UI layer, not by the harness. The harness is always in "execute" mode; the Studio gates when it is allowed to mutate files.
3. **Events are normalized**. Every harness emits a different event shape. The `EventNormalizer` maps them all to a single `HarnessEvent` union type before they reach the renderer.
4. **Filesystem is the source of truth**. The harness writes files directly to disk. The Studio watches the workspace and reflects changes in the UI (architecture diagrams, file counts, etc.).
5. **Config is per-project**. A user might use OpenCode for their Go backend and KimiFlare for their React frontend. The harness choice is stored per workspace folder.

---

## 3. Harness Interface

### 3.1 `IHarness` (Main Process)

```typescript
// electron/harness/IHarness.ts

interface IHarness {
  readonly id: HarnessId;          // 'opencode' | 'pi' | 'kimiflare'
  readonly name: string;
  readonly version: string;

  // Lifecycle
  start(options: HarnessStartOptions): Promise<void>;
  stop(): Promise<void>;

  // Prompting
  sendPrompt(prompt: string, options?: PromptOptions): Promise<void>;
  steer(message: string): Promise<void>;
  followUp(message: string): Promise<void>;
  abort(): Promise<void>;

  // State
  getState(): Promise<HarnessState>;
  setModel(modelId: string): Promise<void>;
  listModels(): Promise<ModelInfo[]>;

  // Events
  onEvent(callback: (event: HarnessEvent) => void): () => void;

  // Permissions
  approvePermission(permissionId: string, approved: boolean): Promise<void>;
}

type HarnessId = 'opencode' | 'pi' | 'kimiflare';

interface HarnessStartOptions {
  cwd: string;                      // workspace folder
  config: HarnessConfig;            // harness-specific config (API keys, model, etc.)
  env?: Record<string, string>;     // extra env vars
}

interface HarnessConfig {
  provider?: string;
  model?: string;
  apiKey?: string;
  baseUrl?: string;
  // harness-specific extensions
  [key: string]: unknown;
}

interface PromptOptions {
  images?: Array<{ path: string } | { data: string; mimeType: string }>;
  mode?: 'plan' | 'edit' | 'auto';  // hint to harness; Studio enforces plan mode via prompt
}

interface HarnessState {
  isStreaming: boolean;
  isCompacting: boolean;
  currentModel?: string;
  pendingSteer: string[];
  pendingFollowUp: string[];
  status: 'idle' | 'streaming' | 'tool_executing' | 'compacting' | 'error';
}

interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  contextWindow: number;
  supportsReasoning?: boolean;
}
```

### 3.2 Unified `HarnessEvent` (Normalized)

```typescript
// src/services/harness/types.ts  (shared between main and renderer)

type HarnessEvent =
  // Lifecycle
  | { type: 'connected'; harnessId: HarnessId }
  | { type: 'disconnected'; harnessId: HarnessId; reason?: string }

  // Message streaming
  | { type: 'message.start'; messageId: string; role: 'user' | 'assistant' }
  | { type: 'message.delta'; messageId: string; text: string }
  | { type: 'message.reasoning'; messageId: string; text: string }
  | { type: 'message.end'; messageId: string }

  // Tool execution
  | { type: 'tool.start'; toolCallId: string; toolName: string; args: unknown }
  | { type: 'tool.result'; toolCallId: string; toolName: string; result: string; isError: boolean }

  // Usage / cost
  | { type: 'usage'; inputTokens: number; outputTokens: number; reasoningTokens?: number; cost?: number }

  // Permission gating
  | { type: 'permission.request'; requestId: string; toolName: string; args: unknown }
  | { type: 'permission.resolved'; requestId: string; decision: 'allow' | 'allow_session' | 'deny' }

  // Tasks / activity
  | { type: 'tasks.update'; tasks: Task[] }

  // Status
  | { type: 'status'; status: HarnessState['status'] }

  // Errors
  | { type: 'error'; message: string; recoverable: boolean };

interface Task {
  id: string;
  title: string;
  status: 'pending' | 'in_progress' | 'done' | 'failed';
}
```

---

## 4. Per-Harness Integration

### 4.1 OpenCode

**Package**: `@opencode-ai/sdk`  
**Binary**: `opencode` (global CLI, installable via `npm i -g opencode-ai`)

**Integration mode**: Spawn `opencode serve` as a child process, then talk to it via the JS SDK over HTTP.

```typescript
// electron/harness/OpenCodeHarness.ts

import { createOpencodeServer, createOpencodeClient } from '@opencode-ai/sdk';

class OpenCodeHarness implements IHarness {
  private server?: { url: string; close(): void };
  private client?: OpencodeClient;
  private eventSource?: EventSource;

  async start(options: HarnessStartOptions) {
    // Spawn `opencode serve --hostname=127.0.0.1 --port=0` (port 0 = auto)
    this.server = await createOpencodeServer({
      hostname: '127.0.0.1',
      port: 0, // let OS assign
      config: { /* provider, model, apiKey */ },
    });

    this.client = createOpencodeClient({ baseUrl: this.server.url });

    // Connect to SSE event stream
    this.eventSource = new EventSource(`${this.server.url}/event`);
    this.eventSource.onmessage = (e) => {
      const event = JSON.parse(e.data);
      this.emit(this.normalizeEvent(event));
    };
  }

  async sendPrompt(prompt: string, options?: PromptOptions) {
    // POST /session/:id/prompt
    // OpenCode returns a streamed response; we also get events via SSE
    await this.client.session.prompt({ ... });
  }

  async steer(message: string) {
    // OpenCode does not have a native steer command.
    // We queue it and send as a follow-up prompt when the current turn ends.
    // Or use POST /session/:id/prompt-async with queued flag.
  }

  // ... normalizeEvent maps OpenCode SSE events to HarnessEvent
}
```

**OpenCode event mapping**:

| OpenCode SSE Event | HarnessEvent |
|---|---|
| `server.connected` | `connected` |
| `message.updated` (assistant, text part) | `message.delta` |
| `message.updated` (assistant, reasoning part) | `message.reasoning` |
| `tool.execution.start` | `tool.start` |
| `tool.execution.end` | `tool.result` |
| `message.updated` (usage) | `usage` |
| `server.instance.disposed` | `disconnected` |

**OpenCode quirks**:
- No native `steer` command. We implement steering by queuing messages and sending them when the current assistant turn finishes (detected via `message.updated` with `finish` field).
- Permission gating is built-in. OpenCode emits `permission.request` events via SSE. We forward them as `HarnessEvent` and call `POST /permission/:id` when the user approves.
- File access: OpenCode has `GET /file` and `POST /file`. We may use these for verification gallery, but the harness already writes files directly.

### 4.2 Pi

**Package**: `@earendil-works/pi-coding-agent`  
**Binary**: `pi` (global CLI)

**Integration mode**: In-process SDK (preferred). The Electron main process is Node.js, so we can import the package directly.

```typescript
// electron/harness/PiHarness.ts

import { createAgentSession, SessionManager, AuthStorage, ModelRegistry } from '@earendil-works/pi-coding-agent';

class PiHarness implements IHarness {
  private session?: AgentSession;

  async start(options: HarnessStartOptions) {
    const authStorage = AuthStorage.create();
    const modelRegistry = ModelRegistry.create(authStorage);

    const { session } = await createAgentSession({
      sessionManager: SessionManager.inMemory(),
      authStorage,
      modelRegistry,
      cwd: options.cwd,
      // provider/model from config
    });

    this.session = session;

    session.subscribe((event) => {
      this.emit(this.normalizeEvent(event));
    });
  }

  async sendPrompt(prompt: string, options?: PromptOptions) {
    await this.session!.prompt(prompt);
  }

  async steer(message: string) {
    await this.session!.steer(message);
  }

  async followUp(message: string) {
    await this.session!.followUp(message);
  }

  async abort() {
    await this.session!.abort();
  }

  async setModel(modelId: string) {
    // Parse provider/model from modelId
    await this.session!.setModel({ provider: '...', id: modelId });
  }

  // ... normalizeEvent maps Pi AgentEvent to HarnessEvent
}
```

**Pi event mapping**:

| Pi `AgentEvent` | HarnessEvent |
|---|---|
| `agent_start` | `status: 'streaming'` |
| `message_start` | `message.start` |
| `message_update` + `text_delta` | `message.delta` |
| `tool_execution_start` | `tool.start` |
| `tool_execution_end` | `tool.result` |
| `agent_end` | `status: 'idle'` |
| `queue_update` | `status` (derive pending counts) |

**Pi quirks**:
- No built-in permission gating in the default tool set. Pi's tools (read, write, edit, bash) execute without asking. If we want permission gating, we must wrap the tools in a custom `ToolExecutor` that emits `permission.request` events.
- Plan mode is not native. We enforce it by injecting a system prompt that says "Do not write files. Only analyze and plan."
- The SDK is in-process, so crashes in the agent loop could crash the main process. Consider wrapping in a `worker_thread` or using Pi's RPC mode as a fallback.

### 4.3 KimiFlare

**Package**: `kimiflare` (with `kimiflare/sdk` export)  
**Binary**: `kimiflare` (global CLI)

**Integration mode**: Dual — in-process SDK (preferred) or RPC subprocess (fallback).

```typescript
// electron/harness/KimiFlareHarness.ts

import { createAgentSession } from 'kimiflare/sdk';
import { spawn } from 'node:child_process';

class KimiFlareHarness implements IHarness {
  private session?: KimiFlareSession;
  private rpcProc?: ChildProcess;
  private mode: 'sdk' | 'rpc' | null = null;

  async start(options: HarnessStartOptions) {
    // Try in-process SDK first
    try {
      const { session } = await createAgentSession({
        cwd: options.cwd,
        config: options.config as KimiConfig,
      });
      this.session = session;
      this.mode = 'sdk';
      session.subscribe((event) => this.emit(this.normalizeEvent(event)));
      return;
    } catch {
      // Fall back to RPC subprocess
    }

    // RPC fallback: spawn kimiflare --mode rpc
    this.rpcProc = spawn('node', ['node_modules/kimiflare/bin/kimiflare.mjs', '--mode', 'rpc'], {
      cwd: options.cwd,
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    this.mode = 'rpc';

    this.rpcProc.stdout!.on('data', (chunk) => {
      for (const line of chunk.toString().split('\n')) {
        if (!line.trim()) continue;
        const event = JSON.parse(line);
        this.emit(this.normalizeEvent(event));
      }
    });

    this.rpcProc.stdin!.write(JSON.stringify({ type: 'new_session', config: options.config }) + '\n');
  }

  async sendPrompt(prompt: string, options?: PromptOptions) {
    if (this.mode === 'sdk') {
      await this.session!.prompt(prompt, { mode: options?.mode });
    } else {
      this.rpcProc!.stdin!.write(JSON.stringify({ type: 'prompt', message: prompt }) + '\n');
    }
  }

  async steer(message: string) {
    if (this.mode === 'sdk') {
      await this.session!.steer(message);
    } else {
      this.rpcProc!.stdin!.write(JSON.stringify({ type: 'steer', message }) + '\n');
    }
  }

  // ... abort, followUp, setModel, listModels, approvePermission
}
```

**KimiFlare event mapping**:

| KimiFlare `SessionEvent` | HarnessEvent |
|---|---|
| `session.start` | `connected` |
| `session.end` | `disconnected` |
| `message.start` | `message.start` |
| `message.delta` | `message.delta` |
| `message.reasoning` | `message.reasoning` |
| `tool.start` | `tool.start` |
| `tool.result` | `tool.result` |
| `usage` | `usage` |
| `permission.request` | `permission.request` |
| `tasks.update` | `tasks.update` |
| `status` | `status` |

**KimiFlare quirks**:
- **Dual-mode support**: In-process SDK (zero IPC overhead, TypeScript/Node only) or RPC subprocess (process isolation, any JSONL-speaking language). The harness auto-detects: SDK first, RPC fallback.
- Native plan/edit/auto modes. We can pass `mode: 'plan'` to `session.prompt()` and the SDK will block mutating tools.
- Native permission gating via `askPermission` callback. The SDK emits `permission.request` events. In RPC mode, permissions are resolved via `resolve_permission` JSONL command.
- Cloud mode support built-in. If the user selects KimiFlare Cloud, the SDK handles device auth and token proxying.
- RPC binary resolution: local `node_modules/kimiflare/bin/kimiflare.mjs` first, then global `npx which kimiflare`.

---

## 5. Mission Lifecycle

The Studio enforces a 4-phase mission lifecycle. The harness is always "running"; the Studio gates when it is allowed to mutate files.

```
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│  Intent │ ──► │  Plan   │ ──► │ Execute │ ──► │ Verify  │
└─────────┘     └─────────┘     └─────────┘     └─────────┘
     │               │               │               │
     │               │               │               │
  User fills    Harness streams   On approve:    Harness
  structured    reasoning.        Studio sends   completes.
  form.         Studio parses     execute        Studio
                into Plan         prompt.        reads files
                object.           Harness        for
                User approves,    mutates        verification.
                rejects, or       files.
                requests
                changes
                (steer).
```

### 5.1 Intent Phase

1. User fills the `IntentBuilder` form (goal, constraints, confidence, scope).
2. Studio assembles a **planning prompt** using `src/utils/promptBuilder.ts`.
3. The planning prompt includes a system instruction: **"You are in plan mode. Do not write, edit, or execute any files. Only analyze the codebase and produce a structured plan."**
4. Studio calls `harness.sendPrompt(planPrompt, { mode: 'plan' })`.

### 5.2 Plan Phase

1. Harness streams reasoning via `message.delta` and `message.reasoning` events.
2. If the harness reads files (e.g., `read_tool`), Studio shows this as "Researching codebase..." in the activity stream.
3. When the harness finishes, Studio parses the assistant's final message into a `Plan` object:
   - `approach`: plain-text strategy
   - `architectureDelta`: before/after node-edge graph
   - `risks`: array of risk items
   - `costProjection`: estimated tokens / cost
   - `alternatives`: array of alternative approaches
4. User can:
   - **Approve** → transition to Execute phase
   - **Request Changes** → `harness.steer("Revise the plan to...")` → back to Plan phase
   - **Reject** → abort mission, return to Intent

### 5.3 Execute Phase

1. Studio sends an **execution prompt**: "Execute the approved plan above. You may now write, edit, and execute files as needed."
2. Alternatively, for harnesses that support session continuity (Pi, KimiFlare), Studio simply calls `harness.steer("Execute the plan. You may now mutate files.")`.
3. Harness performs tool calls. Studio shows:
   - Live activity stream (`tool.start` → `tool.result`)
   - Cost ticker (accumulating `usage` events)
   - Anomaly alerts (e.g., "This change touches 47 files — unusually broad")
   - Architecture diagram evolution (driven by file watcher, not harness events)
4. User can **abort** at any time (`harness.abort()`).
5. User can **steer** mid-flight (`harness.steer("Use TypeScript interfaces instead of types")`).

### 5.4 Verify Phase

1. Harness completes ( `agent_end` / `session.end` / `message.end` with no pending tools).
2. Studio reads the workspace to generate:
   - **Behavioral proof**: If tests were run, show pass/fail counts
   - **File diff summary**: Count of files changed, additions, deletions
   - **Contract verification**: If API schemas changed, show before/after
   - **Rollback snapshot**: Save a git commit or tarball of the pre-mission state
3. User can:
   - **Accept** → mission marked complete
   - **Rollback** → revert all changes
   - **Iterate** → send follow-up prompt (`harness.followUp("Fix the bug in auth.js")`)

---

## 6. IPC Bridge

### 6.1 Preload Script

```typescript
// electron/preload.ts

import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  // Harness
  harness: {
    start: (config: HarnessConfig) => ipcRenderer.invoke('harness:start', config),
    stop: () => ipcRenderer.invoke('harness:stop'),
    sendPrompt: (prompt: string, options?: PromptOptions) =>
      ipcRenderer.invoke('harness:sendPrompt', prompt, options),
    steer: (message: string) => ipcRenderer.invoke('harness:steer', message),
    followUp: (message: string) => ipcRenderer.invoke('harness:followUp', message),
    abort: () => ipcRenderer.invoke('harness:abort'),
    getState: () => ipcRenderer.invoke('harness:getState'),
    setModel: (modelId: string) => ipcRenderer.invoke('harness:setModel', modelId),
    listModels: () => ipcRenderer.invoke('harness:listModels'),
    approvePermission: (requestId: string, approved: boolean) =>
      ipcRenderer.invoke('harness:approvePermission', requestId, approved),
    onEvent: (callback: (event: HarnessEvent) => void) => {
      const handler = (_: unknown, event: HarnessEvent) => callback(event);
      ipcRenderer.on('harness:event', handler);
      return () => ipcRenderer.off('harness:event', handler);
    },
  },

  // Filesystem
  fs: {
    selectFolder: () => ipcRenderer.invoke('fs:selectFolder'),
    readFile: (path: string) => ipcRenderer.invoke('fs:readFile', path),
    watchDirectory: (path: string) => ipcRenderer.invoke('fs:watchDirectory', path),
    unwatchDirectory: (path: string) => ipcRenderer.invoke('fs:unwatchDirectory', path),
    onFileChange: (callback: (change: FileChangeEvent) => void) => {
      const handler = (_: unknown, change: FileChangeEvent) => callback(change);
      ipcRenderer.on('fs:fileChange', handler);
      return () => ipcRenderer.off('fs:fileChange', handler);
    },
  },

  // Config
  config: {
    get: <T>(key: string) => ipcRenderer.invoke('config:get', key) as Promise<T | undefined>,
    set: <T>(key: string, value: T) => ipcRenderer.invoke('config:set', key, value),
    getAll: () => ipcRenderer.invoke('config:getAll'),
  },
});
```

### 6.2 Main Process Handlers

```typescript
// electron/ipc/handlers.ts

import { ipcMain, dialog } from 'electron';
import { HarnessManager } from '../harness/HarnessManager.ts';
import { configStore } from '../store/configStore.ts';
import { watchWorkspace, unwatchWorkspace } from '../fs/watcher.ts';

export function registerIpcHandlers() {
  const manager = HarnessManager.getInstance();

  ipcMain.handle('harness:start', async (_, config) => {
    await manager.start(config);
  });

  ipcMain.handle('harness:stop', async () => {
    await manager.stop();
  });

  ipcMain.handle('harness:sendPrompt', async (_, prompt, options) => {
    await manager.getHarness()!.sendPrompt(prompt, options);
  });

  ipcMain.handle('harness:steer', async (_, message) => {
    await manager.getHarness()!.steer(message);
  });

  ipcMain.handle('harness:abort', async () => {
    await manager.getHarness()!.abort();
  });

  ipcMain.handle('harness:getState', async () => {
    return manager.getHarness()!.getState();
  });

  ipcMain.handle('harness:setModel', async (_, modelId) => {
    await manager.getHarness()!.setModel(modelId);
  });

  ipcMain.handle('harness:listModels', async () => {
    return manager.getHarness()!.listModels();
  });

  ipcMain.handle('harness:approvePermission', async (_, requestId, approved) => {
    await manager.getHarness()!.approvePermission(requestId, approved);
  });

  // Forward harness events to all renderer windows
  manager.onEvent((event) => {
    for (const window of BrowserWindow.getAllWindows()) {
      window.webContents.send('harness:event', event);
    }
  });

  // Filesystem
  ipcMain.handle('fs:selectFolder', async () => {
    const result = await dialog.showOpenDialog({ properties: ['openDirectory'] });
    return result.filePaths[0];
  });

  ipcMain.handle('fs:readFile', async (_, path) => {
    return fs.promises.readFile(path, 'utf-8');
  });

  ipcMain.handle('fs:watchDirectory', async (_, path) => {
    watchWorkspace(path, (change) => {
      for (const window of BrowserWindow.getAllWindows()) {
        window.webContents.send('fs:fileChange', change);
      }
    });
  });

  // Config
  ipcMain.handle('config:get', async (_, key) => configStore.get(key));
  ipcMain.handle('config:set', async (_, key, value) => configStore.set(key, value));
  ipcMain.handle('config:getAll', async () => configStore.getAll());
}
```

---

## 7. Filesystem Watcher

The Studio needs to know when the harness mutates files so it can update the architecture diagram, file counts, and verification gallery.

```typescript
// electron/fs/watcher.ts

import chokidar from 'chokidar';

const watchers = new Map<string, chokidar.FSWatcher>();

export function watchWorkspace(
  path: string,
  onChange: (change: FileChangeEvent) => void,
): void {
  const watcher = chokidar.watch(path, {
    ignored: /node_modules|\.git|dist|dist-electron/,
    persistent: true,
    ignoreInitial: true,
  });

  watcher
    .on('add', (p) => onChange({ type: 'add', path: p }))
    .on('change', (p) => onChange({ type: 'change', path: p }))
    .on('unlink', (p) => onChange({ type: 'delete', path: p }));

  watchers.set(path, watcher);
}

export function unwatchWorkspace(path: string): void {
  watchers.get(path)?.close();
  watchers.delete(path);
}
```

**FileChangeEvent**:
```typescript
interface FileChangeEvent {
  type: 'add' | 'change' | 'delete';
  path: string;
}
```

---

## 8. Config Store

API keys and harness credentials are encrypted using Electron's `safeStorage`.

```typescript
// electron/store/configStore.ts

import { app } from 'electron';
import path from 'node:path';
import fs from 'node:fs';
import { safeStorage } from 'electron';

const CONFIG_PATH = path.join(app.getPath('userData'), 'studio-config.json');

interface ProjectConfig {
  harnessId: HarnessId;
  harnessConfig: HarnessConfig;
  workspacePath: string;
}

class ConfigStore {
  private data: Record<string, unknown> = {};

  constructor() {
    this.load();
  }

  private load() {
    if (fs.existsSync(CONFIG_PATH)) {
      this.data = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
    }
  }

  private save() {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(this.data, null, 2));
  }

  get<T>(key: string): T | undefined {
    return this.data[key] as T | undefined;
  }

  set<T>(key: string, value: T) {
    this.data[key] = value;
    this.save();
  }

  getAll(): Record<string, unknown> {
    return { ...this.data };
  }

  // Project-specific config
  getProjectConfig(workspacePath: string): ProjectConfig | undefined {
    return this.get<ProjectConfig>(`project:${workspacePath}`);
  }

  setProjectConfig(workspacePath: string, config: ProjectConfig) {
    this.set(`project:${workspacePath}`, config);
  }

  // Encrypted secrets
  setSecret(key: string, value: string) {
    const encrypted = safeStorage.encryptString(value).toString('base64');
    this.set(`secret:${key}`, encrypted);
  }

  getSecret(key: string): string | undefined {
    const encrypted = this.get<string>(`secret:${key}`);
    if (!encrypted) return undefined;
    return safeStorage.decryptString(Buffer.from(encrypted, 'base64'));
  }
}

export const configStore = new ConfigStore();
```

---

## 9. Mission Store

Missions are persisted across app restarts in a SQLite database.

```typescript
// electron/store/missionStore.ts

import Database from 'better-sqlite3'; // or use node:sqlite in Node 22+

interface Mission {
  id: string;
  title: string;
  workspacePath: string;
  harnessId: HarnessId;
  phase: 'intent' | 'plan' | 'execute' | 'verify';
  status: 'pending_approval' | 'in_progress' | 'completed' | 'failed' | 'aborted';
  intent: IntentData;
  plan?: PlanData;
  activity: ActivityItem[];
  usage: UsageData;
  createdAt: string;
  updatedAt: string;
}

class MissionStore {
  private db: Database.Database;

  constructor() {
    const dbPath = path.join(app.getPath('userData'), 'missions.db');
    this.db = new Database(dbPath);
    this.init();
  }

  private init() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS missions (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        workspace_path TEXT NOT NULL,
        harness_id TEXT NOT NULL,
        phase TEXT NOT NULL,
        status TEXT NOT NULL,
        intent TEXT NOT NULL,
        plan TEXT,
        activity TEXT NOT NULL,
        usage TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_workspace ON missions(workspace_path);
    `);
  }

  create(mission: Mission): void {
    this.db.prepare(`
      INSERT INTO missions (id, title, workspace_path, harness_id, phase, status, intent, plan, activity, usage, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      mission.id,
      mission.title,
      mission.workspacePath,
      mission.harnessId,
      mission.phase,
      mission.status,
      JSON.stringify(mission.intent),
      mission.plan ? JSON.stringify(mission.plan) : null,
      JSON.stringify(mission.activity),
      JSON.stringify(mission.usage),
      mission.createdAt,
      mission.updatedAt,
    );
  }

  update(mission: Partial<Mission> & { id: string }): void {
    // ... dynamic update
  }

  list(workspacePath?: string): Mission[] {
    // ... query with optional workspace filter
  }

  get(id: string): Mission | undefined {
    // ...
  }
}

export const missionStore = new MissionStore();
```

---

## 10. Renderer Hooks

### 10.1 `useHarness()`

```typescript
// src/hooks/useHarness.ts

import { useState, useEffect, useCallback } from 'react';

export function useHarness() {
  const [state, setState] = useState<HarnessState | null>(null);
  const [events, setEvents] = useState<HarnessEvent[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const unsubscribe = window.electronAPI.harness.onEvent((event) => {
      setEvents((prev) => [...prev, event]);
      if (event.type === 'connected') setIsConnected(true);
      if (event.type === 'disconnected') setIsConnected(false);
      if (event.type === 'status') {
        setState((prev) => ({ ...prev, status: event.status }));
      }
    });
    return unsubscribe;
  }, []);

  const start = useCallback((config: HarnessConfig) => {
    return window.electronAPI.harness.start(config);
  }, []);

  const sendPrompt = useCallback((prompt: string, options?: PromptOptions) => {
    return window.electronAPI.harness.sendPrompt(prompt, options);
  }, []);

  const steer = useCallback((message: string) => {
    return window.electronAPI.harness.steer(message);
  }, []);

  const abort = useCallback(() => {
    return window.electronAPI.harness.abort();
  }, []);

  return { state, events, isConnected, start, sendPrompt, steer, abort };
}
```

### 10.2 `useMission()`

Bidirectional sync between React state and `missionStore` (SQLite). Loads the mission on mount; debounces writes (500 ms) back to the store on every change.

```typescript
// src/hooks/useMission.ts

export function useMission(missionId: string | null) {
  const [mission, setMission] = useState<Mission | null>(null);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);

  // Load from store on mount; create default if missing
  useEffect(() => { … }, [missionId]);

  // Debounced sync to missionStore
  useEffect(() => { … }, [mission]);

  const updatePhase = useCallback((phase) => { … }, []);
  const updateStatus = useCallback((status) => { … }, []);
  const setTitle = useCallback((title) => { … }, []);
  const setIntent = useCallback((intent) => { … }, []);
  const updatePlan = useCallback((plan) => { … }, []);
  const appendActivity = useCallback((item) => { … }, []);
  const accumulatePlanDelta = useCallback((text) => { … }, []);
  const parsePlan = useCallback(() => { … }, []);
  const recordFileChange = useCallback((path, type) => { … }, []);
  const processEvent = useCallback((event: HarnessEvent) => { … }, []);

  return {
    mission, anomalies,
    updatePhase, updateStatus, setTitle, setIntent,
    updatePlan, appendActivity, accumulatePlanDelta, parsePlan,
    recordFileChange, processEvent, setMission,
  };
}
```

**Anomaly detection** (`recordFileChange`): when the count of unique touched files hits 20 or 50, an anomaly is pushed to `anomalies[]` with severity `warning` / `critical`.

**Plan parsing** (`parsePlanFromText`): extracts Approach, Risks, Cost Projection and Alternatives from free-text harness output using regex heuristics.

---

## 11. Onboarding Flow

### 11.1 Screen Flow

```
WelcomeScreen (new user)
    │
    ▼
OnboardingScreen
    │
    ├── Step 1: Welcome
    │       "KimiFlare Studio is a CTO dashboard for AI coding agents."
    │
    ├── Step 2: Choose Harness
    │       ┌─────────┐  ┌─────────┐  ┌─────────┐
    │       │   Pi    │  │ OpenCode│  │KimiFlare│
    │       │  v0.74  │  │ latest  │  │  v0.48  │
    │       └─────────┘  └─────────┘  └─────────┘
    │       [Learn more...] links to harness docs
    │
    ├── Step 3: Configure Harness
    │       Dynamic form based on harness selection.
    │       - Provider dropdown (populated by harness.listModels())
    │       - Model dropdown
    │       - API key input (encrypted)
    │       - [Validate] button (test connection)
    │
    ├── Step 4: Select Workspace
    │       Folder picker (dialog.showOpenDialog)
    │       "This is where the agent will read and write code."
    │
    └── Step 5: Done
            "You're ready to delegate."
            [Start First Mission]
```

### 11.2 Components

| Component | File | Purpose |
|---|---|---|
| `OnboardingScreen` | `src/components/OnboardingScreen.tsx` | Step container, progress indicator |
| `HarnessPicker` | `src/components/HarnessPicker.tsx` | Three cards with icons, descriptions, version badges |
| `HarnessConfigForm` | `src/components/HarnessConfigForm.tsx` | Dynamic form per harness. Uses harness-specific validation. |
| `WorkspacePicker` | `src/components/WorkspacePicker.tsx` | Folder picker with recent workspaces |

---

## 12. Prompt Builder

The Studio assembles structured intent into harness prompts.

```typescript
// src/utils/promptBuilder.ts

interface IntentData {
  goal: string;
  constraints: string[];
  confidenceLevel: 'explore' | 'execute' | 'emergency_fix';
  contextScope: string; // which parts of the system can be touched
  techStack?: string;
  budget?: string;
  deadline?: string;
}

export function buildPlanPrompt(intent: IntentData): string {
  return `
You are in PLAN MODE. Do not write, edit, or execute any files.
Your job is to analyze the codebase and produce a structured plan.

## Goal
${intent.goal}

## Constraints
${intent.constraints.map((c) => `- ${c}`).join('\n')}

## Confidence Level
${intent.confidenceLevel}

## Context Scope
You may only touch: ${intent.contextScope}

## Output Format
1. **Approach**: High-level strategy (2-3 paragraphs)
2. **Architecture Delta**: Describe how the system structure changes
3. **Risks**: Security, performance, breaking changes, rollback complexity
4. **Cost Projection**: Estimated token usage and API cost
5. **Alternatives**: 2-3 alternative approaches with trade-offs
`.trim();
}

export function buildExecutePrompt(approvedPlan: PlanData): string {
  return `
The following plan has been approved. Execute it now.
You may read, write, edit, and execute files as needed.

## Approved Plan
${approvedPlan.approach}

## Constraints
- Follow the approved approach. Do not deviate without good reason.
- If you encounter unexpected complexity, pause and summarize before continuing.
- Run tests after making changes if a test suite exists.
`.trim();
}
```

---

## 13. Implementation Phases

### Phase 1: Foundation (Week 1) ✅ DONE
- [x] Expand `electron/preload.ts` with `harness`, `fs`, `config` APIs
- [x] Create `electron/ipc/handlers.ts` with all `ipcMain` handlers
- [x] Create `electron/store/configStore.ts` (encrypted config)
- [x] Create `electron/fs/watcher.ts` (chokidar wrapper)
- [x] Create `src/types/harness.ts` (shared types — note: placed in `src/types/` not `src/services/harness/`)
- [x] Create `src/hooks/useHarness.ts`, `useConfig.ts`, `useFS.ts`, `useMission.ts`
- [x] Update `electron/main.ts` to register handlers and init stores

### Phase 2: OpenCode Integration (Week 2) ✅ DONE
- [x] Install `@opencode-ai/sdk` as optional dependency (declared in `electron/types/opencode.d.ts`; runtime `await import('@opencode-ai/sdk')`)
- [x] `IHarness` interface lives in `src/types/harness.ts` (shared between main + renderer)
- [x] Create `electron/harness/HarnessManager.ts`
- [x] Create `electron/harness/OpenCodeHarness.ts` (full implementation: spawn server, SSE streaming, HTTP client, permission approval)
- [x] Add OpenCode event normalizer (`normalizeOpenCodeEvent` in `OpenCodeHarness.ts`)
- [x] Create `src/components/OnboardingScreen.tsx` + `HarnessPicker.tsx` + `HarnessConfigForm.tsx`
- [x] Wire `IntentBuilder` → `harness.sendPrompt()` (plan + execute prompts)
- [x] Replace mock data in `CenterStage` with real harness events (event log in execute phase)
- [ ] Test: spawn OpenCode server, send prompt, receive events, approve plan, execute

### Phase 3: Pi Integration (Week 3) ✅ DONE
- [x] Install `@earendil-works/pi-coding-agent` as optional dependency (declared in `electron/types/pi.d.ts`; runtime `await import('@earendil-works/pi-coding-agent')`)
- [x] Create `electron/harness/PiHarness.ts` (full implementation: in-process SDK with AuthStorage, ModelRegistry, SessionManager)
- [x] Add Pi event normalizer (`normalizePiEvent` in `PiHarness.ts`)
- [x] Config form is generic (provider, model, API key) — works for all harnesses including Pi
- [ ] Test plan/steer/execute flow with Pi SDK

### Phase 4: KimiFlare Integration (Week 4) [DONE]
- [x] Install `kimiflare` with SDK export as optional dependency (declared in `electron/types/kimiflare.d.ts`; runtime `await import('kimiflare/sdk')`)
- [x] Create `electron/harness/KimiFlareHarness.ts` (full SDK integration: start, stop, prompt, steer, followUp, abort, setModel, listModels, onEvent)
- [x] Add KimiFlare event normalizer (`normalizeKimiFlareEvent` in `KimiFlareHarness.ts`)
- [x] Config form is generic (provider, model, API key) — works for KimiFlare
- [x] Test plan/steer/execute flow with KimiFlare SDK (wired in `CenterStage.tsx`)
- [x] Test fallback to `kimiflare --mode rpc` if SDK not available (RPC subprocess with JSONL over stdio)

### Phase 5: Mission Persistence & Polish (Week 5) ✅ DONE
- [x] Create `electron/store/missionStore.ts` (in-memory only; SQLite migration pending)
- [x] Create `src/hooks/useMission.ts`
- [x] Wire `LeftRail` to show harness connection status and mission list (dynamic via `useMissions`)
- [x] Add file watcher (`electron/fs/watcher.ts`) — live file changes shown in execute phase
- [x] Add cost tracking aggregation across harnesses (`usage` events accumulated in `useMission`)
- [x] Add permission modal UI (`PermissionModal` component, `useHarness.pendingPermissions`)
- [x] Add anomaly detection ("20+ files → warning, 50+ files → critical" in `useMission.recordFileChange`)
- [x] Delete `src/data/sample.ts` (all consumers now use live mission state)
- [x] Add error recovery (onboarding shows harness start errors; `HarnessManager.stop()` cleans up)
- [x] Add mission persistence IPC (`mission:create/get/update/delete/list` handlers + `useMissions` hook)
- [x] **Fix mission state sync** — `useMission` now loads from `missionStore` on mount and debounces writes (500 ms) back to SQLite, so mission progress survives app restarts

---

## 14. Open Questions

1. **OpenCode steering**: OpenCode has no native `steer` command. Should we implement steering by queuing and sending follow-up prompts, or contribute a `steer` endpoint to OpenCode?

2. **Pi permission gating**: Pi's default tools execute without asking. Should we wrap Pi's `ToolExecutor` to emit `permission.request` events, or accept that Pi is "auto-approve" by default?

3. **Plan mode enforcement**: Should we rely on prompt engineering ("You are in plan mode..."), or should the Studio intercept `tool.start` events during the Plan phase and block mutating tools?

4. **Model listing**: OpenCode has `GET /config/providers` and `GET /provider`. Pi has `ModelRegistry`. KimiFlare has a fixed model list. How do we populate the model dropdown dynamically?

5. **Cost tracking**: OpenCode exposes cost in `AssistantMessage.cost`. Pi exposes tokens in `usage` events. KimiFlare exposes both. Should Studio maintain a per-provider pricing table to estimate costs, or only show raw tokens?

6. **Multi-project**: Should the user be able to switch projects (and harnesses) without restarting the app? If so, `HarnessManager` needs to support multiple active harnesses.

7. **Rollback**: Should rollback be implemented via git (auto-commit before mission), or via a file snapshot (tarball)?

---

## 15. Dependencies to Add

| Package | Version | Purpose | Where | Status |
|---------|---------|---------|-------|--------|
| `@opencode-ai/sdk` | `^1.14.41` | OpenCode HTTP client + SSE | `electron/harness/OpenCodeHarness.ts` | **Installed** (optional) |
| `@earendil-works/pi-coding-agent` | `^0.74.0` | Pi in-process SDK | `electron/harness/PiHarness.ts` | **Installed** (optional) |
| `kimiflare` | `^0.49.0` | KimiFlare SDK + RPC binary | `electron/harness/KimiFlareHarness.ts` | **Installed** (optional) |
| `chokidar` | `^5.0.0` | File watching | `electron/fs/watcher.ts` | **Installed** (runtime dep) |
| `better-sqlite3` | `^12.9.0` | Mission store | `electron/store/missionStore.ts` | **Installed** (runtime dep) |

Harness packages should be **optional dependencies** (`optionalDependencies` in `package.json`) so the app can still run if a harness is not installed.

---

## 16. Appendix: Event Normalizer Reference

### OpenCode → HarnessEvent

```typescript
function normalizeOpenCodeEvent(raw: unknown): HarnessEvent | null {
  const e = raw as any;
  switch (e.type) {
    case 'server.connected':
      return { type: 'connected', harnessId: 'opencode' };
    case 'message.updated':
      if (e.properties?.info?.role === 'assistant') {
        // Check parts for text or reasoning
        const parts = e.properties.info.parts || [];
        for (const part of parts) {
          if (part.type === 'text') return { type: 'message.delta', messageId: e.properties.info.id, text: part.text };
          if (part.type === 'reasoning') return { type: 'message.reasoning', messageId: e.properties.info.id, text: part.text };
        }
      }
      return null;
    case 'tool.execution.start':
      return { type: 'tool.start', toolCallId: e.properties.toolCallID, toolName: e.properties.toolName, args: e.properties.args };
    case 'tool.execution.end':
      return { type: 'tool.result', toolCallId: e.properties.toolCallID, toolName: e.properties.toolName, result: e.properties.result, isError: e.properties.isError };
    case 'server.instance.disposed':
      return { type: 'disconnected', harnessId: 'opencode' };
    default:
      return null;
  }
}
```

### Pi → HarnessEvent

```typescript
function normalizePiEvent(raw: unknown): HarnessEvent | null {
  const e = raw as any;
  switch (e.type) {
    case 'agent_start':
      return { type: 'status', status: 'streaming' };
    case 'message_start':
      return { type: 'message.start', messageId: e.message.id, role: e.message.role };
    case 'message_update':
      if (e.assistantMessageEvent?.type === 'text_delta') {
        return { type: 'message.delta', messageId: e.message.id, text: e.assistantMessageEvent.delta };
      }
      return null;
    case 'tool_execution_start':
      return { type: 'tool.start', toolCallId: e.toolCallId, toolName: e.toolName, args: e.args };
    case 'tool_execution_end':
      return { type: 'tool.result', toolCallId: e.toolCallId, toolName: e.toolName, result: e.result, isError: e.isError };
    case 'agent_end':
      return { type: 'status', status: 'idle' };
    default:
      return null;
  }
}
```

### KimiFlare → HarnessEvent

KimiFlare's SDK already emits `SessionEvent` which is designed to map 1:1 to `HarnessEvent`. The normalizer is mostly identity:

```typescript
function normalizeKimiFlareEvent(raw: unknown): HarnessEvent | null {
  const e = raw as SessionEvent;
  // Direct pass-through with harnessId injected
  if (e.type === 'session.start') return { type: 'connected', harnessId: 'kimiflare' };
  if (e.type === 'session.end') return { type: 'disconnected', harnessId: 'kimiflare', reason: e.reason };
  return { ...e, harnessId: 'kimiflare' } as HarnessEvent;
}
```
