import { ipcMain, dialog, BrowserWindow } from 'electron'
import fs from 'node:fs'
import { HarnessManager } from '../harness/HarnessManager.js'
import { configStore } from '../store/configStore.js'
import { watchWorkspace, unwatchWorkspace } from '../fs/watcher.js'

export function registerIpcHandlers(): void {
  const manager = HarnessManager.getInstance()

  ipcMain.handle('harness:start', async (_, config) => {
    await manager.start(config)
  })

  ipcMain.handle('harness:stop', async () => {
    await manager.stop()
  })

  ipcMain.handle('harness:sendPrompt', async (_, prompt, options) => {
    const harness = manager.getHarness()
    if (!harness) throw new Error('No harness active')
    await harness.sendPrompt(prompt, options)
  })

  ipcMain.handle('harness:steer', async (_, message) => {
    const harness = manager.getHarness()
    if (!harness) throw new Error('No harness active')
    await harness.steer(message)
  })

  ipcMain.handle('harness:followUp', async (_, message) => {
    const harness = manager.getHarness()
    if (!harness) throw new Error('No harness active')
    await harness.followUp(message)
  })

  ipcMain.handle('harness:abort', async () => {
    const harness = manager.getHarness()
    if (!harness) throw new Error('No harness active')
    await harness.abort()
  })

  ipcMain.handle('harness:getState', async () => {
    const harness = manager.getHarness()
    if (!harness) return null
    return harness.getState()
  })

  ipcMain.handle('harness:setModel', async (_, modelId) => {
    const harness = manager.getHarness()
    if (!harness) throw new Error('No harness active')
    await harness.setModel(modelId)
  })

  ipcMain.handle('harness:listModels', async () => {
    const harness = manager.getHarness()
    if (!harness) return []
    return harness.listModels()
  })

  ipcMain.handle('harness:approvePermission', async (_, requestId, decision) => {
    const harness = manager.getHarness()
    if (!harness) throw new Error('No harness active')
    await harness.approvePermission(requestId, decision)
  })

  // Forward harness events to all renderer windows
  manager.onEvent((event) => {
    for (const window of BrowserWindow.getAllWindows()) {
      window.webContents.send('harness:event', event)
    }
  })

  // Filesystem
  ipcMain.handle('fs:selectFolder', async () => {
    const result = await dialog.showOpenDialog({ properties: ['openDirectory'] })
    return result.filePaths[0]
  })

  ipcMain.handle('fs:readFile', async (_, filePath) => {
    return fs.promises.readFile(filePath, 'utf-8')
  })

  ipcMain.handle('fs:watchDirectory', async (_, dirPath) => {
    watchWorkspace(dirPath, (change) => {
      for (const window of BrowserWindow.getAllWindows()) {
        window.webContents.send('fs:fileChange', change)
      }
    })
  })

  ipcMain.handle('fs:unwatchDirectory', async (_, dirPath) => {
    unwatchWorkspace(dirPath)
  })

  // Config
  ipcMain.handle('config:get', async (_, key) => configStore.get(key))
  ipcMain.handle('config:set', async (_, key, value) => configStore.set(key, value))
  ipcMain.handle('config:getAll', async () => configStore.getAll())
}
