import { useCallback } from 'react'
import { Shield, CheckCircle2, XCircle } from 'lucide-react'
import type { HarnessEvent } from '../types/harness.ts'

interface PermissionRequest {
  requestId: string
  toolName: string
  args: unknown
}

interface PermissionModalProps {
  requests: PermissionRequest[]
  onApprove: (requestId: string, allowSession?: boolean) => void
  onDeny: (requestId: string) => void
}

function formatArgs(args: unknown): string {
  try {
    return JSON.stringify(args, null, 2).slice(0, 400)
  } catch {
    return String(args).slice(0, 400)
  }
}

function getToolDescription(toolName: string): string {
  const descriptions: Record<string, string> = {
    write_file: 'This tool will create or overwrite a file on disk.',
    edit_file: 'This tool will modify an existing file.',
    bash: 'This tool will execute a shell command.',
    read_file: 'This tool will read the contents of a file.',
    delete_file: 'This tool will delete a file.',
    run_test: 'This tool will run the test suite.',
  }
  return descriptions[toolName] || `This tool (${toolName}) will perform an operation on your filesystem.`
}

export default function PermissionModal({ requests, onApprove, onDeny }: PermissionModalProps) {
  const handleAllowSession = useCallback(
    (requestId: string) => {
      onApprove(requestId, true)
    },
    [onApprove],
  )

  if (requests.length === 0) return null

  const current = requests[0]

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
      <div className="bg-studio-bg rounded-2xl border border-studio-elevated shadow-2xl max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-studio-elevated flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-studio-warning-light flex items-center justify-center">
            <Shield className="w-5 h-5 text-studio-warning" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-studio-text">Permission Request</h3>
            <p className="text-[11px] text-studio-text-secondary">
              {requests.length > 1 ? `${requests.length} pending requests` : '1 pending request'}
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-studio-text-tertiary block mb-1.5">
              Tool
            </span>
            <code className="text-sm font-mono text-studio-primary bg-studio-surface px-2 py-1 rounded border border-studio-elevated">
              {current.toolName}
            </code>
          </div>

          <div>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-studio-text-tertiary block mb-1.5">
              Description
            </span>
            <p className="text-sm text-studio-text-secondary leading-relaxed">
              {getToolDescription(current.toolName)}
            </p>
          </div>

          <div>
            <span className="text-[10px] font-semibold uppercase tracking-widest text-studio-text-tertiary block mb-1.5">
              Arguments
            </span>
            <pre className="text-xs font-mono text-studio-text-secondary bg-studio-surface rounded-lg p-3 border border-studio-elevated overflow-x-auto max-h-40">
              {formatArgs(current.args)}
            </pre>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-studio-elevated bg-studio-surface/50 flex gap-3">
          <button
            onClick={() => onDeny(current.requestId)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-studio-surface text-studio-critical text-sm font-medium border border-studio-elevated hover:bg-studio-critical-light transition-colors"
          >
            <XCircle className="w-4 h-4" />
            Deny
          </button>
          <button
            onClick={() => onApprove(current.requestId, false)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-studio-primary text-white text-sm font-medium hover:bg-studio-primary-light transition-colors"
          >
            <CheckCircle2 className="w-4 h-4" />
            Allow Once
          </button>
          <button
            onClick={() => handleAllowSession(current.requestId)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-studio-success text-white text-sm font-medium hover:bg-studio-success/90 transition-colors"
          >
            <Shield className="w-4 h-4" />
            Allow Session
          </button>
        </div>
      </div>
    </div>
  )
}

export function extractPermissionRequests(events: HarnessEvent[]): PermissionRequest[] {
  const requests = new Map<string, PermissionRequest>()
  for (const event of events) {
    if (event.type === 'permission.request') {
      requests.set(event.requestId, {
        requestId: event.requestId,
        toolName: event.toolName,
        args: event.args,
      })
    }
    if (event.type === 'permission.resolved') {
      requests.delete(event.requestId)
    }
  }
  return Array.from(requests.values())
}
