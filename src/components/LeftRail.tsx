import { useState } from 'react'
import {
  ChevronDown,
  Layout,
  Code,
  Shield,
  Zap,
  CheckCircle,
  FolderGit2,
  Plus,
  Radio,
} from 'lucide-react'
import { sampleAgents, sampleRiskRadar } from '../data/sample.ts'

const agentIcons: Record<string, React.ReactNode> = {
  Layout: <Layout className="w-3.5 h-3.5" />,
  Code: <Code className="w-3.5 h-3.5" />,
  Shield: <Shield className="w-3.5 h-3.5" />,
  Zap: <Zap className="w-3.5 h-3.5" />,
  CheckCircle: <CheckCircle className="w-3.5 h-3.5" />,
}

const statusColors: Record<string, string> = {
  idle: 'bg-studio-text-tertiary',
  working: 'bg-studio-primary',
  reviewing: 'bg-studio-warning',
}

export default function LeftRail() {
  const [projectOpen, setProjectOpen] = useState(true)

  return (
    <aside className="w-56 bg-studio-surface flex flex-col h-full border-r border-studio-elevated">
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

      <div className="flex-1 overflow-y-auto px-3">
        {/* Project Selector */}
        <div className="mb-5">
          <button
            onClick={() => setProjectOpen(!projectOpen)}
            className="w-full flex items-center justify-between px-2 py-1 mb-1"
          >
            <span className="text-[10px] font-semibold uppercase tracking-widest text-studio-text-tertiary">Project</span>
            <ChevronDown className={`w-3 h-3 text-studio-text-tertiary transition-transform ${projectOpen ? '' : '-rotate-90'}`} />
          </button>
          {projectOpen && (
            <div className="space-y-0.5">
              <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md bg-studio-elevated text-studio-text text-xs">
                <FolderGit2 className="w-3.5 h-3.5 text-studio-primary" />
                <span className="flex-1 text-left">api-gateway-v2</span>
                <Radio className="w-2.5 h-2.5 text-studio-success" />
              </button>
              <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-studio-elevated text-studio-text-secondary text-xs transition-colors">
                <FolderGit2 className="w-3.5 h-3.5 text-studio-text-tertiary" />
                <span className="flex-1 text-left">kimiflare-core</span>
              </button>
              <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-studio-elevated text-studio-text-tertiary text-xs transition-colors">
                <Plus className="w-3.5 h-3.5" />
                <span className="flex-1 text-left">Add project</span>
              </button>
            </div>
          )}
        </div>

        {/* Agent Cabinet — compact */}
        <div className="mb-5">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-studio-text-tertiary px-2">Agents</span>
          <div className="mt-1.5 space-y-0.5">
            {sampleAgents.map((agent) => (
              <div
                key={agent.id}
                className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-studio-elevated transition-colors cursor-pointer group"
              >
                <div className={`w-1.5 h-1.5 rounded-full ${statusColors[agent.status]} ${agent.status !== 'idle' ? 'animate-pulse' : ''}`} />
                <div className="text-studio-text-tertiary group-hover:text-studio-text-secondary transition-colors">
                  {agentIcons[agent.icon]}
                </div>
                <span className="text-xs text-studio-text-secondary group-hover:text-studio-text transition-colors flex-1">
                  {agent.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Radar — minimal */}
        <div className="mb-5">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-studio-text-tertiary px-2">Risk</span>
          <div className="mt-2 px-2 space-y-2">
            {Object.entries(sampleRiskRadar).map(([key, data]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-[11px] text-studio-text-secondary capitalize">{key}</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-16 h-1 rounded-full overflow-hidden bg-studio-elevated">
                    <div
                      className={`h-full rounded-full ${
                        data.score >= 80 ? 'bg-studio-success' :
                        data.score >= 50 ? 'bg-studio-warning' :
                        'bg-studio-critical'
                      }`}
                      style={{ width: `${data.score}%` }}
                    />
                  </div>
                  <span className={`text-[10px] font-medium w-10 text-right ${
                    data.score >= 80 ? 'text-studio-success' :
                    data.score >= 50 ? 'text-studio-warning' :
                    'text-studio-critical'
                  }`}>
                    {data.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-studio-elevated">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-studio-success" />
          <span className="text-[11px] text-studio-text-tertiary">Kimi-K2.6</span>
        </div>
      </div>
    </aside>
  )
}
