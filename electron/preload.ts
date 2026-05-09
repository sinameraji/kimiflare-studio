import { contextBridge, ipcRenderer } from 'electron'
import type {
  HarnessConfig,
  HarnessEvent,
  FileChangeEvent,
  PromptOptions,
  PermissionDecision,
} from '../src/types/harness.ts'

contextBridge.exposeInMainWorld('electronAPI', {
  harness: {
    start: (config: HarnessConfig) => ipcRenderer.invoke('harness:start', config),
    stop: () => ipcRenderer.invoke('harness:stop'),
    sendPrompt: (prompt: string, options?: PromptOptions) =>
      ipcRenderer.invoke('harness:sendPrompt', prompt, options),
    steer: (message: string) => ipcRenderer.invoke('harness:steer', message),
    followUp: (message: string) => ipcRenderer.invoke('harness:followUp', message),
    abort: () => ipcRenderer.invoke('harness:abort'),
    getState: () => ipcRenderer.invoke('harness:getState'),
    setModel: (modelId: string) => ipcRenderer.invoke('harness:setModel', modelId),
    listModels: () => ipcRenderer.invoke('harness:listModels'),
    approvePermission: (requestId: string, decision: PermissionDecision) =>
      ipcRenderer.invoke('harness:approvePermission', requestId, decision),
    onEvent: (callback: (event: HarnessEvent) => void) => {
      const handler = (_: unknown, event: HarnessEvent) => callback(event)
      ipcRenderer.on('harness:event', handler)
      return () => ipcRenderer.off('harness:event', handler)
    },
  },

  fs: {
    selectFolder: () => ipcRenderer.invoke('fs:selectFolder'),
    readFile: (path: string) => ipcRenderer.invoke('fs:readFile', path),
    watchDirectory: (path: string) => ipcRenderer.invoke('fs:watchDirectory', path),
    unwatchDirectory: (path: string) => ipcRenderer.invoke('fs:unwatchDirectory', path),
    onFileChange: (callback: (change: FileChangeEvent) => void) => {
      const handler = (_: unknown, change: FileChangeEvent) => callback(change)
      ipcRenderer.on('fs:fileChange', handler)
      return () => ipcRenderer.off('fs:fileChange', handler)
    },
  },

  config: {
    get: <T>(key: string) => ipcRenderer.invoke('config:get', key) as Promise<T | undefined>,
    set: <T>(key: string, value: T) => ipcRenderer.invoke('config:set', key, value),
    getAll: () => ipcRenderer.invoke('config:getAll'),
  },
})
