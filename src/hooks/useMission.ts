import { useState, useCallback } from 'react'
import type { PlanData } from '../../electron/store/missionStore.js'

export type MissionPhase = 'intent' | 'plan' | 'execute' | 'verify' | 'complete' | 'rolled_back'

export interface ActivityItem {
  id: string
  type: 'intent' | 'plan' | 'execution' | 'verification' | 'steer' | 'error'
  timestamp: number
  payload: unknown
}

export interface Mission {
  id: string
  workspacePath: string
  harnessId: string
  phase: MissionPhase
  intent: string
  plan?: PlanData
  activity: ActivityItem[]
  createdAt: number
  updatedAt: number
}

export function useMission(missionId: string | null) {
  const [mission, setMission] = useState<Mission | null>(null)

  const updatePhase = useCallback((phase: MissionPhase) => {
    setMission((prev) => (prev ? { ...prev, phase, updatedAt: Date.now() } : prev))
  }, [])

  const appendActivity = useCallback((item: ActivityItem) => {
    setMission((prev) =>
      prev ? { ...prev, activity: [...prev.activity, item], updatedAt: Date.now() } : prev,
    )
  }, [])

  const updatePlan = useCallback((plan: PlanData) => {
    setMission((prev) => (prev ? { ...prev, plan, updatedAt: Date.now() } : prev))
  }, [])

  const setIntent = useCallback((intent: string) => {
    setMission((prev) => (prev ? { ...prev, intent, updatedAt: Date.now() } : prev))
  }, [])

  return { mission, updatePhase, appendActivity, updatePlan, setIntent, setMission }
}
