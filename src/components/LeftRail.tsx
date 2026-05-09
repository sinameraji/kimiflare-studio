import { Plus } from 'lucide-react'
import { sampleMission } from '../data/sample.ts'

const statusDot: Record<string, string> = {
  pending_approval: 'bg-studio-warning',
  in_progress: 'bg-studio-primary animate-pulse',
  completed: 'bg-studio-success',
  failed: 'bg-studio-critical',
}

export default function LeftRail() {
  return (
    <aside className="w-52 bg-studio-surface flex flex-col h-full border-r border-studio-elevated">
      {/* Header */}
      <div className="px-4 py-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-studio-primary flex items-center justify-center">
            <span className="text-white font-bold text-xs">K</span>
          </div>
          <div>
            <h1 className="font-semibold text-sm text-studio-text leading-tight">KimiFlare</h1>
            <p className="text-[11px] text-studio-text-tertiary leading-tight">Studio</p>
          </div>
        </div>
      </div>

      {/* Mission Queue */}
      <div className="flex-1 overflow-y-auto px-3">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-studio-text-tertiary px-2 block mb-2">
          Missions
        </span>
        <div className="space-y-0.5">
          <button className="w-full flex items-center gap-2 px-2 py-2 rounded-md bg-studio-elevated text-studio-text text-xs text-left">
            <div className={`w-1.5 h-1.5 rounded-full ${statusDot[sampleMission.status]}`} />
            <span className="flex-1 truncate">{sampleMission.title}</span>
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="px-3 py-3 border-t border-studio-elevated">
        <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-studio-elevated text-studio-text-secondary text-xs transition-colors">
          <Plus className="w-3.5 h-3.5" />
          <span>New Mission</span>
        </button>
      </div>
    </aside>
  )
}
