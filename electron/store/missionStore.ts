export interface ActivityItem {
  id: string
  type: 'intent' | 'plan' | 'execution' | 'verification' | 'steer' | 'error'
  timestamp: number
  payload: unknown
}

export interface Node {
  id: string
  label: string
  type: 'service' | 'database'
  isNew?: boolean
}

export interface Edge {
  from: string
  to: string
}

export interface ArchitectureDelta {
  before: { nodes: Node[]; edges: Edge[] }
  after: { nodes: Node[]; edges: Edge[] }
}

export interface RiskItem {
  category: string
  level: 'low' | 'medium' | 'high'
  confidence: 'low' | 'medium' | 'high'
  description: string
}

export interface CostProjection {
  tokens: string
  apiCost: string
  infrastructure: string
  timeEstimate: string
}

export interface Alternative {
  name: string
  pros: string[]
  cons: string[]
}

export interface PlanData {
  approach: string
  architectureDelta: ArchitectureDelta
  risks: RiskItem[]
  costProjection: CostProjection
  alternatives: Alternative[]
}

export interface UsageData {
  inputTokens: number
  outputTokens: number
  reasoningTokens: number
  cost: number
}

export interface Mission {
  id: string
  title: string
  workspacePath: string
  harnessId: string
  phase: 'intent' | 'plan' | 'execute' | 'verify' | 'complete' | 'rolled_back'
  status: 'pending_approval' | 'in_progress' | 'completed' | 'failed' | 'aborted'
  intent: string
  plan?: PlanData
  activity: ActivityItem[]
  usage: UsageData
  createdAt: number
  updatedAt: number
}

export class MissionStore {
  private missions = new Map<string, Mission>()

  create(mission: Omit<Mission, 'createdAt' | 'updatedAt'>): Mission {
    const now = Date.now()
    const full: Mission = { ...mission, createdAt: now, updatedAt: now }
    this.missions.set(mission.id, full)
    return full
  }

  get(id: string): Mission | undefined {
    return this.missions.get(id)
  }

  update(id: string, patch: Partial<Mission>): Mission | undefined {
    const existing = this.missions.get(id)
    if (!existing) return undefined
    const updated = { ...existing, ...patch, updatedAt: Date.now() }
    this.missions.set(id, updated)
    return updated
  }

  delete(id: string): boolean {
    return this.missions.delete(id)
  }

  list(): Mission[] {
    return Array.from(this.missions.values()).sort((a, b) => b.updatedAt - a.updatedAt)
  }
}

export const missionStore = new MissionStore()
