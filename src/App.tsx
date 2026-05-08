import { useState } from 'react'
import LeftRail from './components/LeftRail.tsx'
import CenterStage from './components/CenterStage.tsx'
import RightPanel from './components/RightPanel.tsx'
import BottomBar from './components/BottomBar.tsx'
import WelcomeScreen from './components/WelcomeScreen.tsx'

export default function App() {
  const [hasActiveMission, setHasActiveMission] = useState(false)

  return (
    <div className="h-screen w-screen flex flex-col bg-studio-bg">
      <div className="flex-1 flex overflow-hidden">
        <LeftRail />
        {hasActiveMission ? (
          <>
            <CenterStage />
            <RightPanel />
          </>
        ) : (
          <WelcomeScreen onStartMission={() => setHasActiveMission(true)} />
        )}
      </div>
      <BottomBar />
    </div>
  )
}
