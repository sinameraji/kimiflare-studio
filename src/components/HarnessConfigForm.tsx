import { useState } from 'react'
import type { HarnessConfig, HarnessId } from '../types/harness.ts'

interface HarnessConfigFormProps {
  harnessId: HarnessId
  onSubmit: (config: HarnessConfig) => void
}

export default function HarnessConfigForm({ harnessId, onSubmit }: HarnessConfigFormProps) {
  const [provider, setProvider] = useState('')
  const [model, setModel] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [baseUrl, setBaseUrl] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      harnessId,
      provider: provider || undefined,
      model: model || undefined,
      apiKey: apiKey || undefined,
      baseUrl: baseUrl || undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-[10px] font-semibold uppercase tracking-widest text-studio-text-tertiary mb-1.5">
          Provider
        </label>
        <input
          type="text"
          value={provider}
          onChange={(e) => setProvider(e.target.value)}
          placeholder="e.g. openai, anthropic, google"
          className="w-full px-3 py-2 rounded-lg bg-studio-surface border border-studio-elevated text-sm text-studio-text placeholder:text-studio-text-tertiary focus:outline-none focus:border-studio-primary"
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
          placeholder="e.g. gpt-4o, claude-sonnet-4-20250514"
          className="w-full px-3 py-2 rounded-lg bg-studio-surface border border-studio-elevated text-sm text-studio-text placeholder:text-studio-text-tertiary focus:outline-none focus:border-studio-primary"
        />
      </div>

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

      {harnessId === 'opencode' && (
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-widest text-studio-text-tertiary mb-1.5">
            Base URL (optional)
          </label>
          <input
            type="text"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            placeholder="http://localhost:8080"
            className="w-full px-3 py-2 rounded-lg bg-studio-surface border border-studio-elevated text-sm text-studio-text placeholder:text-studio-text-tertiary focus:outline-none focus:border-studio-primary"
          />
        </div>
      )}

      <button
        type="submit"
        className="w-full px-4 py-2.5 rounded-lg bg-studio-primary text-white text-sm font-medium hover:bg-studio-primary-light transition-colors"
      >
        Save Configuration
      </button>
    </form>
  )
}
