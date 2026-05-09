export interface ActivityItem {
  id: string
  type: 'intent' | 'plan' | 'execution' | 'verification' | 'steer' | 'error'
  timestamp: number
  payload: unknown
}

export interface PlanData {
  approach: string
  architectureDelta: string
  risks: string[]
  costProjection: string
  alternatives: string[]
}

export interface Mission {
  id: string
  workspacePath: string
  harnessId: string
  phase: 'intent' | 'plan' | 'execute' | 'verify' | 'complete' | 'rolled_back'
  intent: string
  plan?: PlanData
  activity: ActivityItem[]
  createdAt: number
  updatedAt: number
}

export class MissionStore {
  private missions = new Map<string, Mission>()

  create(mission: Omit<Mission, 'id' | 'createdAt' | 'updatedAt' | 'activity'>): Mission {
    const now = Date.now()
    const id = `mission-${now}-${Math.random().toString(36).slice(2, 7)}`
    const full: Mission = {
      ...mission,
      id,
      activity: [],
      createdAt: now,
      updatedAt: now,
    }
    this.missions.set(id, full)
    return full
  }

  update(id: string, patch: Partial<Mission>): Mission | undefined {
    const existing = this.missions.get(id)
    if (!existing) return undefined
    const updated = { ...existing, ...patch, updatedAt: Date.now() }
    this.missions.set(id, updated)
    return updated
  }

  appendActivity(id: string, item: ActivityItem): Mission | undefined {
    const existing = this.missions.get(id)
    if (!existing) return undefined
    existing.activity.push(item)
    existing.updatedAt = Date.now()
    return existing
  }

  list(workspacePath?: string): Mission[] {
    const all = Array.from(this.missions.values())
    if (workspacePath) {
      return all.filter((m) => m.workspacePath === workspacePath)
    }
    return all
  }

  get(id: string): Mission | undefined {
    return this.missions.get(id)
  }
}

export const missionStore = new MissionStore()
