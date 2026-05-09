import { spawn, execSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import type {
  IHarness,
  HarnessId,
  HarnessStartOptions,
  HarnessState,
  HarnessEvent,
  ModelInfo,
  PromptOptions,
  PermissionDecision,
} from '../../src/types/harness.ts'

let kimiflareSdk: typeof import('kimiflare/sdk') | undefined

try {
  kimiflareSdk = await import('kimiflare/sdk')
} catch {
  console.warn('[KimiFlareHarness] kimiflare/sdk not available; will use RPC fallback')
}

export function createKimiFlareHarness(): IHarness {
  return new KimiFlareHarness()
}

type KimiFlareSessionLike = {
  subscribe: (cb: (event: unknown) => void) => () => void
  prompt: (message: string) => Promise<void>
  steer: (message: string) => Promise<void>
  followUp: (message: string) => Promise<void>
  abort: () => Promise<void>
  setModel: (modelId: string) => Promise<void>
  listModels: () => Promise<Array<{ id: string; name: string; provider: string }>>
  dispose?: () => void
}

class KimiFlareHarness implements IHarness {
  readonly id: HarnessId = 'kimiflare'
  readonly name = 'KimiFlare'
  readonly version = '0.49.0'

  private session: KimiFlareSessionLike | null = null
  private eventListeners: Set<(event: HarnessEvent) => void> = new Set()
  private unsubscribe?: () => void
  private state: HarnessState = {
    isStreaming: false,
    isCompacting: false,
    pendingSteer: [],
    pendingFollowUp: [],
    status: 'idle',
  }

  // RPC fallback state
  private rpcProc?: ReturnType<typeof spawn>
  private rpcBuffer = ''
  private mode: 'sdk' | 'rpc' | null = null

  async start(options: HarnessStartOptions): Promise<void> {
    if (kimiflareSdk) {
      await this.startSdk(options)
    } else {
      await this.startRpc(options)
    }
  }

  private async startSdk(options: HarnessStartOptions): Promise<void> {
    if (!kimiflareSdk) throw new Error('SDK not available')
    this.mode = 'sdk'

    const cfg = options.config
    const sdkConfig: Record<string, unknown> =
      cfg.mode === 'cloud'
        ? {
            githubToken: cfg.githubToken,
            remoteWorkerUrl: cfg.remoteWorkerUrl,
          }
        : {
            accountId: cfg.accountId,
            apiToken: cfg.apiToken,
            model: cfg.model || '@cf/moonshotai/kimi-k2.6',
          }

    const { session } = await kimiflareSdk.createAgentSession({
      cwd: options.cwd,
      config: sdkConfig,
    })

    this.session = session as KimiFlareSessionLike

    this.unsubscribe = session.subscribe((rawEvent: unknown) => {
      const event = normalizeKimiFlareEvent(rawEvent)
      if (event) {
        if (event.type === 'status') {
          this.state.status = event.status
          this.state.isStreaming = event.status === 'streaming'
          this.state.isCompacting = event.status === 'compacting'
        }
        this.emit(event)
      }
    })

    this.emit({ type: 'connected', harnessId: this.id })
  }

  private async startRpc(options: HarnessStartOptions): Promise<void> {
    this.mode = 'rpc'
    this.rpcBuffer = ''

    // Try to find the kimiflare binary
    const binPath = this.resolveKimiflareBin()
    if (!binPath) {
      throw new Error(
        'kimiflare SDK not available and kimiflare binary not found. ' +
          'Install kimiflare globally (npm i -g kimiflare) or ensure it is in node_modules.',
      )
    }

    const cfg = options.config
    const rpcEnv: Record<string, string> = {
      ...process.env,
      KIMIFLARE_MODEL: cfg.model || '@cf/moonshotai/kimi-k2.6',
    }

    if (cfg.mode === 'cloud') {
      rpcEnv.KIMIFLARE_MODE = 'cloud'
      rpcEnv.KIMIFLARE_GITHUB_TOKEN = cfg.githubToken || ''
      rpcEnv.KIMIFLARE_REMOTE_WORKER_URL = cfg.remoteWorkerUrl || ''
    } else {
      rpcEnv.KIMIFLARE_MODE = 'direct'
      rpcEnv.KIMIFLARE_ACCOUNT_ID = cfg.accountId || ''
      rpcEnv.KIMIFLARE_API_TOKEN = cfg.apiToken || ''
    }

    this.rpcProc = spawn(process.execPath, [binPath, '--mode', 'rpc'], {
      cwd: options.cwd,
      stdio: ['pipe', 'pipe', 'pipe'],
      env: rpcEnv,
    })

    this.rpcProc.stdout!.on('data', (chunk: Buffer) => {
      this.rpcBuffer += chunk.toString('utf-8')
      const lines = this.rpcBuffer.split('\n')
      this.rpcBuffer = lines.pop() || ''
      for (const line of lines) {
        if (!line.trim()) continue
        try {
          const raw = JSON.parse(line)
          const event = normalizeKimiFlareEvent(raw)
          if (event) {
            if (event.type === 'status') {
              this.state.status = event.status
              this.state.isStreaming = event.status === 'streaming'
              this.state.isCompacting = event.status === 'compacting'
            }
            this.emit(event)
          }
        } catch {
          // Ignore malformed JSONL
        }
      }
    })

    this.rpcProc.stderr!.on('data', (chunk: Buffer) => {
      const text = chunk.toString('utf-8').trim()
      if (text) {
        console.error('[KimiFlareHarness RPC stderr]', text)
      }
    })

    this.rpcProc.on('exit', (code) => {
      if (code !== 0 && code !== null) {
        this.emit({
          type: 'error',
          message: `KimiFlare RPC process exited with code ${code}`,
          recoverable: true,
        })
      }
      this.emit({ type: 'disconnected', harnessId: this.id })
    })

    // Send new_session to initialize
    this.rpcSend({ type: 'new_session', config: options.config })

    this.emit({ type: 'connected', harnessId: this.id })
  }

  private resolveKimiflareBin(): string | null {
    // 1. Local node_modules binary (relative to this file)
    const local = join(dirname(fileURLToPath(import.meta.url)), '../../node_modules/kimiflare/bin/kimiflare.mjs')
    if (existsSync(local)) return local

    // 2. Global npx resolution
    try {
      const globalPath = execSync('npx which kimiflare', { encoding: 'utf-8' }).trim()
      if (globalPath) return globalPath
    } catch {
      // ignore
    }
    return null
  }

  private rpcSend(msg: Record<string, unknown>): void {
    if (!this.rpcProc?.stdin) return
    this.rpcProc.stdin.write(JSON.stringify(msg) + '\n')
  }

  async stop(): Promise<void> {
    if (this.mode === 'sdk') {
      this.unsubscribe?.()
      this.unsubscribe = undefined
      this.session?.dispose?.()
      this.session = null
    } else if (this.mode === 'rpc') {
      this.rpcProc?.stdin?.end()
      this.rpcProc?.kill()
      this.rpcProc = undefined
    }
    this.mode = null
    this.emit({ type: 'disconnected', harnessId: this.id })
  }

  async sendPrompt(prompt: string, options?: PromptOptions): Promise<void> {
    if (this.mode === 'sdk') {
      if (!this.session) throw new Error('Harness not started')
      await this.session.prompt(prompt)
    } else if (this.mode === 'rpc') {
      this.rpcSend({ type: 'prompt', message: prompt, mode: options?.mode })
    } else {
      throw new Error('Harness not started')
    }
  }

  async steer(message: string): Promise<void> {
    if (this.mode === 'sdk') {
      if (!this.session) throw new Error('Harness not started')
      await this.session.steer(message)
    } else if (this.mode === 'rpc') {
      this.rpcSend({ type: 'steer', message })
    } else {
      throw new Error('Harness not started')
    }
  }

  async followUp(message: string): Promise<void> {
    if (this.mode === 'sdk') {
      if (!this.session) throw new Error('Harness not started')
      await this.session.followUp(message)
    } else if (this.mode === 'rpc') {
      this.rpcSend({ type: 'followUp', message })
    } else {
      throw new Error('Harness not started')
    }
  }

  async abort(): Promise<void> {
    if (this.mode === 'sdk') {
      if (!this.session) throw new Error('Harness not started')
      await this.session.abort()
    } else if (this.mode === 'rpc') {
      this.rpcSend({ type: 'abort' })
    } else {
      throw new Error('Harness not started')
    }
    this.state.status = 'idle'
    this.state.isStreaming = false
  }

  async getState(): Promise<HarnessState> {
    return this.state
  }

  async setModel(modelId: string): Promise<void> {
    if (this.mode === 'sdk') {
      if (!this.session) throw new Error('Harness not started')
      await this.session.setModel(modelId)
    } else if (this.mode === 'rpc') {
      this.rpcSend({ type: 'setModel', modelId })
    } else {
      throw new Error('Harness not started')
    }
  }

  async listModels(): Promise<ModelInfo[]> {
    if (this.mode === 'sdk') {
      if (!this.session) throw new Error('Harness not started')
      const models = await this.session.listModels()
      return models.map((m) => ({ id: m.id, name: m.name, provider: m.provider }))
    } else if (this.mode === 'rpc') {
      // RPC mode does not support dynamic model listing yet
      return []
    }
    throw new Error('Harness not started')
  }

  onEvent(callback: (event: HarnessEvent) => void): () => void {
    this.eventListeners.add(callback)
    return () => this.eventListeners.delete(callback)
  }

  async approvePermission(requestId: string, decision: PermissionDecision): Promise<void> {
    if (this.mode === 'sdk') {
      // KimiFlare SDK handles permissions internally or via events
    } else if (this.mode === 'rpc') {
      this.rpcSend({ type: 'resolve_permission', requestId, decision })
    }
  }

  private emit(event: HarnessEvent): void {
    for (const listener of this.eventListeners) {
      listener(event)
    }
  }
}

function normalizeKimiFlareEvent(raw: unknown): HarnessEvent | null {
  const e = raw as Record<string, unknown>
  if (e.type === 'session.start') return { type: 'connected', harnessId: 'kimiflare' }
  if (e.type === 'session.end')
    return { type: 'disconnected', harnessId: 'kimiflare', reason: e.reason as string | undefined }
  // Direct pass-through for other events with harnessId injected
  if (typeof e.type === 'string') {
    return { ...e, harnessId: 'kimiflare' } as HarnessEvent
  }
  return null
}
