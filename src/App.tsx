import LeftRail from './components/LeftRail.tsx'
import CenterStage from './components/CenterStage.tsx'
import RightPanel from './components/RightPanel.tsx'
import BottomBar from './components/BottomBar.tsx'

export default function App() {
  return (
    <div className="h-screen w-screen flex flex-col bg-studio-bg">
      <div className="flex-1 flex overflow-hidden">
        <LeftRail />
        <CenterStage />
        <RightPanel />
      </div>
      <BottomBar />
    </div>
  )
}
