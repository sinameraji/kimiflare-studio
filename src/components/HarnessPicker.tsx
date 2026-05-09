import type { HarnessId } from '../types/harness.ts'

interface HarnessOption {
  id: HarnessId
  name: string
  version: string
  description: string
}

const harnesses: HarnessOption[] = [
  {
    id: 'kimiflare',
    name: 'KimiFlare',
    version: 'v0.49',
    description: 'In-process SDK with direct session control. Best for Node.js projects.',
  },
  {
    id: 'opencode',
    name: 'OpenCode',
    version: 'latest',
    description: 'HTTP API via spawned server. Mature OpenAPI with SSE events.',
  },
  {
    id: 'pi',
    name: 'Pi',
    version: 'v0.74',
    description: 'In-process SDK with JSONL RPC fallback. Fast and lightweight.',
  },
]

interface HarnessPickerProps {
  selected: HarnessId | null
  onSelect: (id: HarnessId) => void
}

export default function HarnessPicker({ selected, onSelect }: HarnessPickerProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {harnesses.map((h) => (
        <button
          key={h.id}
          onClick={() => onSelect(h.id)}
          className={`text-left rounded-xl border p-5 transition-all ${
            selected === h.id
              ? 'border-studio-primary bg-studio-primary/5'
              : 'border-studio-elevated bg-studio-surface hover:border-studio-primary/30'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-studio-text">{h.name}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-studio-elevated text-studio-text-tertiary font-medium">
              {h.version}
            </span>
          </div>
          <p className="text-xs text-studio-text-secondary leading-relaxed">{h.description}</p>
        </button>
      ))}
    </div>
  )
}
