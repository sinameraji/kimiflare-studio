import { useState, useEffect, useCallback } from 'react'
import type { HarnessState, HarnessEvent, HarnessConfig, PromptOptions, PermissionDecision } from '../types/harness.ts'

export interface PendingPermission {
  requestId: string
  toolName: string
  args: unknown
}

export function useHarness() {
  const [state, setState] = useState<HarnessState | null>(null)
  const [events, setEvents] = useState<HarnessEvent[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [pendingPermissions, setPendingPermissions] = useState<PendingPermission[]>([])

  useEffect(() => {
    const unsubscribe = window.electronAPI.harness.onEvent((event) => {
      setEvents((prev) => [...prev, event])
      if (event.type === 'connected') setIsConnected(true)
      if (event.type === 'disconnected') setIsConnected(false)
      if (event.type === 'status') {
        setState((prev) => (prev ? { ...prev, status: event.status } : null))
      }
      if (event.type === 'permission.request') {
        setPendingPermissions((prev) => [
          ...prev,
          { requestId: event.requestId, toolName: event.toolName, args: event.args },
        ])
      }
      if (event.type === 'permission.resolved') {
        setPendingPermissions((prev) => prev.filter((p) => p.requestId !== event.requestId))
      }
    })
    return unsubscribe
  }, [])

  const start = useCallback((config: HarnessConfig) => {
    setEvents([])
    setPendingPermissions([])
    return window.electronAPI.harness.start(config)
  }, [])

  const stop = useCallback(() => {
    return window.electronAPI.harness.stop()
  }, [])

  const sendPrompt = useCallback((prompt: string, options?: PromptOptions) => {
    return window.electronAPI.harness.sendPrompt(prompt, options)
  }, [])

  const steer = useCallback((message: string) => {
    return window.electronAPI.harness.steer(message)
  }, [])

  const followUp = useCallback((message: string) => {
    return window.electronAPI.harness.followUp(message)
  }, [])

  const abort = useCallback(() => {
    return window.electronAPI.harness.abort()
  }, [])

  const setModel = useCallback((modelId: string) => {
    return window.electronAPI.harness.setModel(modelId)
  }, [])

  const listModels = useCallback(() => {
    return window.electronAPI.harness.listModels()
  }, [])

  const approvePermission = useCallback((requestId: string, decision: PermissionDecision) => {
    setPendingPermissions((prev) => prev.filter((p) => p.requestId !== requestId))
    return window.electronAPI.harness.approvePermission(requestId, decision)
  }, [])

  return {
    state,
    events,
    isConnected,
    pendingPermissions,
    start,
    stop,
    sendPrompt,
    steer,
    followUp,
    abort,
    setModel,
    listModels,
    approvePermission,
  }
}
