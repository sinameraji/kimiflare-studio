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
    description:
      'Direct Cloudflare Workers AI or cloud proxy via GitHub auth. Full session control with steer and follow-up.',
  },
  {
    id: 'opencode',
    name: 'OpenCode',
    version: 'latest',
    description:
      'Reuses your existing OpenCode setup — providers, models, and billing auto-detected from ~/.config/opencode.',
  },
  {
    id: 'pi',
    name: 'Pi',
    version: 'v0.74',
    description:
      'Reuses your existing Pi credentials from AuthStorage. Lightweight with steer support and model registry.',
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
