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

let piSdk: typeof import('@earendil-works/pi-coding-agent') | undefined

try {
  piSdk = await import('@earendil-works/pi-coding-agent')
} catch {
  console.warn('[PiHarness] @earendil-works/pi-coding-agent not available')
}

export function createPiHarness(): IHarness {
  return new PiHarness()
}

class PiHarness implements IHarness {
  readonly id: HarnessId = 'pi'
  readonly name = 'Pi'
  readonly version = '0.74.0'

  private session: {
    subscribe: (cb: (event: unknown) => void) => () => void
    prompt: (message: string) => Promise<void>
    steer: (message: string) => Promise<void>
    followUp: (message: string) => Promise<void>
    abort: () => Promise<void>
    setModel: (options: { provider: string; id: string }) => Promise<void>
    listModels: () => Promise<Array<{ id: string; name: string; provider: string }>>
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
    if (!piSdk) {
      throw new Error(
        '@earendil-works/pi-coding-agent is not installed. Install it with: npm install @earendil-works/pi-coding-agent',
      )
    }

    const authStorage = piSdk.AuthStorage.create()
    const modelRegistry = piSdk.ModelRegistry.create(authStorage)

    // Pi resolves provider/model/apiKey from AuthStorage when not explicitly provided.
    // This lets users who already have Pi configured reuse their existing credentials.
    const { session } = await piSdk.createAgentSession({
      sessionManager: piSdk.SessionManager.inMemory(),
      authStorage,
      modelRegistry,
      cwd: options.cwd,
      provider: options.config.provider || undefined,
      model: options.config.model || undefined,
      apiKey: options.config.apiKey || undefined,
    })

    this.session = session as typeof this.session

    this.unsubscribe = session.subscribe((rawEvent: unknown) => {
      const event = normalizePiEvent(rawEvent)
      if (event) {
        if (event.type === 'status') {
          this.state.status = event.status
          this.state.isStreaming = event.status === 'streaming'
        }
        this.emit(event)
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
    this.state.status = 'idle'
    this.state.isStreaming = false
  }

  async getState(): Promise<HarnessState> {
    return this.state
  }

  async setModel(modelId: string): Promise<void> {
    if (!this.session) throw new Error('Harness not started')
    // Parse provider from modelId (format: "provider:model" or just "model")
    const [provider, id] = modelId.includes(':') ? modelId.split(':') : ['default', modelId]
    await this.session.setModel({ provider, id })
  }

  async listModels(): Promise<ModelInfo[]> {
    if (!this.session) throw new Error('Harness not started')
    const models = await this.session.listModels()
    return models.map((m) => ({ id: m.id, name: m.name, provider: m.provider }))
  }

  onEvent(callback: (event: HarnessEvent) => void): () => void {
    this.eventListeners.add(callback)
    return () => this.eventListeners.delete(callback)
  }

  async approvePermission(_permissionId: string, _decision: PermissionDecision): Promise<void> {
    // Pi does not have built-in permission gating.
    // If permission gating is needed, it must be implemented via a custom ToolExecutor.
    console.warn('[PiHarness] Permission approval is a no-op. Pi tools execute without gating.')
  }

  private emit(event: HarnessEvent): void {
    for (const listener of this.eventListeners) {
      listener(event)
    }
  }
}

function normalizePiEvent(raw: unknown): HarnessEvent | null {
  const e = raw as Record<string, unknown>
  const type = e.type as string | undefined

  switch (type) {
    case 'agent_start':
      return { type: 'status', status: 'streaming' }

    case 'agent_end':
      return { type: 'status', status: 'idle' }

    case 'message_start': {
      const msg = e.message as Record<string, unknown> | undefined
      return {
        type: 'message.start',
        messageId: String(msg?.id),
        role: String(msg?.role),
      }
    }

    case 'message_update': {
      const msg = e.message as Record<string, unknown> | undefined
      const ame = e.assistantMessageEvent as Record<string, unknown> | undefined
      if (ame?.type === 'text_delta') {
        return {
          type: 'message.delta',
          messageId: String(msg?.id),
          text: String(ame.delta),
        }
      }
      if (ame?.type === 'reasoning_delta') {
        return {
          type: 'message.reasoning',
          messageId: String(msg?.id),
          text: String(ame.delta),
        }
      }
      return null
    }

    case 'tool_execution_start':
      return {
        type: 'tool.start',
        toolCallId: String(e.toolCallId),
        toolName: String(e.toolName),
        args: e.args,
      }

    case 'tool_execution_end':
      return {
        type: 'tool.result',
        toolCallId: String(e.toolCallId),
        toolName: String(e.toolName),
        result: e.result,
        isError: Boolean(e.isError),
      }

    case 'usage':
      return {
        type: 'usage',
        inputTokens: Number(e.inputTokens) || 0,
        outputTokens: Number(e.outputTokens) || 0,
        reasoningTokens: Number(e.reasoningTokens) || undefined,
        cost: Number(e.cost) || undefined,
      }

    case 'error':
      return {
        type: 'error',
        message: String(e.message),
        recoverable: Boolean(e.recoverable),
      }

    default:
      return null
  }
}
