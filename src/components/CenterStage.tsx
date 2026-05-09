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
import ArchitectureDiagram from './ArchitectureDiagram.tsx'
import MissionReport from './MissionReport.tsx'
import IntentBuilder from './IntentBuilder.tsx'
import { useMentalModels } from '../hooks/useMentalModels.ts'

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
  onRequestChanges,
  onExecutePlan,
}: {
  approvalLevel: number
  setApprovalLevel: (v: number) => void
  onRequestChanges: () => void
  onExecutePlan: () => void
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
          <button
            onClick={onRequestChanges}
            className="flex-1 py-2.5 rounded-lg bg-studio-surface text-studio-text-secondary text-sm font-medium hover:text-studio-text transition-colors border border-studio-elevated"
          >
            Request Changes
          </button>
          <button
            onClick={onExecutePlan}
            className="flex-1 py-2.5 rounded-lg bg-studio-primary text-white text-sm font-medium hover:bg-studio-primary-light transition-colors"
          >
            Execute Plan
          </button>
        </div>
      </div>
    </div>
  )
}

interface CenterStageProps {
  missionId: string
}

export default function CenterStage({ missionId }: CenterStageProps) {
  const [activePhase, setActivePhase] = useState('plan')
  const [approvalLevel, setApprovalLevel] = useState(50)
  const [showReport, setShowReport] = useState(false)
  const { sections, exportToYaml, updateFromYaml, resetToDefaults } = useMentalModels()

  // TODO: load mission data by missionId
  void missionId

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
                    {samplePlan.costProjection.timeEstimate}
                  </span>
                  <span className="flex items-center gap-1.5 text-studio-cost">
                    <DollarSign className="w-3 h-3" />
                    ~{sampleMission.estimatedCost}
                  </span>
                </div>
              </div>
              <h2 className="text-2xl font-semibold text-studio-text tracking-tight mb-8">
                {sampleMission.title}
              </h2>

              {/* Approach */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-studio-text-tertiary">
                    Approach
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-studio-success-light text-studio-success font-medium">
                    High confidence
                  </span>
                </div>
                <div className="bg-studio-surface rounded-xl p-6 border border-studio-elevated">
                  <p className="text-sm text-studio-text-secondary leading-relaxed">
                    {samplePlan.approach}
                  </p>
                </div>
              </div>

              {/* Architecture Diagram */}
              <div className="mb-8">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-studio-text-tertiary block mb-3">
                  Architecture Delta
                </span>
                <ArchitectureDiagram
                  before={samplePlan.architectureDelta.before}
                  after={samplePlan.architectureDelta.after}
                />
              </div>

              {/* Risk Assessment */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="w-4 h-4 text-studio-warning" />
                  <span className="text-sm font-medium text-studio-text">Risk Assessment</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-studio-critical-light text-studio-critical font-medium">
                    1 high, 1 medium
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {samplePlan.risks.map((risk, i) => (
                    <div
                      key={i}
                      className={`bg-studio-surface rounded-xl p-5 border ${
                        risk.level === 'low'
                          ? 'border-studio-success/30'
                          : risk.level === 'medium'
                            ? 'border-studio-warning/30'
                            : 'border-studio-critical/30'
                      } ${risk.confidence === 'medium' ? 'border-l-4 border-l-studio-warning' : ''}`}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <div
                          className={`${
                            risk.level === 'low'
                              ? 'text-studio-success'
                              : risk.level === 'medium'
                                ? 'text-studio-warning'
                                : 'text-studio-critical'
                          }`}
                        >
                          {riskIcons[risk.category]}
                        </div>
                        <span className="text-xs font-medium text-studio-text">{risk.category}</span>
                        <span
                          className={`text-[10px] uppercase font-bold ml-auto ${
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
                      <p className="text-xs text-studio-text-secondary leading-relaxed mb-3">
                        {risk.description}
                      </p>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                          risk.confidence === 'high'
                            ? 'bg-studio-success-light text-studio-success'
                            : risk.confidence === 'medium'
                              ? 'bg-studio-warning-light text-studio-warning'
                              : 'bg-studio-critical-light text-studio-critical'
                        }`}
                      >
                        {risk.confidence === 'high'
                          ? 'High confidence'
                          : risk.confidence === 'medium'
                            ? 'Medium confidence'
                            : 'Guessing — input needed'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cost Projection */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <DollarSign className="w-4 h-4 text-studio-cost" />
                  <span className="text-sm font-medium text-studio-text">Cost Projection</span>
                </div>
                <div className="bg-studio-surface rounded-xl p-6 grid grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-xl font-semibold text-studio-text">{samplePlan.costProjection.tokens}</div>
                    <div className="text-[11px] text-studio-text-secondary mt-1">Tokens</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-semibold text-studio-cost">{samplePlan.costProjection.apiCost}</div>
                    <div className="text-[11px] text-studio-text-secondary mt-1">API Cost</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-semibold text-studio-text">{samplePlan.costProjection.infrastructure}</div>
                    <div className="text-[11px] text-studio-text-secondary mt-1">Infrastructure</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-semibold text-studio-text">{samplePlan.costProjection.timeEstimate}</div>
                    <div className="text-[11px] text-studio-text-secondary mt-1">Time Estimate</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activePhase === 'intent' && (
            <IntentBuilder
              sections={sections}
              yamlText={exportToYaml()}
              onUpdateYaml={updateFromYaml}
              onResetDefaults={resetToDefaults}
              onGenerate={(prompt) => {
                console.log('Generated prompt:\n', prompt)
                setActivePhase('plan')
              }}
            />
          )}

          {activePhase === 'execute' && (
            <div className="mt-6">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-2 h-2 rounded-full bg-studio-primary animate-pulse" />
                <span className="text-sm font-medium text-studio-text">Executing</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-studio-primary/10 text-studio-primary font-medium ml-auto">
                  In Progress
                </span>
              </div>
              <div className="bg-studio-surface rounded-xl p-6 space-y-4 border border-studio-elevated">
                {sampleActivity.map((item) => (
                  <div key={item.id} className="flex items-start gap-3">
                    <div
                      className={`w-1.5 h-1.5 rounded-full mt-1.5 ${
                        item.type === 'warning'
                          ? 'bg-studio-warning'
                          : item.type === 'info'
                            ? 'bg-studio-info'
                            : 'bg-studio-primary'
                      }`}
                    />
                    <div className="flex-1">
                      <p className="text-sm text-studio-text">{item.action}</p>
                      <span className="text-[11px] text-studio-text-tertiary">{item.time}</span>
                    </div>
                  </div>
                ))}
                <div className="flex items-center gap-2 pt-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-studio-primary animate-pulse" />
                  <span className="text-sm text-studio-text-tertiary animate-pulse">Working...</span>
                </div>
              </div>
              <button
                onClick={() => setActivePhase('verify')}
                className="w-full mt-6 py-2.5 rounded-lg bg-studio-primary text-white text-sm font-medium hover:bg-studio-primary-light transition-colors"
              >
                Mark Complete & Verify
              </button>
            </div>
          )}

          {activePhase === 'verify' && (
            <div className="mt-8 text-center">
              <div className="w-16 h-16 rounded-full bg-studio-success-light flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 className="w-8 h-8 text-studio-success" />
              </div>
              <h3 className="text-xl font-semibold text-studio-text mb-2">Mission Complete</h3>
              <p className="text-sm text-studio-text-secondary mb-8">
                All verification checks passed.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setShowReport(true)}
                  className="px-6 py-2.5 rounded-lg bg-studio-primary text-white text-sm font-medium hover:bg-studio-primary-light transition-colors"
                >
                  View Mission Report
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sticky Approval Bar — only in Plan phase */}
      {activePhase === 'plan' && (
        <ApprovalBar
          approvalLevel={approvalLevel}
          setApprovalLevel={setApprovalLevel}
          onRequestChanges={() => setActivePhase('intent')}
          onExecutePlan={() => setActivePhase('execute')}
        />
      )}

      {showReport && <MissionReport onClose={() => setShowReport(false)} />}
    </main>
  )
}
