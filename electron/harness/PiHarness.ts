import type {
  IHarness,
  HarnessId,
  HarnessStartOptions,
  HarnessState,
  HarnessEvent,
  ModelInfo,
  PromptOptions,
} from '../../src/types/harness.ts'

export function createPiHarness(): IHarness {
  return new PiHarness()
}

class PiHarness implements IHarness {
  readonly id: HarnessId = 'pi'
  readonly name = 'Pi'
  readonly version = '0.74.0'

  private eventListeners: Set<(event: HarnessEvent) => void> = new Set()
  private state: HarnessState = {
    isStreaming: false,
    isCompacting: false,
    pendingSteer: [],
    pendingFollowUp: [],
    status: 'idle',
  }

  async start(_options: HarnessStartOptions): Promise<void> {
    this.emit({ type: 'connected', harnessId: this.id })
  }

  async stop(): Promise<void> {
    this.emit({ type: 'disconnected', harnessId: this.id })
  }

  async sendPrompt(_prompt: string, _options?: PromptOptions): Promise<void> {
    throw new Error('Pi harness not yet implemented')
  }

  async steer(_message: string): Promise<void> {
    throw new Error('Pi harness not yet implemented')
  }

  async followUp(_message: string): Promise<void> {
    throw new Error('Pi harness not yet implemented')
  }

  async abort(): Promise<void> {
    // no-op
  }

  async getState(): Promise<HarnessState> {
    return this.state
  }

  async setModel(_modelId: string): Promise<void> {
    throw new Error('Pi harness not yet implemented')
  }

  async listModels(): Promise<ModelInfo[]> {
    return []
  }

  onEvent(callback: (event: HarnessEvent) => void): () => void {
    this.eventListeners.add(callback)
    return () => this.eventListeners.delete(callback)
  }

  async approvePermission(_permissionId: string, _approved: boolean): Promise<void> {
    // no-op
  }

  private emit(event: HarnessEvent): void {
    for (const listener of this.eventListeners) {
      listener(event)
    }
  }
}
