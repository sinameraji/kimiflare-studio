import { useState } from 'react'
import {
  Target,
  FileText,
  Play,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Clock,
  DollarSign,
  Server,
  Cpu,
  ChevronRight,
  Shield,
  Zap,
  Activity,
  Lock,
} from 'lucide-react'
import { sampleMission, samplePlan, sampleActivity } from '../data/sample.ts'

const phases = [
  { id: 'intent', label: 'Intent', icon: Target },
  { id: 'plan', label: 'Plan', icon: FileText },
  { id: 'execute', label: 'Execute', icon: Play },
  { id: 'verify', label: 'Verify', icon: CheckCircle2 },
]

const riskIcons: Record<string, React.ReactNode> = {
  Security: <Shield className="w-4 h-4" />,
  Performance: <Zap className="w-4 h-4" />,
  Operational: <Activity className="w-4 h-4" />,
}

const riskColors: Record<string, string> = {
  low: 'text-studio-success border-studio-success/30 bg-studio-success/10',
  medium: 'text-studio-warning border-studio-warning/30 bg-studio-warning/10',
  high: 'text-studio-critical border-studio-critical/30 bg-studio-critical/10',
}

export default function CenterStage() {
  const [activePhase, setActivePhase] = useState('plan')
  const [selectedAlt, setSelectedAlt] = useState(2)
  const [approvalLevel, setApprovalLevel] = useState(50)

  return (
    <main className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Mission Header */}
      <div className="px-6 py-4 border-b border-studio-elevated/50">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-label">Mission</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-studio-warning/10 text-studio-warning border border-studio-warning/20">
                Pending Approval
              </span>
            </div>
            <h2 className="text-lg font-semibold text-studio-text">{sampleMission.title}</h2>
          </div>
          <div className="flex items-center gap-4 text-sm text-studio-text-secondary">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>2-3 hours</span>
            </div>
            <div className="flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-studio-cost" />
              <span className="text-studio-cost font-medium">~$12.45</span>
            </div>
          </div>
        </div>

        {/* Phase Navigation */}
        <div className="flex items-center gap-1 mt-4">
          {phases.map((phase, idx) => {
            const Icon = phase.icon
            const isActive = phase.id === activePhase
            const isPast = phases.findIndex(p => p.id === activePhase) > idx
            return (
              <button
                key={phase.id}
                onClick={() => setActivePhase(phase.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-studio-primary/20 text-studio-primary border border-studio-primary/30'
                    : isPast
                    ? 'text-studio-success hover:bg-studio-elevated/30'
                    : 'text-studio-text-tertiary hover:bg-studio-elevated/30'
                }`}
              >
                <Icon className="w-4 h-4" />
                {phase.label}
                {idx < phases.length - 1 && (
                  <ChevronRight className="w-3.5 h-3.5 ml-1 text-studio-text-tertiary" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Phase Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {activePhase === 'plan' && (
          <div className="space-y-6 max-w-4xl">
            {/* Approach Summary */}
            <section className="panel">
              <div className="panel-header">
                <h3 className="font-medium text-studio-text">Approach Summary</h3>
              </div>
              <div className="p-4">
                <p className="text-sm text-studio-text-secondary leading-relaxed">
                  {samplePlan.approach}
                </p>
              </div>
            </section>

            {/* Architecture Delta */}
            <section className="panel">
              <div className="panel-header">
                <h3 className="font-medium text-studio-text">Architecture Delta</h3>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <span className="text-label">Before</span>
                    <div className="p-3 rounded-lg bg-studio-bg border border-studio-elevated/50">
                      {samplePlan.architectureDelta.before.map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-studio-text-secondary">
                          <Server className="w-4 h-4 text-studio-text-tertiary" />
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <span className="text-label">After</span>
                    <div className="p-3 rounded-lg bg-studio-bg border border-studio-primary/30">
                      {samplePlan.architectureDelta.after.map((item, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-studio-text">
                          <Server className="w-4 h-4 text-studio-primary" />
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex justify-center mt-3">
                  <ArrowRight className="w-5 h-5 text-studio-primary" />
                </div>
              </div>
            </section>

            {/* Risk Assessment */}
            <section className="panel">
              <div className="panel-header">
                <h3 className="font-medium text-studio-text">Risk Assessment</h3>
                <AlertTriangle className="w-4 h-4 text-studio-warning" />
              </div>
              <div className="p-4 space-y-3">
                {samplePlan.risks.map((risk, i) => (
                  <div
                    key={i}
                    className={`flex items-start gap-3 p-3 rounded-lg border ${riskColors[risk.level]}`}
                  >
                    <div className="mt-0.5">{riskIcons[risk.category]}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">{risk.category}</span>
                        <span className={`text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded ${
                          risk.level === 'low' ? 'bg-studio-success/20 text-studio-success' :
                          risk.level === 'medium' ? 'bg-studio-warning/20 text-studio-warning' :
                          'bg-studio-critical/20 text-studio-critical'
                        }`}>
                          {risk.level}
                        </span>
                      </div>
                      <p className="text-sm opacity-90">{risk.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Cost Projection */}
            <section className="panel">
              <div className="panel-header">
                <h3 className="font-medium text-studio-text">Cost Projection</h3>
                <DollarSign className="w-4 h-4 text-studio-cost" />
              </div>
              <div className="p-4">
                <div className="grid grid-cols-4 gap-4">
                  <div className="p-3 rounded-lg bg-studio-bg border border-studio-elevated/50 text-center">
                    <Cpu className="w-5 h-5 text-studio-info mx-auto mb-2" />
                    <p className="text-lg font-semibold text-studio-text">{samplePlan.costProjection.tokens}</p>
                    <p className="text-xs text-studio-text-secondary">Tokens</p>
                  </div>
                  <div className="p-3 rounded-lg bg-studio-bg border border-studio-elevated/50 text-center">
                    <DollarSign className="w-5 h-5 text-studio-cost mx-auto mb-2" />
                    <p className="text-lg font-semibold text-studio-cost">{samplePlan.costProjection.apiCost}</p>
                    <p className="text-xs text-studio-text-secondary">API Cost</p>
                  </div>
                  <div className="p-3 rounded-lg bg-studio-bg border border-studio-elevated/50 text-center">
                    <Server className="w-5 h-5 text-studio-warning mx-auto mb-2" />
                    <p className="text-lg font-semibold text-studio-text">{samplePlan.costProjection.infrastructure}</p>
                    <p className="text-xs text-studio-text-secondary">Infrastructure</p>
                  </div>
                  <div className="p-3 rounded-lg bg-studio-bg border border-studio-elevated/50 text-center">
                    <Clock className="w-5 h-5 text-studio-success mx-auto mb-2" />
                    <p className="text-lg font-semibold text-studio-text">{samplePlan.costProjection.timeEstimate}</p>
                    <p className="text-xs text-studio-text-secondary">Time</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Alternative Approaches */}
            <section className="panel">
              <div className="panel-header">
                <h3 className="font-medium text-studio-text">Alternative Approaches</h3>
              </div>
              <div className="p-4 space-y-3">
                {samplePlan.alternatives.map((alt, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedAlt(i)}
                    className={`w-full text-left p-4 rounded-lg border transition-all ${
                      selectedAlt === i
                        ? 'border-studio-primary/50 bg-studio-primary/5'
                        : 'border-studio-elevated/50 hover:border-studio-elevated'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {selectedAlt === i && (
                          <div className="w-2 h-2 rounded-full bg-studio-primary" />
                        )}
                        <span className="font-medium text-studio-text">{alt.name}</span>
                        {i === 2 && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-studio-success/10 text-studio-success border border-studio-success/20">
                            Recommended
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-studio-success text-xs uppercase tracking-wider">Pros</span>
                        <ul className="mt-1 space-y-1">
                          {alt.pros.map((pro, j) => (
                            <li key={j} className="text-studio-text-secondary flex items-start gap-1.5">
                              <span className="text-studio-success mt-1">+</span>
                              {pro}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <span className="text-studio-critical text-xs uppercase tracking-wider">Cons</span>
                        <ul className="mt-1 space-y-1">
                          {alt.cons.map((con, j) => (
                            <li key={j} className="text-studio-text-secondary flex items-start gap-1.5">
                              <span className="text-studio-critical mt-1">−</span>
                              {con}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {/* Approval Control */}
            <section className="panel border-studio-primary/30">
              <div className="panel-header">
                <h3 className="font-medium text-studio-text">Approval</h3>
                <Lock className="w-4 h-4 text-studio-primary" />
              </div>
              <div className="p-6">
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-studio-critical">Reject</span>
                    <span className="text-studio-warning">Approve with Constraints</span>
                    <span className="text-studio-success">Full Autonomy</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={approvalLevel}
                    onChange={(e) => setApprovalLevel(Number(e.target.value))}
                    className="w-full h-2 bg-studio-elevated rounded-lg appearance-none cursor-pointer accent-studio-primary"
                  />
                  <div className="mt-3 text-center">
                    <span className={`text-sm font-medium ${
                      approvalLevel < 33 ? 'text-studio-critical' :
                      approvalLevel < 66 ? 'text-studio-warning' :
                      'text-studio-success'
                    }`}>
                      {approvalLevel < 33 ? 'Plan Rejected — Send back for revision' :
                       approvalLevel < 66 ? 'Approved with Constraints — Review each step' :
                       'Full Autonomy — Execute without interruption'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button className="flex-1 py-2.5 rounded-lg bg-studio-elevated text-studio-text-secondary text-sm font-medium hover:bg-studio-elevated/80 transition-colors">
                    Request Changes
                  </button>
                  <button className="flex-1 py-2.5 rounded-lg bg-studio-primary text-white text-sm font-medium hover:bg-studio-primary/90 transition-colors">
                    Execute Plan
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}

        {activePhase === 'intent' && (
          <div className="max-w-2xl mx-auto mt-8">
            <div className="panel">
              <div className="panel-header">
                <h3 className="font-medium text-studio-text">New Mission</h3>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="text-label block mb-2">Goal</label>
                  <textarea
                    className="w-full h-24 bg-studio-bg border border-studio-elevated/50 rounded-lg p-3 text-sm text-studio-text placeholder-studio-text-tertiary focus:outline-none focus:border-studio-primary/50 resize-none"
                    placeholder="What do you want to build or change?"
                    defaultValue="Refactor the authentication middleware from session-based to JWT with Redis-backed revocation"
                  />
                </div>
                <div>
                  <label className="text-label block mb-2">Constraints</label>
                  <textarea
                    className="w-full h-20 bg-studio-bg border border-studio-elevated/50 rounded-lg p-3 text-sm text-studio-text placeholder-studio-text-tertiary focus:outline-none focus:border-studio-primary/50 resize-none"
                    placeholder="Non-negotiables: budget, latency, compliance, tech stack..."
                    defaultValue="Must maintain backward compatibility during migration. No downtime allowed. Budget under $100/mo additional infra."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-label block mb-2">Confidence Level</label>
                    <select className="w-full bg-studio-bg border border-studio-elevated/50 rounded-lg p-2.5 text-sm text-studio-text focus:outline-none focus:border-studio-primary/50">
                      <option>Explore — Research and report</option>
                      <option selected>Execute — Build and ship</option>
                      <option>Emergency Fix — Minimal review</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-label block mb-2">Context Scope</label>
                    <select className="w-full bg-studio-bg border border-studio-elevated/50 rounded-lg p-2.5 text-sm text-studio-text focus:outline-none focus:border-studio-primary/50">
                      <option>Auth module only</option>
                      <option selected>Auth + User API</option>
                      <option>Full codebase</option>
                    </select>
                  </div>
                </div>
                <button className="w-full py-2.5 rounded-lg bg-studio-primary text-white text-sm font-medium hover:bg-studio-primary/90 transition-colors">
                  Generate Plan
                </button>
              </div>
            </div>
          </div>
        )}

        {activePhase === 'execute' && (
          <div className="max-w-3xl mx-auto mt-8 space-y-4">
            <div className="panel">
              <div className="panel-header">
                <h3 className="font-medium text-studio-text">Live Activity</h3>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-studio-primary animate-pulse" />
                  <span className="text-xs text-studio-primary">Executing</span>
                </div>
              </div>
              <div className="p-4 space-y-3">
                {sampleActivity.map((item) => (
                  <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg bg-studio-bg border border-studio-elevated/30">
                    <div className={`w-2 h-2 rounded-full mt-1.5 ${
                      item.type === 'warning' ? 'bg-studio-warning' :
                      item.type === 'info' ? 'bg-studio-info' :
                      'bg-studio-primary'
                    }`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-studio-text">{item.agent}</span>
                        <span className="text-xs text-studio-text-tertiary">{item.time}</span>
                      </div>
                      <p className="text-sm text-studio-text-secondary mt-0.5">{item.action}</p>
                    </div>
                  </div>
                ))}
                <div className="flex items-center gap-2 p-3">
                  <div className="w-2 h-2 rounded-full bg-studio-primary animate-pulse" />
                  <span className="text-sm text-studio-text-secondary animate-pulse">Waiting for next action...</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activePhase === 'verify' && (
          <div className="max-w-3xl mx-auto mt-8 space-y-4">
            <div className="panel">
              <div className="panel-header">
                <h3 className="font-medium text-studio-text">Verification Results</h3>
                <CheckCircle2 className="w-4 h-4 text-studio-success" />
              </div>
              <div className="p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-studio-success/10 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-studio-success" />
                </div>
                <h3 className="text-lg font-semibold text-studio-text mb-2">Mission Complete</h3>
                <p className="text-sm text-studio-text-secondary mb-6">
                  All verification checks passed. 12 test scenarios executed successfully.
                </p>
                <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                  <div className="p-3 rounded-lg bg-studio-bg border border-studio-elevated/50">
                    <p className="text-lg font-semibold text-studio-success">12/12</p>
                    <p className="text-xs text-studio-text-secondary">Tests Passed</p>
                  </div>
                  <div className="p-3 rounded-lg bg-studio-bg border border-studio-elevated/50">
                    <p className="text-lg font-semibold text-studio-text">0</p>
                    <p className="text-xs text-studio-text-secondary">Breaking Changes</p>
                  </div>
                  <div className="p-3 rounded-lg bg-studio-bg border border-studio-elevated/50">
                    <p className="text-lg font-semibold text-studio-cost">$11.20</p>
                    <p className="text-xs text-studio-text-secondary">Actual Cost</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
