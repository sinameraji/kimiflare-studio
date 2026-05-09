import type {
  HarnessConfig,
  HarnessEvent,
  HarnessState,
  FileChangeEvent,
  ModelInfo,
  PromptOptions,
} from './harness.ts'

export interface ElectronAPI {
  harness: {
    start: (config: HarnessConfig) => Promise<void>
    stop: () => Promise<void>
    sendPrompt: (prompt: string, options?: PromptOptions) => Promise<void>
    steer: (message: string) => Promise<void>
    followUp: (message: string) => Promise<void>
    abort: () => Promise<void>
    getState: () => Promise<HarnessState>
    setModel: (modelId: string) => Promise<void>
    listModels: () => Promise<ModelInfo[]>
    approvePermission: (requestId: string, approved: boolean) => Promise<void>
    onEvent: (callback: (event: HarnessEvent) => void) => () => void
  }
  fs: {
    selectFolder: () => Promise<string | undefined>
    readFile: (path: string) => Promise<string>
    watchDirectory: (path: string) => Promise<void>
    unwatchDirectory: (path: string) => Promise<void>
    onFileChange: (callback: (change: FileChangeEvent) => void) => () => void
  }
  config: {
    get: <T>(key: string) => Promise<T | undefined>
    set: <T>(key: string, value: T) => Promise<void>
    getAll: () => Promise<Record<string, unknown>>
  }
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
