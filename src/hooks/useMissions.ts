import { useState, useEffect, useCallback } from 'react'
import type { Mission } from '../../electron/store/missionStore.js'

export function useMissions() {
  const [missions, setMissions] = useState<Mission[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const refresh = useCallback(async () => {
    setIsLoading(true)
    try {
      const list = await window.electronAPI.mission.list()
      setMissions(list)
    } catch (err) {
      console.error('[useMissions] failed to list missions:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const createMission = useCallback(
    async (mission: Omit<Mission, 'createdAt' | 'updatedAt'>) => {
      const created = await window.electronAPI.mission.create(mission)
      setMissions((prev) => [created, ...prev])
      return created
    },
    [],
  )

  const updateMission = useCallback(async (id: string, patch: Partial<Mission>) => {
    const updated = await window.electronAPI.mission.update(id, patch)
    if (updated) {
      setMissions((prev) => prev.map((m) => (m.id === id ? updated : m)))
    }
    return updated
  }, [])

  const deleteMission = useCallback(async (id: string) => {
    const ok = await window.electronAPI.mission.delete(id)
    if (ok) {
      setMissions((prev) => prev.filter((m) => m.id !== id))
    }
    return ok
  }, [])

  return { missions, isLoading, refresh, createMission, updateMission, deleteMission }
}
