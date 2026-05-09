import { useState, useCallback, useEffect } from 'react'
import type { HarnessConfig } from './types/harness.ts'
import LeftRail from './components/LeftRail.tsx'
import CenterStage from './components/CenterStage.tsx'
import WelcomeScreen from './components/WelcomeScreen.tsx'
import OnboardingScreen from './components/OnboardingScreen.tsx'
import PermissionModal from './components/PermissionModal.tsx'
import { useHarness } from './hooks/useHarness.ts'
import { useFS } from './hooks/useFS.ts'
import { useConfig } from './hooks/useConfig.ts'
import { useMissions } from './hooks/useMissions.ts'

type AppView = 'welcome' | 'onboarding' | 'mission'

const LAST_CONFIG_KEY = 'lastHarnessConfig'
const LAST_WORKSPACE_KEY = 'lastWorkspacePath'

export default function App() {
  const [view, setView] = useState<AppView>('welcome')
  const [selectedMissionId, setSelectedMissionId] = useState<string | null>(null)
  const [isRestoring, setIsRestoring] = useState(true)

  const harness = useHarness()
  const fs = useFS()
  const config = useConfig()
  const missions = useMissions()

  // Try to restore previous session on mount
  useEffect(() => {
    let cancelled = false
    async function restore() {
      const lastConfig = await config.get<HarnessConfig & { cwd?: string }>(LAST_CONFIG_KEY)
      if (!cancelled && lastConfig?.harnessId) {
        const cwd = lastConfig.cwd || (await config.get<string>(LAST_WORKSPACE_KEY)) || process.cwd()
        await harness.start({ ...lastConfig, cwd })
        setView('mission')
        // Select the most recent mission if any exist
        const list = await window.electronAPI.mission.list()
        if (list.length > 0) {
          setSelectedMissionId(list[0].id)
        } else {
          setSelectedMissionId('mission-001')
        }
      }
      setIsRestoring(false)
    }
    restore()
    return () => { cancelled = true }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleStartOnboarding = useCallback(() => {
    setView('onboarding')
  }, [])

  const handleOnboardingComplete = useCallback(
    async (cfg: HarnessConfig, workspacePath: string) => {
      await config.set(LAST_CONFIG_KEY, { ...cfg, cwd: workspacePath })
      await config.set(LAST_WORKSPACE_KEY, workspacePath)
      await harness.start({ ...cfg, cwd: workspacePath })

      // Create a new mission in the store
      const mission = await missions.createMission({
        id: `mission-${Date.now()}`,
        title: 'New Mission',
        workspacePath,
        harnessId: cfg.harnessId,
        phase: 'intent',
        status: 'pending_approval',
        intent: '',
        activity: [],
        usage: { inputTokens: 0, outputTokens: 0, reasoningTokens: 0, cost: 0 },
        fileChanges: [],
      })

      setView('mission')
      setSelectedMissionId(mission.id)
    },
    [harness, config, missions],
  )

  const handleSelectFolder = useCallback(async () => {
    return fs.selectFolder()
  }, [fs])

  const handleNewMission = useCallback(async () => {
    const lastConfig = await config.get<HarnessConfig & { cwd?: string }>(LAST_CONFIG_KEY)
    const lastWorkspace = await config.get<string>(LAST_WORKSPACE_KEY)
    const workspacePath = lastWorkspace || lastConfig?.cwd || ''
    const harnessId = lastConfig?.harnessId || 'kimiflare'

    const mission = await missions.createMission({
      id: `mission-${Date.now()}`,
      title: 'New Mission',
      workspacePath,
      harnessId,
      phase: 'intent',
      status: 'pending_approval',
      intent: '',
      activity: [],
      usage: { inputTokens: 0, outputTokens: 0, reasoningTokens: 0, cost: 0 },
      fileChanges: [],
    })
    setSelectedMissionId(mission.id)
  }, [missions, config])

  if (isRestoring) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-studio-bg">
        <span className="text-sm text-studio-text-secondary">Restoring session...</span>
      </div>
    )
  }

  const leftRailMissions = missions.missions.map((m) => ({
    id: m.id,
    title: m.title,
    phase: m.phase,
    status: m.status,
    harnessId: m.harnessId,
    updatedAt: m.updatedAt,
  }))

  return (
    <div className="h-screen w-screen flex bg-studio-bg">
      {view === 'welcome' && (
        <WelcomeScreen onStartMission={handleStartOnboarding} />
      )}

      {view === 'onboarding' && (
        <OnboardingScreen
          onComplete={handleOnboardingComplete}
          onSelectFolder={handleSelectFolder}
        />
      )}

      {view === 'mission' && (
        <>
          <LeftRail
            missions={leftRailMissions}
            selectedMissionId={selectedMissionId}
            onSelectMission={(id) => setSelectedMissionId(id)}
            onNewMission={handleNewMission}
            isHarnessConnected={harness.isConnected}
          />
          {selectedMissionId ? (
            <CenterStage missionId={selectedMissionId} fileChanges={fs.changes} />
          ) : (
            <WelcomeScreen onStartMission={handleStartOnboarding} />
          )}
        </>
      )}

      <PermissionModal
        permissions={harness.pendingPermissions}
        onDecide={(requestId, decision) => harness.approvePermission(requestId, decision).catch(console.error)}
      />
    </div>
  )
}
