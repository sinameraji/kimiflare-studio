declare module '@earendil-works/pi-coding-agent' {
  export interface PiSession {
    subscribe(callback: (event: unknown) => void): () => void
    prompt(message: string): Promise<void>
    steer(message: string): Promise<void>
    followUp(message: string): Promise<void>
    abort(): Promise<void>
    setModel(options: { provider: string; id: string }): Promise<void>
    listModels(): Promise<Array<{ id: string; name: string; provider: string }>>
  }

  export class AuthStorage {
    static create(): AuthStorage
    get(key: string): Promise<string | undefined>
    set(key: string, value: string): Promise<void>
  }

  export class ModelRegistry {
    static create(authStorage: AuthStorage): ModelRegistry
    list(): Promise<Array<{ id: string; name: string; provider: string }>>
  }

  export class SessionManager {
    static inMemory(): SessionManager
  }

  export interface CreateAgentSessionOptions {
    sessionManager: SessionManager
    authStorage: AuthStorage
    modelRegistry: ModelRegistry
    cwd: string
    provider?: string
    model?: string
    apiKey?: string
  }

  export function createAgentSession(
    options: CreateAgentSessionOptions,
  ): Promise<{ session: PiSession }>
}
