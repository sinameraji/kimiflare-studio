import { useState } from 'react'
import {
  BookOpen,
  DollarSign,
  GitBranch,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  AlertCircle,
} from 'lucide-react'
import { sampleDecisions, sampleMission } from '../data/sample.ts'

const reversibilityColors: Record<string, string> = {
  Easy: 'text-studio-success',
  Medium: 'text-studio-warning',
  Hard: 'text-studio-critical',
}

export default function RightPanel() {
  const [decisionsOpen, setDecisionsOpen] = useState(true)
  const [costOpen, setCostOpen] = useState(true)
  const [diagramOpen, setDiagramOpen] = useState(false)

  return (
    <aside className="w-72 bg-studio-surface flex flex-col h-full border-l border-studio-elevated">
      <div className="flex-1 overflow-y-auto px-4">
        {/* Decision Journal */}
        <div className="pt-5 pb-4">
          <button
            onClick={() => setDecisionsOpen(!decisionsOpen)}
            className="w-full flex items-center justify-between mb-3"
          >
            <div className="flex items-center gap-2">
              <BookOpen className="w-3.5 h-3.5 text-studio-decision" />
              <span className="text-[10px] font-semibold uppercase tracking-widest text-studio-text-tertiary">Decisions</span>
            </div>
            {decisionsOpen ? (
              <ChevronUp className="w-3 h-3 text-studio-text-tertiary" />
            ) : (
              <ChevronDown className="w-3 h-3 text-studio-text-tertiary" />
            )}
          </button>
          {decisionsOpen && (
            <div className="space-y-3">
              {sampleDecisions.map((decision) => (
                <div key={decision.id} className="group">
                  <div className="flex items-start gap-2">
                    <div className="w-0.5 h-full min-h-[16px] rounded-full bg-studio-decision/60 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-studio-text leading-snug">{decision.decision}</p>
                      <p className="text-[11px] text-studio-text-secondary mt-0.5 leading-relaxed">{decision.rationale}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className={`text-[10px] font-medium ${reversibilityColors[decision.reversibility]}`}>
                          {decision.reversibility}
                        </span>
                        <span className="text-[10px] text-studio-text-tertiary">{decision.agent}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cost Tracker */}
        <div className="py-4 border-t border-studio-elevated">
          <button
            onClick={() => setCostOpen(!costOpen)}
            className="w-full flex items-center justify-between mb-3"
          >
            <div className="flex items-center gap-2">
              <DollarSign className="w-3.5 h-3.5 text-studio-cost" />
              <span className="text-[10px] font-semibold uppercase tracking-widest text-studio-text-tertiary">Cost</span>
            </div>
            {costOpen ? (
              <ChevronUp className="w-3 h-3 text-studio-text-tertiary" />
            ) : (
              <ChevronDown className="w-3 h-3 text-studio-text-tertiary" />
            )}
          </button>
          {costOpen && (
            <div>
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-[11px] text-studio-text-secondary">Session</span>
                <span className="text-lg font-semibold text-studio-cost">${sampleMission.actualCost.toFixed(2)}</span>
              </div>
              <div className="h-1 bg-studio-elevated rounded-full overflow-hidden mb-2">
                <div className="h-full bg-studio-cost rounded-full" style={{ width: '0%' }} />
              </div>
              <div className="flex justify-between text-[10px] text-studio-text-tertiary">
                <span>Est. ${sampleMission.estimatedCost}</span>
                <span>Budget $50</span>
              </div>
            </div>
          )}
        </div>

        {/* System Diagram */}
        <div className="py-4 border-t border-studio-elevated">
          <button
            onClick={() => setDiagramOpen(!diagramOpen)}
            className="w-full flex items-center justify-between mb-3"
          >
            <div className="flex items-center gap-2">
              <GitBranch className="w-3.5 h-3.5 text-studio-info" />
              <span className="text-[10px] font-semibold uppercase tracking-widest text-studio-text-tertiary">Diagram</span>
            </div>
            {diagramOpen ? (
              <ChevronUp className="w-3 h-3 text-studio-text-tertiary" />
            ) : (
              <ChevronDown className="w-3 h-3 text-studio-text-tertiary" />
            )}
          </button>
          {diagramOpen && (
            <div className="p-3 rounded-lg bg-studio-bg border border-studio-elevated">
              <svg viewBox="0 0 240 140" className="w-full">
                <rect x="80" y="8" width="80" height="24" rx="3" fill="#FAF8F5" stroke="#8B7355" strokeWidth="1" />
                <text x="120" y="24" textAnchor="middle" fill="#6B6560" fontSize="9" fontFamily="Inter">Load Balancer</text>
                <rect x="80" y="58" width="80" height="24" rx="3" fill="#FAF8F5" stroke="#8B7355" strokeWidth="1" />
                <text x="120" y="74" textAnchor="middle" fill="#6B6560" fontSize="9" fontFamily="Inter">App Server</text>
                <rect x="20" y="108" width="60" height="24" rx="3" fill="#FAF8F5" stroke="#6A8FA6" strokeWidth="1" strokeDasharray="3 2" />
                <text x="50" y="124" textAnchor="middle" fill="#6A8FA6" fontSize="9" fontFamily="Inter">Redis</text>
                <rect x="160" y="108" width="60" height="24" rx="3" fill="#FAF8F5" stroke="#A8A29A" strokeWidth="1" />
                <text x="190" y="124" textAnchor="middle" fill="#A8A29A" fontSize="9" fontFamily="Inter">PostgreSQL</text>
                <line x1="120" y1="32" x2="120" y2="58" stroke="#8B7355" strokeWidth="1" />
                <line x1="105" y1="82" x2="65" y2="108" stroke="#6A8FA6" strokeWidth="1" strokeDasharray="3 2" />
                <line x1="135" y1="82" x2="175" y2="108" stroke="#A8A29A" strokeWidth="1" />
              </svg>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="py-4 border-t border-studio-elevated space-y-1">
          <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-studio-elevated text-studio-text-secondary hover:text-studio-text text-xs transition-colors">
            <RotateCcw className="w-3.5 h-3.5" />
            Rollback
          </button>
          <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-studio-elevated text-studio-text-secondary hover:text-studio-text text-xs transition-colors">
            <AlertCircle className="w-3.5 h-3.5" />
            Report Issue
          </button>
        </div>
      </div>
    </aside>
  )
}
