import type { HarnessEvent } from '../types/harness.ts'

export interface Anomaly {
  id: string
  severity: 'warning' | 'critical'
  category: 'scope' | 'cost' | 'reliability' | 'security'
  message: string
  timestamp: number
}

interface AnomalyState {
  toolResults: Array<{ toolName: string; isError: boolean; timestamp: number }>
  usageEvents: Array<{ inputTokens: number; outputTokens: number; timestamp: number }>
  fileChanges: Array<{ path: string; timestamp: number }>
  planFileMentions: number
}

const WINDOW_MS = 60_000 // 1 minute sliding window
const SCOPE_FILE_THRESHOLD = 20
const CONSECUTIVE_ERROR_THRESHOLD = 3
const COST_SPIKE_MULTIPLIER = 3
const PLAN_FILE_MENTION_THRESHOLD = 15

export function createAnomalyDetector() {
  const state: AnomalyState = {
    toolResults: [],
    usageEvents: [],
    fileChanges: [],
    planFileMentions: 0,
  }

  function pruneOld(now: number) {
    const cutoff = now - WINDOW_MS
    state.toolResults = state.toolResults.filter((r) => r.timestamp > cutoff)
    state.usageEvents = state.usageEvents.filter((u) => u.timestamp > cutoff)
    state.fileChanges = state.fileChanges.filter((f) => f.timestamp > cutoff)
  }

  function checkScopeAnomaly(): Anomaly | null {
    const uniqueFiles = new Set(state.fileChanges.map((f) => f.path))
    if (uniqueFiles.size > SCOPE_FILE_THRESHOLD) {
      return {
        id: `anomaly-scope-${Date.now()}`,
        severity: 'warning',
        category: 'scope',
        message: `This change touches ${uniqueFiles.size} files — unusually broad. Consider narrowing the scope.`,
        timestamp: Date.now(),
      }
    }
    return null
  }

  function checkReliabilityAnomaly(): Anomaly | null {
    // Check last N consecutive errors
    const recent = state.toolResults.slice(-CONSECUTIVE_ERROR_THRESHOLD)
    if (
      recent.length >= CONSECUTIVE_ERROR_THRESHOLD &&
      recent.every((r) => r.isError)
    ) {
      return {
        id: `anomaly-reliability-${Date.now()}`,
        severity: 'critical',
        category: 'reliability',
        message: `${CONSECUTIVE_ERROR_THRESHOLD} consecutive tool failures. The agent may be stuck in a loop or the environment is misconfigured.`,
        timestamp: Date.now(),
      }
    }
    return null
  }

  function checkCostAnomaly(): Anomaly | null {
    if (state.usageEvents.length < 2) return null
    const recent = state.usageEvents.slice(-5)
    const avgTokens =
      recent.reduce((sum, u) => sum + u.inputTokens + u.outputTokens, 0) /
      recent.length
    const last = recent[recent.length - 1]
    const lastTotal = last.inputTokens + last.outputTokens
    if (avgTokens > 0 && lastTotal > avgTokens * COST_SPIKE_MULTIPLIER) {
      return {
        id: `anomaly-cost-${Date.now()}`,
        severity: 'warning',
        category: 'cost',
        message: `Token usage spike detected: ${lastTotal.toLocaleString()} tokens in one turn (~${Math.round(lastTotal / avgTokens)}× average).`,
        timestamp: Date.now(),
      }
    }
    return null
  }

  function checkPlanScopeAnomaly(): Anomaly | null {
    if (state.planFileMentions > PLAN_FILE_MENTION_THRESHOLD) {
      return {
        id: `anomaly-plan-${Date.now()}`,
        severity: 'warning',
        category: 'scope',
        message: `Plan mentions ${state.planFileMentions} files — very broad scope. Consider breaking into smaller missions.`,
        timestamp: Date.now(),
      }
    }
    return null
  }

  function processEvent(event: HarnessEvent): Anomaly | null {
    const now = Date.now()
    pruneOld(now)

    switch (event.type) {
      case 'tool.result': {
        state.toolResults.push({
          toolName: event.toolName,
          isError: event.isError,
          timestamp: now,
        })
        return checkReliabilityAnomaly()
      }
      case 'usage': {
        state.usageEvents.push({
          inputTokens: event.inputTokens || 0,
          outputTokens: event.outputTokens || 0,
          timestamp: now,
        })
        return checkCostAnomaly()
      }
      case 'message.delta': {
        // Rough heuristic: count file path mentions in plan text
        const fileMatches = (event.text as string).match(/[\w/-]+\.(ts|tsx|js|jsx|py|go|rs|java|rb|php)/g)
        if (fileMatches) {
          state.planFileMentions += fileMatches.length
          return checkPlanScopeAnomaly()
        }
        break
      }
      default:
        break
    }
    return null
  }

  function recordFileChange(path: string) {
    const now = Date.now()
    pruneOld(now)
    state.fileChanges.push({ path, timestamp: now })
    return checkScopeAnomaly()
  }

  function reset() {
    state.toolResults = []
    state.usageEvents = []
    state.fileChanges = []
    state.planFileMentions = 0
  }

  return { processEvent, recordFileChange, reset }
}
