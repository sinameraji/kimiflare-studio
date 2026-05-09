declare module '@opencode-ai/sdk' {
  export interface OpencodeServer {
    url: string
    close(): void
  }

  export interface OpencodeClient {
    session: {
      prompt(options: { message: string; mode?: string }): Promise<void>
    }
    permission: {
      approve(requestId: string): Promise<void>
      deny(requestId: string): Promise<void>
    }
  }

  export interface CreateOpencodeServerOptions {
    hostname?: string
    port?: number
    config?: Record<string, unknown>
  }

  export function createOpencodeServer(
    options: CreateOpencodeServerOptions,
  ): Promise<OpencodeServer>

  export function createOpencodeClient(options: {
    baseUrl: string
  }): OpencodeClient
}
