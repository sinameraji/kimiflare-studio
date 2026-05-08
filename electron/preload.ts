import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  // Placeholder for future IPC calls
  sendMessage: (channel: string, data: unknown) => ipcRenderer.send(channel, data),
  onMessage: (channel: string, callback: (...args: unknown[]) => void) => ipcRenderer.on(channel, (_event, ...args) => callback(...args)),
})
