import type {
  IHarness,
  HarnessConfig,
  HarnessStartOptions,
  HarnessEvent,
} from '../../src/types/harness.ts'

export class HarnessManager {
  private static instance: HarnessManager
  private harness: IHarness | null = null
  private eventListeners: Set<(event: HarnessEvent) => void> = new Set()

  static getInstance(): HarnessManager {
    if (!HarnessManager.instance) {
      HarnessManager.instance = new HarnessManager()
    }
    return HarnessManager.instance
  }

  async start(config: HarnessConfig): Promise<void> {
    await this.stop()

    const { createKimiFlareHarness } = await import('./KimiFlareHarness.js')
    const { createOpenCodeHarness } = await import('./OpenCodeHarness.js')
    const { createPiHarness } = await import('./PiHarness.js')

    switch (config.harnessId) {
      case 'kimiflare':
        this.harness = createKimiFlareHarness()
        break
      case 'opencode':
        this.harness = createOpenCodeHarness()
        break
      case 'pi':
        this.harness = createPiHarness()
        break
      default:
        throw new Error(`Unknown harness: ${config.harnessId}`)
    }

    this.harness.onEvent((event) => {
      for (const listener of this.eventListeners) {
        listener(event)
      }
    })

    const cwd = config.cwd || process.cwd()
    const options: HarnessStartOptions = {
      cwd,
      config,
    }

    await this.harness.start(options)
  }

  async stop(): Promise<void> {
    if (this.harness) {
      await this.harness.stop()
      this.harness = null
    }
  }

  getHarness(): IHarness | null {
    return this.harness
  }

  onEvent(callback: (event: HarnessEvent) => void): () => void {
    this.eventListeners.add(callback)
    return () => this.eventListeners.delete(callback)
  }
}
