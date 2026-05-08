import { useState } from 'react'
import {
  Target,
  FileText,
  Play,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  ChevronDown,
  Clock,
  DollarSign,
  Shield,
  Zap,
  Activity,
  Lock,
  ArrowRight,
  Server,
  Cpu,
} from 'lucide-react'
import { sampleMission, samplePlan, sampleActivity } from '../data/sample.ts'

const phases = [
  { id: 'intent', label: 'Intent', icon: Target },
  { id: 'plan', label: 'Plan', icon: FileText },
  { id: 'execute', label: 'Execute', icon: Play },
  { id: 'verify', label: 'Verify', icon: CheckCircle2 },
]

const riskIcons: Record<string, React.ReactNode> = {
  Security: <Shield className="w-3.5 h-3.5" />,
  Performance: <Zap className="w-3.5 h-3.5" />,
  Operational: <Activity className="w-3.5 h-3.5" />,
}

function CollapsibleSection({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="py-4 border-t border-studio-elevated/30">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between group"
      >
        <span className="text-[10px] font-semibold uppercase tracking-widest text-studio-text-tertiary group-hover:text-studio-text-secondary transition-colors">
          {title}
        </span>
        {open ? (
          <ChevronDown className="w-3.5 h-3.5 text-studio-text-tertiary" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 text-studio-text-tertiary" />
        )}
      </button>
      {open && <div className="mt-3">{children}</div>}
    </div>
  )
}

