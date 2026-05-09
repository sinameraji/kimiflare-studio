import { useState } from 'react'
import {
  Target,
  FileText,
  Play,
  CheckCircle2,
  AlertTriangle,
  Clock,
  DollarSign,
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
  Security: <Shield className="w-3.5 h-3.5" />,
  Performance: <Zap className="w-3.5 h-3.5" />,
  Operational: <Activity className="w-3.5 h-3.5" />,
}

function Stepper({ activePhase, onChange }: { activePhase: string; onChange: (id: string) => void }) {
  const activeIndex = phases.findIndex((p) => p.id === activePhase)

  return (
    <div className="flex items-center justify-center gap-2 mb-10">
      {phases.map((phase, index) => {
        const Icon = phase.icon
        const isCompleted = index < activeIndex
        const isCurrent = index === activeIndex

        return (
          <div key={phase.id} className="flex items-center gap-2">
            <button
              onClick={() => isCompleted && onChange(phase.id)}
              className={`flex items-center gap-2 transition-colors ${isCompleted ? 'cursor-pointer' : 'cursor-default'}`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-colors ${
                  isCompleted
                    ? 'bg-studio-primary border-studio-primary text-white'
                    : isCurrent
                      ? 'bg-studio-primary border-studio-primary text-white'
                      : 'bg-studio-bg border-studio-elevated text-studio-text-tertiary'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
              </div>
              <span
                className={`text-xs font-medium ${
                  isCompleted || isCurrent ? 'text-studio-text' : 'text-studio-text-tertiary'
                }`}
              >
                {phase.label}
              </span>
            </button>
            {index < phases.length - 1 && (
              <div
                className={`w-8 h-px ${isCompleted ? 'bg-studio-primary' : 'bg-studio-elevated'}`}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

function ApprovalBar({
  approvalLevel,
  setApprovalLevel,
}: {
  approvalLevel: number
  setApprovalLevel: (v: number) => void
}) {
  return (
    <div className="sticky bottom-0 bg-studio-bg/95 backdrop-blur-sm border-t border-studio-elevated py-5 px-8">
      <div className="max-w-[840px] mx-auto">
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
            className="w-full h-1.5 bg-studio-elevated rounded-full appearance-none cursor-pointer accent-studio-primary"
          />
          <p
            className={`text-xs text-center mt-3 font-medium ${
              approvalLevel < 33
                ? 'text-studio-critical'
                : approvalLevel < 66
                  ? 'text-studio-warning'
                  : 'text-studio-success'
            }`}
          >
            {approvalLevel < 33
              ? 'Send back for revision'
              : approvalLevel < 66
                ? 'Approve with step-by-step review'
                : 'Approve — execute without interruption'}
          </p>
        </div>

        <div className="flex gap-3">
          <button className="flex-1 py-2.5 rounded-lg bg-studio-surface text-studio-text-secondary text-sm font-medium hover:text-studio-text transition-colors border border-studio-elevated">
            Request Changes
          </button>
          <button className="flex-1 py-2.5 rounded-lg bg-studio-primary text-white text-sm font-medium hover:bg-studio-primary-light transition-colors">
            Execute Plan
          </button>
        </div>
      </div>
    </div>
  )
}

export default function CenterStage() {
  const [activePhase, setActivePhase] = useState('plan')
  const [approvalLevel, setApprovalLevel] = useState(50)

  return (
    <main className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[840px] mx-auto px-8 py-10">
          <Stepper activePhase={activePhase} onChange={setActivePhase} />

          {activePhase === 'plan' && (
            <div>
              {/* Mission Header */}
              <div className="flex items-baseline justify-between mb-1">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-studio-text-tertiary">
                    Mission
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-studio-warning-light text-studio-warning border border-studio-warning/20">
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
              <h2 className="text-2xl font-semibold text-studio-text tracking-tight mb-8">
                {sampleMission.title}
              </h2>

              {/* Risk Assessment */}
              <div className="py-5">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4 text-studio-warning" />
                  <span className="text-sm font-medium text-studio-text">Risk Assessment</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-studio-critical-light text-studio-critical font-medium">
                    1 high, 1 medium
                  </span>
                </div>
                <div className="space-y-2">
                  {samplePlan.risks.map((risk, i) => (
                    <div key={i} className="flex items-start gap-3 py-2">
                      <div
                        className={`mt-0.5 ${
                          risk.level === 'low'
                            ? 'text-studio-success'
                            : risk.level === 'medium'
                              ? 'text-studio-warning'
                              : 'text-studio-critical'
                        }`}
                      >
                        {riskIcons[risk.category]}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-studio-text">{risk.category}</span>
                          <span
                            className={`text-[10px] uppercase font-bold ${
                              risk.level === 'low'
                                ? 'text-studio-success'
                                : risk.level === 'medium'
                                  ? 'text-studio-warning'
                                  : 'text-studio-critical'
                            }`}
                          >
                            {risk.level}
                          </span>
                        </div>
                        <p className="text-xs text-studio-text-secondary mt-0.5 leading-relaxed">
                          {risk.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cost Projection */}
              <div className="py-4 border-t border-studio-elevated">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-studio-cost" />
                  <span className="text-sm font-medium text-studio-text">Cost Projection</span>
                </div>
                <div className="flex items-center gap-6 text-xs">
                  <span className="text-studio-text-secondary">
                    <span className="text-studio-text font-medium">{samplePlan.costProjection.tokens}</span>{' '}
                    tokens
                  </span>
                  <span className="text-studio-text-secondary">
                    <span className="text-studio-cost font-medium">{samplePlan.costProjection.apiCost}</span>{' '}
                    API
                  </span>
                  <span className="text-studio-text-secondary">
                    <span className="text-studio-text font-medium">{samplePlan.costProjection.infrastructure}</span>{' '}
                    infra
                  </span>
                  <span className="text-studio-text-secondary">
                    <span className="text-studio-text font-medium">{samplePlan.costProjection.timeEstimate}</span>
                  </span>
                </div>
              </div>
            </div>
          )}

          {activePhase === 'intent' && (
            <div className="mt-6">
              <div className="space-y-5">
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-studio-text-tertiary block mb-2">
                    Goal
                  </label>
                  <textarea
                    className="w-full h-24 bg-studio-surface rounded-lg p-3 text-sm text-studio-text placeholder-studio-text-tertiary focus:outline-none focus:ring-1 focus:ring-studio-primary/50 resize-none border border-studio-elevated"
                    placeholder="What do you want to build or change?"
                    defaultValue="Refactor the authentication middleware from session-based to JWT with Redis-backed revocation"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-studio-text-tertiary block mb-2">
                    Constraints
                  </label>
                  <textarea
                    className="w-full h-20 bg-studio-surface rounded-lg p-3 text-sm text-studio-text placeholder-studio-text-tertiary focus:outline-none focus:ring-1 focus:ring-studio-primary/50 resize-none border border-studio-elevated"
                    placeholder="Non-negotiables..."
                    defaultValue="Must maintain backward compatibility during migration. No downtime allowed. Budget under $100/mo additional infra."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-semibold uppercase tracking-widest text-studio-text-tertiary block mb-2">
                      Confidence
                    </label>
                    <select className="w-full bg-studio-surface rounded-lg p-2.5 text-sm text-studio-text focus:outline-none focus:ring-1 focus:ring-studio-primary/50 border border-studio-elevated">
                      <option>Explore — Research and report</option>
                      <option selected>Execute — Build and ship</option>
                      <option>Emergency Fix — Minimal review</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold uppercase tracking-widest text-studio-text-tertiary block mb-2">
                      Scope
                    </label>
                    <select className="w-full bg-studio-surface rounded-lg p-2.5 text-sm text-studio-text focus:outline-none focus:ring-1 focus:ring-studio-primary/50 border border-studio-elevated">
                      <option>Auth module only</option>
                      <option selected>Auth + User API</option>
                      <option>Full codebase</option>
                    </select>
                  </div>
                </div>
                <button className="w-full py-2.5 rounded-lg bg-studio-primary text-white text-sm font-medium hover:bg-studio-primary-light transition-colors">
                  Generate Plan
                </button>
              </div>
            </div>
          )}

          {activePhase === 'execute' && (
            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-studio-primary animate-pulse" />
                <span className="text-sm font-medium text-studio-text">Executing</span>
              </div>
              {sampleActivity.map((item) => (
                <div key={item.id} className="flex items-start gap-3 py-2">
                  <div
                    className={`w-1.5 h-1.5 rounded-full mt-1.5 ${
                      item.type === 'warning'
                        ? 'bg-studio-warning'
                        : item.type === 'info'
                          ? 'bg-studio-info'
                          : 'bg-studio-primary'
                    }`}
                  />
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
            <div className="mt-8 text-center">
              <div className="w-12 h-12 rounded-full bg-studio-success-light flex items-center justify-center mx-auto mb-4">
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
      </div>

      {/* Sticky Approval Bar — only in Plan phase */}
      {activePhase === 'plan' && (
        <ApprovalBar approvalLevel={approvalLevel} setApprovalLevel={setApprovalLevel} />
      )}
    </main>
  )
}
