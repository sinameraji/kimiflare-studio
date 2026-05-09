import { useState, useCallback, useEffect, useRef } from 'react'
import type {
  Mission,
  PlanData,
  ActivityItem,
  RiskItem,
  ArchitectureDelta,
  FileChangeItem,
} from '../../electron/store/missionStore.js'
import type { HarnessEvent } from '../types/harness.ts'

export type { Mission } from '../../electron/store/missionStore.js'

export type MissionPhase = Mission['phase']

export interface Anomaly {
  id: string
  category: string
  severity: 'warning' | 'critical'
  message: string
  timestamp: number
}

function parsePlanFromText(text: string): PlanData {
  const defaultDelta: ArchitectureDelta = {
    before: { nodes: [], edges: [] },
    after: { nodes: [], edges: [] },
  }

  const defaultPlan: PlanData = {
    approach: text.trim().slice(0, 3000),
    architectureDelta: defaultDelta,
    risks: [],
    costProjection: { tokens: '—', apiCost: '—', infrastructure: '—', timeEstimate: '—' },
    alternatives: [],
  }

  // Extract approach
  const approachMatch = text.match(/##\s*Approach\s*\n?([\s\S]*?)(?=\n##\s|$)/i)
  if (approachMatch) {
    defaultPlan.approach = approachMatch[1].trim()
  }

  // Extract risks
  const risksMatch = text.match(/##\s*Risks?\s*\n?([\s\S]*?)(?=\n##\s|$)/i)
  if (risksMatch) {
    const risksText = risksMatch[1]
    const riskLines = risksText
      .split('\n')
      .filter((l) => l.trim().startsWith('-') || l.trim().startsWith('*'))
    defaultPlan.risks = riskLines
      .map((line) => {
        const cleaned = line.replace(/^[-*]\s*/, '').trim()
        const levelMatch = cleaned.match(/\b(high|medium|low)\b/i)
        const level = (levelMatch?.[1].toLowerCase() as RiskItem['level']) || 'medium'
        const categoryMatch = cleaned.match(/\b(Security|Performance|Operational)\b/i)
        const category = categoryMatch?.[1] || 'Operational'
        return {
          category,
          level,
          confidence: 'medium' as RiskItem['confidence'],
          description: cleaned,
        }
      })
      .slice(0, 6)
  }

  // Extract cost projection
  const costMatch = text.match(/##\s*Cost\s*Projection\s*\n?([\s\S]*?)(?=\n##\s|$)/i)
  if (costMatch) {
    const costText = costMatch[1]
    const tokensMatch = costText.match(/(~?\d+[KkMm]?\s*tokens?|~?\d+[KkMm]?)/i)
    const costAmtMatch = costText.match(/\$[\d.]+/)
    const timeMatch = costText.match(/(\d+[-\s]?\d*\s*(hours?|hrs?|days?|minutes?))/i)
    defaultPlan.costProjection.tokens = tokensMatch ? tokensMatch[1] : '—'
    defaultPlan.costProjection.apiCost = costAmtMatch ? costAmtMatch[0] : '—'
    defaultPlan.costProjection.timeEstimate = timeMatch ? timeMatch[1] : '—'
  }

  // Extract alternatives
  const altMatch = text.match(/##\s*Alternatives?\s*\n?([\s\S]*?)(?=\n##\s|$)/i)
  if (altMatch) {
    const altText = altMatch[1]
    const altBlocks = altText.split(/\n\n+/).filter((b) => b.trim().startsWith('-') || b.trim().startsWith('*'))
    defaultPlan.alternatives = altBlocks.slice(0, 3).map((block) => {
      const lines = block.split('\n').map((l) => l.replace(/^[-*]\s*/, '').trim())
      const name = lines[0] || 'Alternative'
      const pros = lines.filter((l) => l.toLowerCase().startsWith('pro')).map((l) => l.replace(/pros?:\s*/i, ''))
      const cons = lines.filter((l) => l.toLowerCase().startsWith('con')).map((l) => l.replace(/cons?:\s*/i, ''))
      return { name, pros, cons }
    })
  }

  return defaultPlan
}

export function useMission(missionId: string | null) {
  const [mission, setMission] = useState<Mission | null>(null)
  const [anomalies, setAnomalies] = useState<Anomaly[]>([])
  const planTextRef = useRef('')
  const missionRef = useRef(mission)
  missionRef.current = mission

  const skipNextSyncRef = useRef(false)
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Load mission from store on init; create default if missing
  useEffect(() => {
    if (!missionId) {
      setMission(null)
      setAnomalies([])
      planTextRef.current = ''
      return
    }

    const id = missionId
    let cancelled = false
    async function load() {
      try {
        const stored = await window.electronAPI.mission.get(id)
        if (cancelled) return
        if (stored) {
          skipNextSyncRef.current = true
          setMission(stored)
        } else {
          const created = await window.electronAPI.mission.create({
            id,
            title: 'New Mission',
            workspacePath: '',
            harnessId: 'kimiflare',
            phase: 'intent',
            status: 'pending_approval',
            intent: '',
            activity: [],
            usage: { inputTokens: 0, outputTokens: 0, reasoningTokens: 0, cost: 0 },
            fileChanges: [],
          })
          if (cancelled) return
          skipNextSyncRef.current = true
          setMission(created)
        }
      } catch (err) {
        console.error('[useMission] failed to load mission:', err)
      }
    }

    load()
    setAnomalies([])
    planTextRef.current = ''

    return () => {
      cancelled = true
    }
  }, [missionId])

  // Debounced sync to missionStore whenever local state changes
  useEffect(() => {
    if (!mission) return
    if (skipNextSyncRef.current) {
      skipNextSyncRef.current = false
      return
    }

    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current)
    }

    syncTimeoutRef.current = setTimeout(async () => {
      try {
        await window.electronAPI.mission.update(mission.id, {
          title: mission.title,
          workspacePath: mission.workspacePath,
          harnessId: mission.harnessId,
          phase: mission.phase,
          status: mission.status,
          intent: mission.intent,
          plan: mission.plan,
          activity: mission.activity,
          fileChanges: mission.fileChanges,
          usage: mission.usage,
        })
      } catch (err) {
        console.error('[useMission] sync failed:', err)
      }
    }, 500)

    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current)
      }
    }
  }, [mission])

  const updatePhase = useCallback((phase: MissionPhase) => {
    setMission((prev) => (prev ? { ...prev, phase, updatedAt: Date.now() } : prev))
  }, [])

  const updateStatus = useCallback((status: Mission['status']) => {
    setMission((prev) => (prev ? { ...prev, status, updatedAt: Date.now() } : prev))
  }, [])

  const setTitle = useCallback((title: string) => {
    setMission((prev) => (prev ? { ...prev, title, updatedAt: Date.now() } : prev))
  }, [])

  const setIntent = useCallback((intent: string) => {
    setMission((prev) => (prev ? { ...prev, intent, updatedAt: Date.now() } : prev))
  }, [])

  const updatePlan = useCallback((plan: PlanData) => {
    setMission((prev) => (prev ? { ...prev, plan, updatedAt: Date.now() } : prev))
  }, [])

  const appendActivity = useCallback((item: ActivityItem) => {
    setMission((prev) =>
      prev ? { ...prev, activity: [...prev.activity, item], updatedAt: Date.now() } : prev,
    )
  }, [])

  const accumulatePlanDelta = useCallback((text: string) => {
    planTextRef.current += text
  }, [])

  const parsePlan = useCallback(() => {
    const plan = parsePlanFromText(planTextRef.current)
    planTextRef.current = ''
    setMission((prev) => (prev ? { ...prev, plan, updatedAt: Date.now() } : prev))
  }, [])

  const recordFileChange = useCallback((path: string, type: 'add' | 'change' | 'delete') => {
    setMission((prev) => {
      if (!prev) return prev
      const change: FileChangeItem = { path, type, timestamp: Date.now() }
      const updated = { ...prev, fileChanges: [...prev.fileChanges, change], updatedAt: Date.now() }
      return updated
    })

    // Anomaly detection
    setMission((prev) => {
      if (!prev) return prev
      const uniqueFiles = new Set(prev.fileChanges.map((c) => c.path)).size
      if (uniqueFiles === 20 || uniqueFiles === 50) {
        setAnomalies((a) => [
          ...a,
          {
            id: `anomaly-${Date.now()}`,
            category: 'Scope',
            severity: uniqueFiles >= 50 ? 'critical' : 'warning',
            message: `This mission has touched ${uniqueFiles} unique files — ${uniqueFiles >= 50 ? 'critically broad' : 'unusually broad'} scope. Review the plan to ensure scope has not crept.`,
            timestamp: Date.now(),
          },
        ])
      }
      return prev
    })
  }, [])

  const processEvent = useCallback((event: HarnessEvent) => {
    const currentPhase = missionRef.current?.phase

    switch (event.type) {
      case 'message.delta': {
        if (currentPhase === 'plan') {
          accumulatePlanDelta(event.text)
        }
        break
      }
      case 'message.reasoning': {
        if (currentPhase === 'plan') {
          accumulatePlanDelta(event.text)
        }
        break
      }
      case 'message.end': {
        if (currentPhase === 'plan') {
          parsePlan()
        }
        break
      }
      case 'usage': {
        setMission((prev) => {
          if (!prev) return prev
          return {
            ...prev,
            usage: {
              inputTokens: prev.usage.inputTokens + (event.inputTokens || 0),
              outputTokens: prev.usage.outputTokens + (event.outputTokens || 0),
              reasoningTokens: prev.usage.reasoningTokens + (event.reasoningTokens || 0),
              cost: prev.usage.cost + (event.cost || 0),
            },
            updatedAt: Date.now(),
          }
        })
        break
      }
      case 'tool.start': {
        appendActivity({
          id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          type: 'execution',
          timestamp: Date.now(),
          payload: { action: `Running ${event.toolName}…`, toolName: event.toolName, args: event.args },
        })
        break
      }
      case 'tool.result': {
        appendActivity({
          id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          type: 'execution',
          timestamp: Date.now(),
          payload: {
            action: `${event.toolName} → ${event.isError ? 'failed' : 'ok'}`,
            result: event.result,
            isError: event.isError,
          },
        })
        break
      }
      case 'error': {
        appendActivity({
          id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          type: 'error',
          timestamp: Date.now(),
          payload: { message: event.message },
        })
        updateStatus('failed')
        break
      }
      case 'status': {
        if (event.status === 'error') {
          updateStatus('failed')
        }
        break
      }
      default:
        break
    }
  }, [accumulatePlanDelta, appendActivity, updateStatus])

  return {
    mission,
    anomalies,
    updatePhase,
    updateStatus,
    setTitle,
    setIntent,
    updatePlan,
    appendActivity,
    accumulatePlanDelta,
    parsePlan,
    recordFileChange,
    processEvent,
    setMission,
  }
}
