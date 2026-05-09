import { useState, useEffect, useCallback } from 'react'
import type { HarnessState, HarnessEvent, HarnessConfig, PromptOptions } from '../types/harness.ts'

export function useHarness() {
  const [state, setState] = useState<HarnessState | null>(null)
  const [events, setEvents] = useState<HarnessEvent[]>([])
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const unsubscribe = window.electronAPI.harness.onEvent((event) => {
      setEvents((prev) => [...prev, event])
      if (event.type === 'connected') setIsConnected(true)
      if (event.type === 'disconnected') setIsConnected(false)
      if (event.type === 'status') {
        setState((prev) => (prev ? { ...prev, status: event.status } : null))
      }
    })
    return unsubscribe
  }, [])

  const start = useCallback((config: HarnessConfig) => {
    setEvents([])
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

  const approvePermission = useCallback((requestId: string, approved: boolean) => {
    return window.electronAPI.harness.approvePermission(requestId, approved)
  }, [])

  return {
    state,
    events,
    isConnected,
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
