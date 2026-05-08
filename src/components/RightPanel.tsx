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
  Easy: 'text-studio-success bg-studio-success/10',
  Medium: 'text-studio-warning bg-studio-warning/10',
  Hard: 'text-studio-critical bg-studio-critical/10',
}

export default function RightPanel() {
  const [decisionsOpen, setDecisionsOpen] = useState(true)
  const [costOpen, setCostOpen] = useState(true)
  const [diagramOpen, setDiagramOpen] = useState(true)

  return (
    <aside className="w-80 bg-studio-surface border-l border-studio-elevated/50 flex flex-col h-full">
      <div className="flex-1 overflow-y-auto">
        {/* Decision Journal */}
        <div className="border-b border-studio-elevated/50">
          <button
            onClick={() => setDecisionsOpen(!decisionsOpen)}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-studio-elevated/30 transition-colors"
          >
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-studio-decision" />
              <span className="text-sm font-medium text-studio-text">Decision Journal</span>
            </div>
            {decisionsOpen ? (
              <ChevronUp className="w-3.5 h-3.5 text-studio-text-secondary" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-studio-text-secondary" />
            )}
          </button>
          {decisionsOpen && (
            <div className="px-4 pb-4 space-y-3">
              {sampleDecisions.map((decision) => (
                <div
                  key={decision.id}
                  className="p-3 rounded-lg bg-studio-bg border border-studio-elevated/30 hover:border-studio-decision/30 transition-colors"
                >
                  <div className="flex items-start gap-2 mb-2">
                    <div className="w-1 h-full min-h-[20px] rounded-full bg-studio-decision" />
                    <p className="text-sm text-studio-text font-medium leading-snug">
                      {decision.decision}
                    </p>
                  </div>
                  <p className="text-xs text-studio-text-secondary mb-2 pl-3">
                    {decision.rationale}
                  </p>
                  <div className="flex items-center gap-2 pl-3">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${reversibilityColors[decision.reversibility]}`}>
                      {decision.reversibility} to reverse
                    </span>
                    <span className="text-[10px] text-studio-text-tertiary">{decision.agent}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cost Tracker */}
        <div className="border-b border-studio-elevated/50">
          <button
            onClick={() => setCostOpen(!costOpen)}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-studio-elevated/30 transition-colors"
          >
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-studio-cost" />
              <span className="text-sm font-medium text-studio-text">Cost Tracker</span>
            </div>
            {costOpen ? (
              <ChevronUp className="w-3.5 h-3.5 text-studio-text-secondary" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-studio-text-secondary" />
            )}
          </button>
          {costOpen && (
            <div className="px-4 pb-4">
              <div className="p-4 rounded-lg bg-studio-bg border border-studio-elevated/30">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-studio-text-secondary">Session Total</span>
                  <span className="text-lg font-semibold text-studio-cost">${sampleMission.actualCost.toFixed(2)}</span>
                </div>
                <div className="h-1.5 bg-studio-elevated rounded-full overflow-hidden mb-3">
                  <div
                    className="h-full bg-studio-cost rounded-full"
                    style={{ width: '0%' }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-studio-text-tertiary">Estimated: {sampleMission.estimatedCost}</span>
                  <span className="text-studio-text-tertiary">Budget: $50.00</span>
                </div>
                <div className="mt-3 pt-3 border-t border-studio-elevated/30 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-studio-text-secondary">Planning phase</span>
                    <span className="text-studio-text">$0.00</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-studio-text-secondary">Execution</span>
                    <span className="text-studio-text">$0.00</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-studio-text-secondary">Verification</span>
                    <span className="text-studio-text">$0.00</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* System Diagram Mini */}
        <div className="border-b border-studio-elevated/50">
          <button
            onClick={() => setDiagramOpen(!diagramOpen)}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-studio-elevated/30 transition-colors"
          >
            <div className="flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-studio-info" />
              <span className="text-sm font-medium text-studio-text">System Diagram</span>
            </div>
            {diagramOpen ? (
              <ChevronUp className="w-3.5 h-3.5 text-studio-text-secondary" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-studio-text-secondary" />
            )}
          </button>
          {diagramOpen && (
            <div className="px-4 pb-4">
              <div className="p-4 rounded-lg bg-studio-bg border border-studio-elevated/30">
                {/* Simple SVG diagram */}
                <svg viewBox="0 0 280 180" className="w-full">
                  {/* Load Balancer */}
                  <rect x="100" y="10" width="80" height="30" rx="4" fill="#1E2538" stroke="#4F46E5" strokeWidth="1.5" />
                  <text x="140" y="30" textAnchor="middle" fill="#F1F5F9" fontSize="10" fontFamily="Inter">Load Balancer</text>

                  {/* App Server */}
                  <rect x="100" y="70" width="80" height="30" rx="4" fill="#1E2538" stroke="#4F46E5" strokeWidth="1.5" />
                  <text x="140" y="90" textAnchor="middle" fill="#F1F5F9" fontSize="10" fontFamily="Inter">App Server</text>

                  {/* Redis */}
                  <rect x="30" y="130" width="70" height="30" rx="4" fill="#1E2538" stroke="#06B6D4" strokeWidth="1.5" strokeDasharray="4 2" />
                  <text x="65" y="150" textAnchor="middle" fill="#06B6D4" fontSize="10" fontFamily="Inter">Redis</text>

                  {/* PostgreSQL */}
                  <rect x="180" y="130" width="70" height="30" rx="4" fill="#1E2538" stroke="#64748B" strokeWidth="1.5" />
                  <text x="215" y="150" textAnchor="middle" fill="#94A3B8" fontSize="10" fontFamily="Inter">PostgreSQL</text>

                  {/* Connections */}
                  <line x1="140" y1="40" x2="140" y2="70" stroke="#4F46E5" strokeWidth="1.5" />
                  <line x1="120" y1="100" x2="80" y2="130" stroke="#06B6D4" strokeWidth="1.5" strokeDasharray="4 2" />
                  <line x1="160" y1="100" x2="200" y2="130" stroke="#64748B" strokeWidth="1.5" />

                  {/* Labels */}
                  <text x="145" y="58" fill="#4F46E5" fontSize="8" fontFamily="Inter">HTTP</text>
                  <text x="85" y="118" fill="#06B6D4" fontSize="8" fontFamily="Inter">new</text>
                  <text x="185" y="118" fill="#64748B" fontSize="8" fontFamily="Inter">existing</text>
                </svg>
                <div className="flex items-center gap-3 mt-2 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-studio-primary" />
                    <span className="text-studio-text-secondary">Existing</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-studio-info" />
                    <span className="text-studio-text-secondary">New</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="px-4 py-4 space-y-2">
          <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-studio-elevated/30 hover:bg-studio-elevated/50 text-studio-text-secondary hover:text-studio-text text-sm transition-colors">
            <RotateCcw className="w-4 h-4" />
            Rollback Session
          </button>
          <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-studio-elevated/30 hover:bg-studio-elevated/50 text-studio-text-secondary hover:text-studio-text text-sm transition-colors">
            <AlertCircle className="w-4 h-4" />
            Report Issue
          </button>
        </div>
      </div>
    </aside>
  )
}
