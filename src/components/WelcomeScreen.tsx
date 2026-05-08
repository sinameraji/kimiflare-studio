import { useState } from 'react'
import {
  Target,
  Shield,
  DollarSign,
  GitBranch,
  BookOpen,
  ArrowRight,
  Sparkles,
  ChevronRight,
} from 'lucide-react'

interface WelcomeScreenProps {
  onStartMission: () => void
}

const features = [
  {
    icon: Shield,
    title: 'Risk First',
    description: 'See security, performance, and operational risks before a single line is written.',
  },
  {
    icon: GitBranch,
    title: 'Architecture, Not Code',
    description: 'Review system diagrams and deltas. Trust the agent with implementation details.',
  },
  {
    icon: BookOpen,
    title: 'Decision Journal',
    description: 'Every architectural choice is logged with rationale, trade-offs, and reversibility.',
  },
  {
    icon: DollarSign,
    title: 'Cost Transparency',
    description: 'Know the token spend, API cost, and infrastructure impact before you approve.',
  },
]

const recentMissions = [
  { title: 'Refactor Auth to JWT + Redis', status: 'completed', cost: '$11.20' },
  { title: 'Add rate limiting to API gateway', status: 'in_progress', cost: '$3.40' },
  { title: 'Migrate from REST to GraphQL', status: 'planning', cost: '~$45.00' },
]

export default function WelcomeScreen({ onStartMission }: WelcomeScreenProps) {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null)

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto">
      {/* Hero */}
      <div className="px-12 pt-12 pb-8">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 text-studio-primary" />
          <span className="text-[10px] font-semibold uppercase tracking-widest text-studio-primary">
            AI Engineering Dashboard
          </span>
        </div>
        <h1 className="text-3xl font-semibold text-studio-text tracking-tight mb-3">
          Don't review code.
          <br />
          <span className="text-studio-primary">Direct architecture.</span>
        </h1>
        <p className="text-sm text-studio-text-secondary max-w-lg leading-relaxed mb-6">
          KimiFlare Studio is how CTOs and staff engineers delegate to AI agents.
          You set the goal, review the plan, assess the risks — the agent handles the rest.
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={onStartMission}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-studio-primary text-white text-sm font-medium hover:bg-studio-primary-light transition-colors"
          >
            <Target className="w-4 h-4" />
            Start a Mission
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button className="px-5 py-2.5 rounded-lg bg-studio-surface text-studio-text-secondary text-sm font-medium hover:text-studio-text border border-studio-elevated hover:border-studio-elevated-hover transition-colors">
            Open Project
          </button>
        </div>
      </div>

      {/* Features Grid */}
      <div className="px-12 py-6 border-t border-studio-elevated">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-studio-text-tertiary mb-4 block">
          Why Studio
        </span>
        <div className="grid grid-cols-2 gap-3 max-w-2xl">
          {features.map((feature, i) => {
            const Icon = feature.icon
            return (
              <div
                key={i}
                onMouseEnter={() => setHoveredFeature(i)}
                onMouseLeave={() => setHoveredFeature(null)}
                className={`p-4 rounded-xl border transition-all cursor-default ${
                  hoveredFeature === i
                    ? 'border-studio-primary/30 bg-studio-primary/5'
                    : 'border-studio-elevated bg-studio-surface'
                }`}
              >
                <Icon className={`w-5 h-5 mb-2 transition-colors ${
                  hoveredFeature === i ? 'text-studio-primary' : 'text-studio-text-tertiary'
                }`} />
                <h3 className="text-sm font-medium text-studio-text mb-1">{feature.title}</h3>
                <p className="text-xs text-studio-text-secondary leading-relaxed">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="px-12 py-6 border-t border-studio-elevated">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-studio-text-tertiary mb-4 block">
          Recent Missions
        </span>
        <div className="max-w-2xl space-y-1">
          {recentMissions.map((mission, i) => (
            <button
              key={i}
              className="w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-studio-surface transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${
                  mission.status === 'completed' ? 'bg-studio-success' :
                  mission.status === 'in_progress' ? 'bg-studio-primary animate-pulse' :
                  'bg-studio-warning'
                }`} />
                <span className="text-sm text-studio-text group-hover:text-studio-primary transition-colors">
                  {mission.title}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-[10px] uppercase font-medium ${
                  mission.status === 'completed' ? 'text-studio-success' :
                  mission.status === 'in_progress' ? 'text-studio-primary' :
                  'text-studio-warning'
                }`}>
                  {mission.status.replace('_', ' ')}
                </span>
                <span className="text-xs text-studio-cost font-medium">{mission.cost}</span>
                <ChevronRight className="w-3.5 h-3.5 text-studio-text-tertiary group-hover:text-studio-text transition-colors" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
