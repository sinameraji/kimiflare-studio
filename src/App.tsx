import { useState, useCallback } from 'react'
import type { HarnessConfig } from './types/harness.ts'
import LeftRail from './components/LeftRail.tsx'
import CenterStage from './components/CenterStage.tsx'
import WelcomeScreen from './components/WelcomeScreen.tsx'
import OnboardingScreen from './components/OnboardingScreen.tsx'
import { useHarness } from './hooks/useHarness.ts'
import { useFS } from './hooks/useFS.ts'

type AppView = 'welcome' | 'onboarding' | 'mission'

export default function App() {
  const [view, setView] = useState<AppView>('welcome')
  const [selectedMissionId, setSelectedMissionId] = useState<string | null>(null)

  const harness = useHarness()
  const fs = useFS()

  const handleStartOnboarding = useCallback(() => {
    setView('onboarding')
  }, [])

  const handleOnboardingComplete = useCallback(
    async (config: HarnessConfig, workspacePath: string) => {
      await harness.start({ ...config, cwd: workspacePath })
      setView('mission')
      setSelectedMissionId('mission-001')
    },
    [harness],
  )

  const handleSelectFolder = useCallback(async () => {
    return fs.selectFolder()
  }, [fs])

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
            selectedMissionId={selectedMissionId}
            onSelectMission={(id) => setSelectedMissionId(id)}
            onNewMission={() => setSelectedMissionId(null)}
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
