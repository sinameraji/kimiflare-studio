import Database from 'better-sqlite3'
import { app } from 'electron'
import path from 'node:path'

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

export interface FileChangeItem {
  path: string
  type: 'add' | 'change' | 'delete'
  timestamp: number
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
  fileChanges: FileChangeItem[]
  usage: UsageData
  createdAt: number
  updatedAt: number
}

const DB_PATH = path.join(app.getPath('userData'), 'missions.db')

function safeJsonParse<T>(text: string | null, fallback: T): T {
  if (!text) return fallback
  try {
    return JSON.parse(text) as T
  } catch {
    return fallback
  }
}

export class MissionStore {
  private db: Database.Database

  constructor() {
    this.db = new Database(DB_PATH)
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS missions (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL DEFAULT '',
        workspacePath TEXT NOT NULL DEFAULT '',
        harnessId TEXT NOT NULL DEFAULT '',
        phase TEXT NOT NULL DEFAULT 'intent',
        status TEXT NOT NULL DEFAULT 'pending_approval',
        intent TEXT NOT NULL DEFAULT '',
        plan TEXT,
        activity TEXT NOT NULL DEFAULT '[]',
        fileChanges TEXT NOT NULL DEFAULT '[]',
        usage TEXT NOT NULL DEFAULT '{"inputTokens":0,"outputTokens":0,"reasoningTokens":0,"cost":0}',
        createdAt INTEGER NOT NULL,
        updatedAt INTEGER NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_missions_updated ON missions(updatedAt DESC);
    `)
  }

  private rowToMission(row: Database.RunResult & Record<string, unknown>): Mission {
    return {
      id: row.id as string,
      title: row.title as string,
      workspacePath: row.workspacePath as string,
      harnessId: row.harnessId as string,
      phase: row.phase as Mission['phase'],
      status: row.status as Mission['status'],
      intent: row.intent as string,
      plan: safeJsonParse<PlanData | undefined>(row.plan as string | null, undefined),
      activity: safeJsonParse<ActivityItem[]>(row.activity as string, []),
      fileChanges: safeJsonParse<FileChangeItem[]>(row.fileChanges as string, []),
      usage: safeJsonParse<UsageData>(row.usage as string, { inputTokens: 0, outputTokens: 0, reasoningTokens: 0, cost: 0 }),
      createdAt: row.createdAt as number,
      updatedAt: row.updatedAt as number,
    }
  }

  create(mission: Omit<Mission, 'createdAt' | 'updatedAt'>): Mission {
    const now = Date.now()
    const full: Mission = { ...mission, createdAt: now, updatedAt: now }
    const stmt = this.db.prepare(`
      INSERT INTO missions (id, title, workspacePath, harnessId, phase, status, intent, plan, activity, fileChanges, usage, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    stmt.run(
      full.id,
      full.title,
      full.workspacePath,
      full.harnessId,
      full.phase,
      full.status,
      full.intent,
      full.plan ? JSON.stringify(full.plan) : null,
      JSON.stringify(full.activity),
      JSON.stringify(full.fileChanges),
      JSON.stringify(full.usage),
      full.createdAt,
      full.updatedAt,
    )
    return full
  }

  get(id: string): Mission | undefined {
    const stmt = this.db.prepare('SELECT * FROM missions WHERE id = ?')
    const row = stmt.get(id) as (Database.RunResult & Record<string, unknown>) | undefined
    return row ? this.rowToMission(row) : undefined
  }

  update(id: string, patch: Partial<Mission>): Mission | undefined {
    const existing = this.get(id)
    if (!existing) return undefined
    const updated = { ...existing, ...patch, updatedAt: Date.now() }

    const stmt = this.db.prepare(`
      UPDATE missions SET
        title = ?,
        workspacePath = ?,
        harnessId = ?,
        phase = ?,
        status = ?,
        intent = ?,
        plan = ?,
        activity = ?,
        fileChanges = ?,
        usage = ?,
        updatedAt = ?
      WHERE id = ?
    `)
    stmt.run(
      updated.title,
      updated.workspacePath,
      updated.harnessId,
      updated.phase,
      updated.status,
      updated.intent,
      updated.plan ? JSON.stringify(updated.plan) : null,
      JSON.stringify(updated.activity),
      JSON.stringify(updated.fileChanges),
      JSON.stringify(updated.usage),
      updated.updatedAt,
      id,
    )
    return updated
  }

  delete(id: string): boolean {
    const stmt = this.db.prepare('DELETE FROM missions WHERE id = ?')
    const result = stmt.run(id)
    return result.changes > 0
  }

  list(): Mission[] {
    const stmt = this.db.prepare('SELECT * FROM missions ORDER BY updatedAt DESC')
    const rows = stmt.all() as (Database.RunResult & Record<string, unknown>)[]
    return rows.map((r) => this.rowToMission(r))
  }
}

export const missionStore = new MissionStore()
