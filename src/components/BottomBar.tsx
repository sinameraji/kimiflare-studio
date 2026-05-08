import { Wifi, Wrench, Clock, DollarSign } from 'lucide-react'
import { sampleMission } from '../data/sample.ts'

export default function BottomBar() {
  return (
    <footer className="h-10 bg-studio-surface border-t border-studio-elevated/50 flex items-center px-4 justify-between text-xs">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <Wifi className="w-3.5 h-3.5 text-studio-success" />
          <span className="text-studio-text-secondary">Connected</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Wrench className="w-3.5 h-3.5 text-studio-info" />
          <span className="text-studio-text-secondary">3 tools active</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-studio-text-tertiary" />
          <span className="text-studio-text-secondary">Session: 12m 34s</span>
        </div>
        <div className="flex items-center gap-1.5">
          <DollarSign className="w-3.5 h-3.5 text-studio-cost" />
          <span className="text-studio-cost font-medium">${sampleMission.actualCost.toFixed(2)} / ~${sampleMission.estimatedCost}</span>
        </div>
      </div>
    </footer>
  )
}
