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

let opencodeSdk: typeof import('@opencode-ai/sdk') | undefined

try {
  opencodeSdk = await import('@opencode-ai/sdk')
} catch {
  console.warn('[OpenCodeHarness] @opencode-ai/sdk not available')
}

export function createOpenCodeHarness(): IHarness {
  return new OpenCodeHarness()
}

class OpenCodeHarness implements IHarness {
  readonly id: HarnessId = 'opencode'
  readonly name = 'OpenCode'
  readonly version = 'latest'

  private server?: { url: string; close(): void }
  private client?: {
    session: { prompt(options: { message: string; mode?: string }): Promise<void> }
    permission: { approve(requestId: string): Promise<void>; deny(requestId: string): Promise<void> }
  }
  private abortController?: AbortController
  private eventListeners: Set<(event: HarnessEvent) => void> = new Set()
  private state: HarnessState = {
    isStreaming: false,
    isCompacting: false,
    pendingSteer: [],
    pendingFollowUp: [],
    status: 'idle',
  }

  async start(options: HarnessStartOptions): Promise<void> {
    if (!opencodeSdk) {
      throw new Error(
        '@opencode-ai/sdk is not installed. Install it with: npm install @opencode-ai/sdk',
      )
    }

    this.server = await opencodeSdk.createOpencodeServer({
      hostname: '127.0.0.1',
      port: 0,
      config: options.config as unknown as Record<string, unknown>,
    })

    this.client = opencodeSdk.createOpencodeClient({ baseUrl: this.server.url })

    // Connect to SSE event stream
    this.connectSSE(`${this.server.url}/events`)

    this.emit({ type: 'connected', harnessId: this.id })
  }

  private async connectSSE(url: string): Promise<void> {
    this.abortController = new AbortController()

    try {
      const response = await fetch(url, { signal: this.abortController.signal })
      if (!response.body) return

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      const read = (): void => {
        reader.read().then(({ done, value }) => {
          if (done) return

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6)
              try {
                const raw = JSON.parse(data)
                const event = normalizeOpenCodeEvent(raw)
                if (event) {
                  if (event.type === 'status') {
                    this.state.status = event.status
                    this.state.isStreaming = event.status === 'streaming'
                  }
                  this.emit(event)
                }
              } catch {
                // Ignore malformed SSE data
              }
            }
          }

          read()
        })
      }

      read()
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.error('[OpenCodeHarness] SSE error:', err)
        this.emit({
          type: 'error',
          message: `SSE connection failed: ${(err as Error).message}`,
          recoverable: true,
        })
      }
    }
  }

  async stop(): Promise<void> {
    this.abortController?.abort()
    this.server?.close()
    this.server = undefined
    this.client = undefined
    this.emit({ type: 'disconnected', harnessId: this.id })
  }

  async sendPrompt(prompt: string, options?: PromptOptions): Promise<void> {
    if (!this.client) throw new Error('Harness not started')
    await this.client.session.prompt({
      message: prompt,
      mode: options?.mode,
    })
  }

  async steer(message: string): Promise<void> {
    // OpenCode has no native steer. Queue and send as follow-up prompt.
    this.state.pendingSteer.push(message)
    // When the current assistant turn finishes, the queued steer will be sent.
    // For now, send immediately as a follow-up.
    if (!this.client) throw new Error('Harness not started')
    await this.client.session.prompt({ message })
  }

  async followUp(message: string): Promise<void> {
    if (!this.client) throw new Error('Harness not started')
    await this.client.session.prompt({ message })
  }

  async abort(): Promise<void> {
    this.abortController?.abort()
    this.state.status = 'idle'
    this.state.isStreaming = false
  }

  async getState(): Promise<HarnessState> {
    return this.state
  }

  async setModel(_modelId: string): Promise<void> {
    // OpenCode model selection is done via server config at start time
    throw new Error('OpenCode model switching not yet supported. Restart harness with new config.')
  }

  async listModels(): Promise<ModelInfo[]> {
    // OpenCode models are provider-dependent; return empty until we query the server
    return []
  }

  onEvent(callback: (event: HarnessEvent) => void): () => void {
    this.eventListeners.add(callback)
    return () => this.eventListeners.delete(callback)
  }

  async approvePermission(requestId: string, decision: PermissionDecision): Promise<void> {
    if (!this.client) throw new Error('Harness not started')
    if (decision === 'deny') {
      await this.client.permission.deny(requestId)
    } else {
      await this.client.permission.approve(requestId)
    }
  }

  private emit(event: HarnessEvent): void {
    for (const listener of this.eventListeners) {
      listener(event)
    }
  }
}

function normalizeOpenCodeEvent(raw: unknown): HarnessEvent | null {
  const e = raw as Record<string, unknown>
  const type = e.type as string | undefined

  switch (type) {
    case 'server.connected':
      return { type: 'connected', harnessId: 'opencode' }

    case 'server.instance.disposed':
      return { type: 'disconnected', harnessId: 'opencode', reason: e.reason as string | undefined }

    case 'message.updated': {
      const props = e.properties as Record<string, unknown> | undefined
      const info = props?.info as Record<string, unknown> | undefined
      if (info?.role !== 'assistant') return null

      const parts = (info.parts as Array<Record<string, unknown>>) || []
      for (const part of parts) {
        if (part.type === 'text') {
          return {
            type: 'message.delta',
            messageId: String(info.id),
            text: String(part.text),
          }
        }
        if (part.type === 'reasoning') {
          return {
            type: 'message.reasoning',
            messageId: String(info.id),
            text: String(part.text),
          }
        }
      }
      return null
    }

    case 'tool.execution.start': {
      const props = e.properties as Record<string, unknown> | undefined
      return {
        type: 'tool.start',
        toolCallId: String(props?.toolCallID),
        toolName: String(props?.toolName),
        args: props?.args,
      }
    }

    case 'tool.execution.end': {
      const props = e.properties as Record<string, unknown> | undefined
      return {
        type: 'tool.result',
        toolCallId: String(props?.toolCallID),
        toolName: String(props?.toolName),
        result: props?.result,
        isError: Boolean(props?.isError),
      }
    }

    case 'permission.request': {
      const props = e.properties as Record<string, unknown> | undefined
      return {
        type: 'permission.request',
        requestId: String(props?.requestId),
        toolName: String(props?.toolName),
        args: props?.args,
      }
    }

    case 'usage': {
      const props = e.properties as Record<string, unknown> | undefined
      return {
        type: 'usage',
        inputTokens: Number(props?.inputTokens) || 0,
        outputTokens: Number(props?.outputTokens) || 0,
        reasoningTokens: Number(props?.reasoningTokens) || undefined,
        cost: Number(props?.cost) || undefined,
      }
    }

    default:
      return null
  }
}
