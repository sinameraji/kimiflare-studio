import { useState, useEffect, useCallback } from 'react'
import type { FileChangeEvent } from '../types/harness.ts'

export function useFS() {
  const [changes, setChanges] = useState<FileChangeEvent[]>([])

  useEffect(() => {
    const unsubscribe = window.electronAPI.fs.onFileChange((change) => {
      setChanges((prev) => [...prev, change])
    })
    return unsubscribe
  }, [])

  const selectFolder = useCallback(() => {
    return window.electronAPI.fs.selectFolder()
  }, [])

  const readFile = useCallback((path: string) => {
    return window.electronAPI.fs.readFile(path)
  }, [])

  const watchDirectory = useCallback((path: string) => {
    setChanges([])
    return window.electronAPI.fs.watchDirectory(path)
  }, [])

  const unwatchDirectory = useCallback((path: string) => {
    return window.electronAPI.fs.unwatchDirectory(path)
  }, [])

  return { changes, selectFolder, readFile, watchDirectory, unwatchDirectory }
}
