import { Plus, Radio } from 'lucide-react'

const statusDot: Record<string, string> = {
  pending_approval: 'bg-studio-warning',
  in_progress: 'bg-studio-primary animate-pulse',
  completed: 'bg-studio-success',
  failed: 'bg-studio-critical',
}

const phaseLabel: Record<string, string> = {
  intent: 'Intent',
  plan: 'Plan',
  execute: 'Execute',
  verify: 'Verify',
}

export interface MissionItem {
  id: string
  title: string
  phase: string
  status: string
  harnessId: string
  updatedAt: number
}

interface LeftRailProps {
  missions: MissionItem[]
  selectedMissionId: string | null
  onSelectMission: (id: string) => void
  onNewMission: () => void
  isHarnessConnected?: boolean
}

export default function LeftRail({
  missions,
  selectedMissionId,
  onSelectMission,
  onNewMission,
  isHarnessConnected,
}: LeftRailProps) {
  return (
    <aside className="w-60 bg-studio-surface flex flex-col h-full border-r border-studio-elevated">
      {/* Header */}
      <div className="px-4 py-4">
        <div className="flex items-center gap-2.5">
          <img src="/logo.png" alt="KimiFlare" className="w-7 h-7 rounded-md object-cover" />
          <div>
            <h1 className="text-sm font-semibold text-studio-text tracking-tight">KimiFlare</h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Radio className={`w-3 h-3 ${isHarnessConnected ? 'text-studio-success' : 'text-studio-text-tertiary'}`} />
              <span className="text-[10px] text-studio-text-tertiary">
                {isHarnessConnected ? 'Harness online' : 'No harness'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* New Mission */}
      <div className="px-3 pb-3">
        <button
          onClick={onNewMission}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-studio-primary text-white text-xs font-medium hover:bg-studio-primary-light transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          New Mission
        </button>
      </div>

      {/* Mission List */}
      <div className="flex-1 overflow-y-auto px-3">
        <div className="text-[10px] font-semibold uppercase tracking-widest text-studio-text-tertiary px-1 mb-2">
          Missions
        </div>
        <div className="space-y-1">
          {missions.map((mission) => (
            <button
              key={mission.id}
              onClick={() => onSelectMission(mission.id)}
              className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors ${
                selectedMissionId === mission.id
                  ? 'bg-studio-primary/10 border border-studio-primary/20'
                  : 'hover:bg-studio-elevated-hover/30 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className={`w-1.5 h-1.5 rounded-full ${statusDot[mission.status] || 'bg-studio-text-tertiary'}`} />
                <span className="text-xs font-medium text-studio-text truncate">{mission.title}</span>
              </div>
              <div className="flex items-center gap-2 ml-3.5">
                <span className="text-[10px] text-studio-text-tertiary">{phaseLabel[mission.phase] || mission.phase}</span>
                <span className="text-[10px] text-studio-text-tertiary">·</span>
                <span className="text-[10px] text-studio-text-tertiary capitalize">{mission.harnessId}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </aside>
  )
}