export default function CenterStage() {
  const [activePhase, setActivePhase] = useState('plan')
  const [selectedAlt, setSelectedAlt] = useState(2)
  const [approvalLevel, setApprovalLevel] = useState(50)

  return (
    <main className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Mission Header */}
      <div className="px-8 pt-8 pb-4">
        <div className="flex items-baseline justify-between mb-1">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-studio-text-tertiary">Mission</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-studio-warning/10 text-studio-warning">
              Pending Approval
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-studio-text-tertiary">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3 h-3" />
              2-3 hours
            </span>
            <span className="flex items-center gap-1.5 text-studio-cost">
              <DollarSign className="w-3 h-3" />
              ~$12.45
            </span>
          </div>
        </div>
        <h2 className="text-xl font-semibold text-studio-text tracking-tight">{sampleMission.title}</h2>

        {/* Phase Tabs */}
        <div className="flex items-center gap-6 mt-6 border-b border-studio-elevated/30">
          {phases.map((phase) => {
            const Icon = phase.icon
            const isActive = phase.id === activePhase
            return (
              <button
                key={phase.id}
                onClick={() => setActivePhase(phase.id)}
                className={`flex items-center gap-2 pb-3 text-sm font-medium border-b-2 transition-colors ${
                  isActive
                    ? 'text-studio-primary border-studio-primary'
                    : 'text-studio-text-tertiary border-transparent hover:text-studio-text-secondary'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {phase.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Phase Content */}
      <div className="flex-1 overflow-y-auto px-8 pb-8">
        {activePhase === 'plan' && (
          <div className="max-w-2xl">
            {/* Primary: Risk Summary — the thing that needs attention */}
            <div className="py-5">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-studio-warning" />
                <span className="text-sm font-medium text-studio-text">Risk Assessment</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-studio-critical/10 text-studio-critical font-medium">
                  1 high, 1 medium
                </span>
              </div>
              <div className="space-y-2">
                {samplePlan.risks.map((risk, i) => (
                  <div key={i} className="flex items-start gap-3 py-2">
                    <div className={`mt-0.5 ${
                      risk.level === 'low' ? 'text-studio-success' :
                      risk.level === 'medium' ? 'text-studio-warning' :
                      'text-studio-critical'
                    }`}>
                      {riskIcons[risk.category]}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-studio-text">{risk.category}</span>
                        <span className={`text-[10px] uppercase font-bold ${
                          risk.level === 'low' ? 'text-studio-success' :
                          risk.level === 'medium' ? 'text-studio-warning' :
                          'text-studio-critical'
                        }`}>
                          {risk.level}
                        </span>
                      </div>
                      <p className="text-xs text-studio-text-secondary mt-0.5 leading-relaxed">{risk.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Primary: Cost — quick scan */}
            <div className="py-4 border-t border-studio-elevated/30">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-studio-cost" />
                <span className="text-sm font-medium text-studio-text">Cost Projection</span>
              </div>
              <div className="flex items-center gap-6 text-xs">
                <span className="text-studio-text-secondary">
                  <span className="text-studio-text font-medium">{samplePlan.costProjection.tokens}</span> tokens
                </span>
                <span className="text-studio-text-secondary">
                  <span className="text-studio-cost font-medium">{samplePlan.costProjection.apiCost}</span> API
                </span>
                <span className="text-studio-text-secondary">
                  <span className="text-studio-text font-medium">{samplePlan.costProjection.infrastructure}</span> infra
                </span>
                <span className="text-studio-text-secondary">
                  <span className="text-studio-text font-medium">{samplePlan.costProjection.timeEstimate}</span>
                </span>
              </div>
            </div>

            {/* Secondary: Approach — collapsible */}
            <CollapsibleSection title="Approach" defaultOpen={false}>
              <p className="text-sm text-studio-text-secondary leading-relaxed">
                {samplePlan.approach}
              </p>
            </CollapsibleSection>

            {/* Secondary: Architecture Delta — collapsible */}
            <CollapsibleSection title="Architecture Delta" defaultOpen={false}>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-studio-text-tertiary">Before</span>
                  <p className="text-xs text-studio-text-secondary mt-1 leading-relaxed">
                    {samplePlan.architectureDelta.before[0]}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-studio-text-tertiary">After</span>
                  <p className="text-xs text-studio-text mt-1 leading-relaxed">
                    {samplePlan.architectureDelta.after[0]}
                  </p>
                </div>
              </div>
            </CollapsibleSection>

            {/* Secondary: Alternatives — collapsible */}
            <CollapsibleSection title="Alternatives" defaultOpen={false}>
              <div className="space-y-2">
                {samplePlan.alternatives.map((alt, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedAlt(i)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      selectedAlt === i
                        ? 'border-studio-primary/40 bg-studio-primary/5'
                        : 'border-studio-elevated/30 hover:border-studio-elevated/60'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {selectedAlt === i && <div className="w-1.5 h-1.5 rounded-full bg-studio-primary" />}
                      <span className="text-xs font-medium text-studio-text">{alt.name}</span>
                      {i === 2 && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-studio-success/10 text-studio-success">
                          Recommended
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-studio-text-secondary">
                      {alt.pros.length} pros, {alt.cons.length} cons
                    </p>
                  </button>
                ))}
              </div>
            </CollapsibleSection>

            {/* Primary: Approval — the focal point */}
            <div className="mt-6 p-5 rounded-xl bg-studio-elevated/30 border border-studio-elevated/50">
              <div className="flex items-center gap-2 mb-4">
                <Lock className="w-4 h-4 text-studio-primary" />
                <span className="text-sm font-medium text-studio-text">Approval</span>
              </div>

              <div className="mb-5">
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-studio-critical">Reject</span>
                  <span className="text-studio-warning">Constrained</span>
                  <span className="text-studio-success">Full Autonomy</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={approvalLevel}
                  onChange={(e) => setApprovalLevel(Number(e.target.value))}
                  className="w-full h-1.5 bg-studio-bg rounded-full appearance-none cursor-pointer accent-studio-primary"
                />
                <p className={`text-xs text-center mt-3 font-medium ${
                  approvalLevel < 33 ? 'text-studio-critical' :
                  approvalLevel < 66 ? 'text-studio-warning' :
                  'text-studio-success'
                }`}>
                  {approvalLevel < 33 ? 'Send back for revision' :
                   approvalLevel < 66 ? 'Approve with step-by-step review' :
                   'Approve — execute without interruption'}
                </p>
              </div>

              <div className="flex gap-3">
                <button className="flex-1 py-2 rounded-lg bg-studio-bg text-studio-text-secondary text-xs font-medium hover:text-studio-text transition-colors">
                  Request Changes
                </button>
                <button className="flex-1 py-2 rounded-lg bg-studio-primary text-white text-xs font-medium hover:bg-studio-primary/90 transition-colors">
                  Execute Plan
                </button>
              </div>
            </div>
          </div>
        )}

        {activePhase === 'intent' && (
          <div className="max-w-xl mt-6">
            <div className="space-y-5">
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-widest text-studio-text-tertiary block mb-2">Goal</label>
                <textarea
                  className="w-full h-24 bg-studio-elevated/30 rounded-lg p-3 text-sm text-studio-text placeholder-studio-text-tertiary focus:outline-none focus:ring-1 focus:ring-studio-primary/50 resize-none border border-studio-elevated/30"
                  placeholder="What do you want to build or change?"
                  defaultValue="Refactor the authentication middleware from session-based to JWT with Redis-backed revocation"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-widest text-studio-text-tertiary block mb-2">Constraints</label>
                <textarea
                  className="w-full h-20 bg-studio-elevated/30 rounded-lg p-3 text-sm text-studio-text placeholder-studio-text-tertiary focus:outline-none focus:ring-1 focus:ring-studio-primary/50 resize-none border border-studio-elevated/30"
                  placeholder="Non-negotiables..."
                  defaultValue="Must maintain backward compatibility during migration. No downtime allowed. Budget under $100/mo additional infra."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-studio-text-tertiary block mb-2">Confidence</label>
                  <select className="w-full bg-studio-elevated/30 rounded-lg p-2.5 text-sm text-studio-text focus:outline-none focus:ring-1 focus:ring-studio-primary/50 border border-studio-elevated/30">
                    <option>Explore — Research and report</option>
                    <option selected>Execute — Build and ship</option>
                    <option>Emergency Fix — Minimal review</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-studio-text-tertiary block mb-2">Scope</label>
                  <select className="w-full bg-studio-elevated/30 rounded-lg p-2.5 text-sm text-studio-text focus:outline-none focus:ring-1 focus:ring-studio-primary/50 border border-studio-elevated/30">
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
        )}

        {activePhase === 'execute' && (
          <div className="max-w-xl mt-6 space-y-3">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-studio-primary animate-pulse" />
              <span className="text-sm font-medium text-studio-text">Executing</span>
            </div>
            {sampleActivity.map((item) => (
              <div key={item.id} className="flex items-start gap-3 py-2">
                <div className={`w-1.5 h-1.5 rounded-full mt-1.5 ${
                  item.type === 'warning' ? 'bg-studio-warning' :
                  item.type === 'info' ? 'bg-studio-info' :
                  'bg-studio-primary'
                }`} />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-studio-text">{item.agent}</span>
                    <span className="text-[10px] text-studio-text-tertiary">{item.time}</span>
                  </div>
                  <p className="text-xs text-studio-text-secondary mt-0.5">{item.action}</p>
                </div>
              </div>
            ))}
            <div className="flex items-center gap-2 py-2">
              <div className="w-1.5 h-1.5 rounded-full bg-studio-primary animate-pulse" />
              <span className="text-xs text-studio-text-tertiary animate-pulse">Waiting for next action...</span>
            </div>
          </div>
        )}

        {activePhase === 'verify' && (
          <div className="max-w-xl mt-8 text-center">
            <div className="w-12 h-12 rounded-full bg-studio-success/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-6 h-6 text-studio-success" />
            </div>
            <h3 className="text-lg font-semibold text-studio-text mb-1">Mission Complete</h3>
            <p className="text-sm text-studio-text-secondary mb-6">
              All verification checks passed. 12 test scenarios executed.
            </p>
            <div className="flex items-center justify-center gap-6 text-sm">
              <div>
                <span className="text-studio-success font-semibold">12/12</span>
                <span className="text-studio-text-secondary ml-1">tests</span>
              </div>
              <div>
                <span className="text-studio-text font-semibold">0</span>
                <span className="text-studio-text-secondary ml-1">breaking</span>
              </div>
              <div>
                <span className="text-studio-cost font-semibold">$11.20</span>
                <span className="text-studio-text-secondary ml-1">spent</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
