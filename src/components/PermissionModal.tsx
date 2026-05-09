import { useCallback } from 'react'
import { Shield, X, CheckCircle2, AlertTriangle } from 'lucide-react'
import type { PermissionDecision } from '../types/harness.ts'

export interface PendingPermission {
  requestId: string
  toolName: string
  args: unknown
}

interface PermissionModalProps {
  permissions: PendingPermission[]
  onDecide: (requestId: string, decision: PermissionDecision) => void
}

export default function PermissionModal({ permissions, onDecide }: PermissionModalProps) {
  const current = permissions[0]

  const handleDecide = useCallback(
    (decision: PermissionDecision) => {
      if (!current) return
      onDecide(current.requestId, decision)
    },
    [current, onDecide],
  )

  if (!current) return null

  const argsText =
    typeof current.args === 'object' && current.args !== null
      ? JSON.stringify(current.args, null, 2)
      : String(current.args)

  return (
    <div className="fixed inset-0 bg-studio-bg/80 backdrop-blur-sm z-[60] flex items-center justify-center p-6">
      <div className="bg-studio-surface rounded-2xl border border-studio-elevated shadow-2xl max-w-lg w-full p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-studio-warning-light flex items-center justify-center">
            <Shield className="w-5 h-5 text-studio-warning" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-studio-text">Permission Requested</h3>
            <p className="text-xs text-studio-text-secondary">
              {permissions.length > 1 ? `${permissions.length} pending` : '1 pending'}
            </p>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-studio-text-tertiary">
              Tool
            </span>
          </div>
          <div className="bg-studio-bg rounded-lg px-4 py-3 border border-studio-elevated">
            <code className="text-sm font-mono text-studio-primary">{current.toolName}</code>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-studio-text-tertiary">
              Arguments
            </span>
          </div>
          <pre className="bg-studio-bg rounded-lg px-4 py-3 border border-studio-elevated text-xs font-mono text-studio-text-secondary overflow-x-auto max-h-48">
            {argsText}
          </pre>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => handleDecide('deny')}
            className="flex-1 py-2.5 rounded-lg bg-studio-critical/10 text-studio-critical text-sm font-medium hover:bg-studio-critical/20 transition-colors flex items-center justify-center gap-2"
          >
            <X className="w-4 h-4" />
            Deny
          </button>
          <button
            onClick={() => handleDecide('allow_session')}
            className="flex-1 py-2.5 rounded-lg bg-studio-surface text-studio-text-secondary text-sm font-medium hover:text-studio-text transition-colors border border-studio-elevated flex items-center justify-center gap-2"
          >
            <AlertTriangle className="w-4 h-4" />
            Allow Session
          </button>
          <button
            onClick={() => handleDecide('allow')}
            className="flex-1 py-2.5 rounded-lg bg-studio-primary text-white text-sm font-medium hover:bg-studio-primary-light transition-colors flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            Allow
          </button>
        </div>
      </div>
    </div>
  )
}
