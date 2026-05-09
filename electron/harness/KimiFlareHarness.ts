import type {
  IHarness,
  HarnessId,
  HarnessStartOptions,
  HarnessState,
  HarnessEvent,
  ModelInfo,
  PromptOptions,
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

class KimiFlareHarness implements IHarness {
  readonly id: HarnessId = 'kimiflare'
  readonly name = 'KimiFlare'
  readonly version = '0.49.0'

  private session: {
    subscribe: (cb: (event: unknown) => void) => () => void
    prompt: (message: string) => Promise<void>
    steer: (message: string) => Promise<void>
    followUp: (message: string) => Promise<void>
    abort: () => Promise<void>
    setModel: (modelId: string) => Promise<void>
    listModels: () => Promise<ModelInfo[]>
  } | null = null

  private eventListeners: Set<(event: HarnessEvent) => void> = new Set()
  private unsubscribe?: () => void
  private state: HarnessState = {
    isStreaming: false,
    isCompacting: false,
    pendingSteer: [],
    pendingFollowUp: [],
    status: 'idle',
  }

  async start(options: HarnessStartOptions): Promise<void> {
    if (!kimiflareSdk) {
      throw new Error('kimiflare/sdk is not installed. Install it with: npm install kimiflare')
    }

    const { session } = await kimiflareSdk.createAgentSession({
      cwd: options.cwd,
      config: options.config,
    })

    this.session = session as typeof this.session

    this.unsubscribe = session.subscribe((rawEvent: unknown) => {
      const event = normalizeKimiFlareEvent(rawEvent)
      if (event) {
        if (event.type === 'status') {
          this.state.status = event.status
          this.state.isStreaming = event.status === 'streaming'
          this.state.isCompacting = event.status === 'compacting'
        }
        for (const listener of this.eventListeners) {
          listener(event)
        }
      }
    })

    this.emit({ type: 'connected', harnessId: this.id })
  }

  async stop(): Promise<void> {
    this.unsubscribe?.()
    this.unsubscribe = undefined
    this.session = null
    this.emit({ type: 'disconnected', harnessId: this.id })
  }

  async sendPrompt(prompt: string, _options?: PromptOptions): Promise<void> {
    if (!this.session) throw new Error('Harness not started')
    await this.session.prompt(prompt)
  }

  async steer(message: string): Promise<void> {
    if (!this.session) throw new Error('Harness not started')
    await this.session.steer(message)
  }

  async followUp(message: string): Promise<void> {
    if (!this.session) throw new Error('Harness not started')
    await this.session.followUp(message)
  }

  async abort(): Promise<void> {
    if (!this.session) throw new Error('Harness not started')
    await this.session.abort()
  }

  async getState(): Promise<HarnessState> {
    return this.state
  }

  async setModel(modelId: string): Promise<void> {
    if (!this.session) throw new Error('Harness not started')
    await this.session.setModel(modelId)
  }

  async listModels(): Promise<ModelInfo[]> {
    if (!this.session) throw new Error('Harness not started')
    return this.session.listModels()
  }

  onEvent(callback: (event: HarnessEvent) => void): () => void {
    this.eventListeners.add(callback)
    return () => this.eventListeners.delete(callback)
  }

  async approvePermission(_permissionId: string, _approved: boolean): Promise<void> {
    // KimiFlare handles permissions internally or via events
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
  if (e.type === 'session.end') return { type: 'disconnected', harnessId: 'kimiflare', reason: e.reason as string | undefined }
  // Direct pass-through for other events with harnessId injected
  if (typeof e.type === 'string') {
    return { ...e, harnessId: 'kimiflare' } as HarnessEvent
  }
  return null
}
