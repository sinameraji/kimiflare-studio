import { useState, useEffect, useCallback } from 'react'

export function useConfig() {
  const [config, setConfigState] = useState<Record<string, unknown>>({})

  useEffect(() => {
    window.electronAPI.config.getAll().then((all) => {
      setConfigState(all)
    })
  }, [])

  const get = useCallback(<T>(key: string): Promise<T | undefined> => {
    return window.electronAPI.config.get<T>(key)
  }, [])

  const set = useCallback(<T>(key: string, value: T) => {
    setConfigState((prev) => ({ ...prev, [key]: value }))
    return window.electronAPI.config.set(key, value)
  }, [])

  return { config, get, set }
}
