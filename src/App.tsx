import { useState } from 'react'
import LeftRail from './components/LeftRail.tsx'
import CenterStage from './components/CenterStage.tsx'
import WelcomeScreen from './components/WelcomeScreen.tsx'

export default function App() {
  const [selectedMissionId, setSelectedMissionId] = useState<string | null>(null)

  return (
    <div className="h-screen w-screen flex bg-studio-bg">
      <LeftRail
        selectedMissionId={selectedMissionId}
        onSelectMission={(id) => setSelectedMissionId(id)}
        onNewMission={() => setSelectedMissionId(null)}
      />
      {selectedMissionId ? (
        <CenterStage missionId={selectedMissionId} />
      ) : (
        <WelcomeScreen onStartMission={() => setSelectedMissionId('mission-001')} />
      )}
    </div>
  )
}
