import { useState } from 'react'
import LeftRail from './components/LeftRail.tsx'
import CenterStage from './components/CenterStage.tsx'
import WelcomeScreen from './components/WelcomeScreen.tsx'

export default function App() {
  const [hasActiveMission, setHasActiveMission] = useState(false)

  return (
    <div className="h-screen w-screen flex bg-studio-bg">
      <LeftRail />
      {hasActiveMission ? (
        <CenterStage />
      ) : (
        <WelcomeScreen onStartMission={() => setHasActiveMission(true)} />
      )}
    </div>
  )
}
