import { Wifi, Wrench, Clock, DollarSign } from 'lucide-react'
import { sampleMission } from '../data/sample.ts'

export default function BottomBar() {
  return (
    <footer className="h-8 bg-studio-surface border-t border-studio-elevated flex items-center px-4 justify-between text-[11px]">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <Wifi className="w-3 h-3 text-studio-success" />
          <span className="text-studio-text-tertiary">Connected</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Wrench className="w-3 h-3 text-studio-info" />
          <span className="text-studio-text-tertiary">3 tools</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3 h-3 text-studio-text-tertiary" />
          <span className="text-studio-text-tertiary">12m 34s</span>
        </div>
        <div className="flex items-center gap-1">
          <DollarSign className="w-3 h-3 text-studio-cost" />
          <span className="text-studio-cost">${sampleMission.actualCost.toFixed(2)}</span>
          <span className="text-studio-text-tertiary">/ ~${sampleMission.estimatedCost}</span>
        </div>
      </div>
    </footer>
  )
}
