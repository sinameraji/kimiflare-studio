import { useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import type { HarnessConfig, HarnessId } from '../types/harness.ts'

interface HarnessConfigFormProps {
  harnessId: HarnessId
  onSubmit: (config: HarnessConfig) => void
  onBack?: () => void
}

export default function HarnessConfigForm({ harnessId, onSubmit, onBack }: HarnessConfigFormProps) {
  const isKimiFlare = harnessId === 'kimiflare'
  const [provider, setProvider] = useState(isKimiFlare ? 'cloudflare' : '')
  const [model, setModel] = useState(isKimiFlare ? '@cf/moonshotai/kimi-k2.6' : '')
  const [apiKey, setApiKey] = useState('')
  const [cloudMode, setCloudMode] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      harnessId,
      provider: provider || undefined,
      model: model || undefined,
      apiKey: isKimiFlare && !cloudMode ? undefined : apiKey || undefined,
      cloudMode: isKimiFlare ? cloudMode : undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {isKimiFlare && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-studio-surface border border-studio-elevated">
          <input
            id="cloudMode"
            type="checkbox"
            checked={cloudMode}
            onChange={(e) => setCloudMode(e.target.checked)}
            className="w-3.5 h-3.5 rounded border-studio-elevated text-studio-primary focus:ring-studio-primary"
          />
          <label htmlFor="cloudMode" className="text-xs text-studio-text cursor-pointer select-none">
            Cloud mode (requires Cloudflare API key)
          </label>
        </div>
      )}

      <div>
        <label className="block text-[10px] font-semibold uppercase tracking-widest text-studio-text-tertiary mb-1.5">
          Provider
        </label>
        <input
          type="text"
          value={provider}
          onChange={(e) => setProvider(e.target.value)}
          disabled={isKimiFlare}
          placeholder="e.g. openai, anthropic, google"
          className="w-full px-3 py-2 rounded-lg bg-studio-surface border border-studio-elevated text-sm text-studio-text placeholder:text-studio-text-tertiary focus:outline-none focus:border-studio-primary disabled:opacity-60 disabled:cursor-not-allowed"
        />
      </div>

      <div>
        <label className="block text-[10px] font-semibold uppercase tracking-widest text-studio-text-tertiary mb-1.5">
          Model
        </label>
        <input
          type="text"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          disabled={isKimiFlare}
          placeholder="e.g. gpt-4o, claude-sonnet-4-20250514"
          className="w-full px-3 py-2 rounded-lg bg-studio-surface border border-studio-elevated text-sm text-studio-text placeholder:text-studio-text-tertiary focus:outline-none focus:border-studio-primary disabled:opacity-60 disabled:cursor-not-allowed"
        />
      </div>

      {(!isKimiFlare || cloudMode) && (
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-widest text-studio-text-tertiary mb-1.5">
            API Key
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-..."
            className="w-full px-3 py-2 rounded-lg bg-studio-surface border border-studio-elevated text-sm text-studio-text placeholder:text-studio-text-tertiary focus:outline-none focus:border-studio-primary"
          />
        </div>
      )}

      <div className="flex gap-3 pt-2">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg border border-studio-elevated text-sm text-studio-text hover:border-studio-primary transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
        )}
        <button
          type="submit"
          className="flex-1 px-4 py-2.5 rounded-lg bg-studio-primary text-white text-sm font-medium hover:bg-studio-primary-light transition-colors"
        >
          Save Configuration
        </button>
      </div>
    </form>
  )
}
