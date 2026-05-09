import { useState, useCallback, useEffect } from 'react'
import type { HarnessConfig } from './types/harness.ts'
import LeftRail from './components/LeftRail.tsx'
import CenterStage from './components/CenterStage.tsx'
import WelcomeScreen from './components/WelcomeScreen.tsx'
import OnboardingScreen from './components/OnboardingScreen.tsx'
import { useHarness } from './hooks/useHarness.ts'
import { useFS } from './hooks/useFS.ts'
import { useConfig } from './hooks/useConfig.ts'

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

  // Try to restore previous session on mount
  useEffect(() => {
    let cancelled = false
    async function restore() {
      const lastConfig = await config.get<HarnessConfig & { cwd?: string }>(LAST_CONFIG_KEY)
      if (!cancelled && lastConfig?.harnessId) {
        const cwd = lastConfig.cwd || (await config.get<string>(LAST_WORKSPACE_KEY)) || process.cwd()
        await harness.start({ ...lastConfig, cwd })
        setView('mission')
        setSelectedMissionId('mission-001')
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
      setView('mission')
      setSelectedMissionId('mission-001')
    },
    [harness, config],
  )

  const handleSelectFolder = useCallback(async () => {
    return fs.selectFolder()
  }, [fs])

  if (isRestoring) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-studio-bg">
        <span className="text-sm text-studio-text-secondary">Restoring session...</span>
      </div>
    )
  }

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
            missions={[
              {
                id: 'mission-001',
                title: 'Current Mission',
                phase: 'plan',
                status: 'in_progress',
                harnessId: harness.state?.currentModel ? 'kimiflare' : 'none',
                updatedAt: Date.now(),
              },
            ]}
            selectedMissionId={selectedMissionId}
            onSelectMission={(id) => setSelectedMissionId(id)}
            onNewMission={() => setSelectedMissionId(null)}
            isHarnessConnected={harness.isConnected}
          />
          {selectedMissionId ? (
            <CenterStage missionId={selectedMissionId} />
          ) : (
            <WelcomeScreen onStartMission={handleStartOnboarding} />
          )}
        </>
      )}
    </div>
  )
}
