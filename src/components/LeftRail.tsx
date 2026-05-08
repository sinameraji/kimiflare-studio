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
  Layout: <Layout className="w-4 h-4" />,
  Code: <Code className="w-4 h-4" />,
  Shield: <Shield className="w-4 h-4" />,
  Zap: <Zap className="w-4 h-4" />,
  CheckCircle: <CheckCircle className="w-4 h-4" />,
}

const statusColors: Record<string, string> = {
  idle: 'bg-studio-text-tertiary',
  working: 'bg-studio-primary animate-pulse',
  reviewing: 'bg-studio-warning animate-pulse',
}

export default function LeftRail() {
  const [projectOpen, setProjectOpen] = useState(true)
  const [agentsOpen, setAgentsOpen] = useState(true)
  const [riskOpen, setRiskOpen] = useState(true)

  return (
    <aside className="w-64 bg-studio-surface border-r border-studio-elevated/50 flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-4 border-b border-studio-elevated/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-studio-primary flex items-center justify-center">
            <span className="text-white font-bold text-sm">K</span>
          </div>
          <div>
            <h1 className="font-semibold text-sm text-studio-text">KimiFlare</h1>
            <p className="text-xs text-studio-text-secondary">Studio</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Project Selector */}
        <div className="px-3 py-2">
          <button
            onClick={() => setProjectOpen(!projectOpen)}
            className="w-full flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-studio-elevated/50 transition-colors"
          >
            <span className="text-label">Project</span>
            <ChevronDown className={`w-3.5 h-3.5 text-studio-text-secondary transition-transform ${projectOpen ? '' : '-rotate-90'}`} />
          </button>
          {projectOpen && (
            <div className="mt-1 space-y-0.5">
              <button className="w-full flex items-center gap-2 px-2 py-2 rounded-md bg-studio-elevated/50 text-studio-text text-sm">
                <FolderGit2 className="w-4 h-4 text-studio-primary" />
                <span className="flex-1 text-left">api-gateway-v2</span>
                <Radio className="w-3 h-3 text-studio-success" />
              </button>
              <button className="w-full flex items-center gap-2 px-2 py-2 rounded-md hover:bg-studio-elevated/30 text-studio-text-secondary text-sm transition-colors">
                <FolderGit2 className="w-4 h-4 text-studio-text-tertiary" />
                <span className="flex-1 text-left">kimiflare-core</span>
              </button>
              <button className="w-full flex items-center gap-2 px-2 py-2 rounded-md hover:bg-studio-elevated/30 text-studio-text-secondary text-sm transition-colors">
                <Plus className="w-4 h-4 text-studio-text-tertiary" />
                <span className="flex-1 text-left">Add project...</span>
              </button>
            </div>
          )}
        </div>

        {/* Agent Cabinet */}
        <div className="px-3 py-2">
          <button
            onClick={() => setAgentsOpen(!agentsOpen)}
            className="w-full flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-studio-elevated/50 transition-colors"
          >
            <span className="text-label">Agent Cabinet</span>
            <ChevronDown className={`w-3.5 h-3.5 text-studio-text-secondary transition-transform ${agentsOpen ? '' : '-rotate-90'}`} />
          </button>
          {agentsOpen && (
            <div className="mt-1 space-y-0.5">
              {sampleAgents.map((agent) => (
                <div
                  key={agent.id}
                  className="flex items-center gap-2 px-2 py-2 rounded-md hover:bg-studio-elevated/30 transition-colors group cursor-pointer"
                >
                  <div className={`w-2 h-2 rounded-full ${statusColors[agent.status]}`} />
                  <div className="text-studio-text-secondary group-hover:text-studio-text transition-colors">
                    {agentIcons[agent.icon]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-studio-text truncate">{agent.name}</p>
                    <p className="text-xs text-studio-text-tertiary truncate">{agent.description}</p>
                  </div>
                  <span className={`text-[10px] uppercase tracking-wider font-medium ${
                    agent.status === 'working' ? 'text-studio-primary' :
                    agent.status === 'reviewing' ? 'text-studio-warning' :
                    'text-studio-text-tertiary'
                  }`}>
                    {agent.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Risk Radar Mini */}
        <div className="px-3 py-2">
          <button
            onClick={() => setRiskOpen(!riskOpen)}
            className="w-full flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-studio-elevated/50 transition-colors"
          >
            <span className="text-label">Risk Radar</span>
            <ChevronDown className={`w-3.5 h-3.5 text-studio-text-secondary transition-transform ${riskOpen ? '' : '-rotate-90'}`} />
          </button>
          {riskOpen && (
            <div className="mt-2 space-y-2 px-2">
              {Object.entries(sampleRiskRadar).map(([key, data]) => (
                <div key={key} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-studio-text-secondary capitalize">{key}</span>
                    <span className={`text-xs font-medium ${
                      data.score >= 80 ? 'text-studio-success' :
                      data.score >= 50 ? 'text-studio-warning' :
                      'text-studio-critical'
                    }`}>
                      {data.label}
                    </span>
                  </div>
                  <div className="h-1.5 bg-studio-elevated rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        data.score >= 80 ? 'bg-studio-success' :
                        data.score >= 50 ? 'bg-studio-warning' :
                        'bg-studio-critical'
                      }`}
                      style={{ width: `${data.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Session Info */}
      <div className="px-4 py-3 border-t border-studio-elevated/50">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-studio-success animate-pulse" />
          <span className="text-xs text-studio-text-secondary">Connected to Kimi-K2.6</span>
        </div>
      </div>
    </aside>
  )
}
