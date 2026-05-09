export type HarnessId = 'opencode' | 'pi' | 'kimiflare'

export interface HarnessConfig {
  harnessId: HarnessId
  provider?: string
  model?: string
  apiKey?: string
  baseUrl?: string
  cwd?: string
}

export interface HarnessStartOptions {
  cwd: string
  config: HarnessConfig
  env?: Record<string, string>
}

export interface PromptOptions {
  images?: Array<{ path: string } | { data: string; mimeType: string }>
  mode?: 'plan' | 'edit' | 'auto'
}

export interface ModelInfo {
  id: string
  name: string
  provider: string
}

export interface HarnessState {
  isStreaming: boolean
  isCompacting: boolean
  currentModel?: string
  pendingSteer: string[]
  pendingFollowUp: string[]
  status: 'idle' | 'streaming' | 'compacting' | 'error'
}

export interface Task {
  id: string
  title: string
  status: 'pending' | 'in_progress' | 'done' | 'failed'
}

export type HarnessEvent =
  | { type: 'connected'; harnessId: HarnessId }
  | { type: 'disconnected'; harnessId: HarnessId; reason?: string }
  | { type: 'message.start'; messageId: string; role: string }
  | { type: 'message.delta'; messageId: string; text: string }
  | { type: 'message.reasoning'; messageId: string; text: string }
  | { type: 'message.end'; messageId: string }
  | { type: 'tool.start'; toolCallId: string; toolName: string; args: unknown }
  | { type: 'tool.result'; toolCallId: string; toolName: string; result: unknown; isError: boolean }
  | { type: 'usage'; inputTokens: number; outputTokens: number; reasoningTokens?: number; cost?: number }
  | { type: 'permission.request'; requestId: string; toolName: string; args: unknown }
  | { type: 'permission.resolved'; requestId: string; decision: 'allow' | 'allow_session' | 'deny' }
  | { type: 'tasks.update'; tasks: Task[] }
  | { type: 'status'; status: HarnessState['status'] }
  | { type: 'error'; message: string; recoverable: boolean }

export interface FileChangeEvent {
  type: 'add' | 'change' | 'delete'
  path: string
}

export interface IHarness {
  readonly id: HarnessId
  readonly name: string
  readonly version: string

  start(options: HarnessStartOptions): Promise<void>
  stop(): Promise<void>

  sendPrompt(prompt: string, options?: PromptOptions): Promise<void>
  steer(message: string): Promise<void>
  followUp(message: string): Promise<void>
  abort(): Promise<void>

  getState(): Promise<HarnessState>
  setModel(modelId: string): Promise<void>
  listModels(): Promise<ModelInfo[]>

  onEvent(callback: (event: HarnessEvent) => void): () => void

  approvePermission(permissionId: string, approved: boolean): Promise<void>
}
