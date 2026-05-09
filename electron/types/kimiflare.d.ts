declare module 'kimiflare/sdk' {
  export interface KimiFlareSession {
    subscribe(callback: (event: unknown) => void): () => void
    prompt(message: string): Promise<void>
    steer(message: string): Promise<void>
    followUp(message: string): Promise<void>
    abort(): Promise<void>
    setModel(modelId: string): Promise<void>
    listModels(): Promise<Array<{ id: string; name: string; provider: string }>>
  }

  export interface CreateAgentSessionOptions {
    cwd: string
    config?: Record<string, unknown>
  }

  export function createAgentSession(
    options: CreateAgentSessionOptions,
  ): Promise<{ session: KimiFlareSession }>
}
