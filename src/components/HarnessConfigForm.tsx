import { useState, useEffect } from 'react'
import { ChevronLeft, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react'
import type { HarnessConfig, HarnessId } from '../types/harness.ts'

interface HarnessConfigFormProps {
  harnessId: HarnessId
  onSubmit: (config: HarnessConfig) => void
  onBack?: () => void
}

interface DetectedConfig {
  provider?: string
  model?: string
  apiKey?: string
  baseUrl?: string
  [key: string]: unknown
}

export default function HarnessConfigForm({ harnessId, onSubmit, onBack }: HarnessConfigFormProps) {
  const isKimiFlare = harnessId === 'kimiflare'
  const isOpenCode = harnessId === 'opencode'
  const isPi = harnessId === 'pi'

  // KimiFlare state
  const [mode, setMode] = useState<'direct' | 'cloud'>('direct')
  const [accountId, setAccountId] = useState('')
  const [apiToken, setApiToken] = useState('')
  const [githubToken, setGithubToken] = useState('')
  const [remoteWorkerUrl, setRemoteWorkerUrl] = useState('')
  const [kfModel] = useState('@cf/moonshotai/kimi-k2.6')

  // Auto-detect state for OpenCode / Pi
  const [detected, setDetected] = useState<DetectedConfig | null>(null)
  const [detecting, setDetecting] = useState(false)
  const [detectError, setDetectError] = useState('')

  // Manual override state (for all harnesses)
  const [useManual, setUseManual] = useState(false)
  const [manualProvider, setManualProvider] = useState('')
  const [manualModel, setManualModel] = useState('')
  const [manualApiKey, setManualApiKey] = useState('')

  useEffect(() => {
    if (isOpenCode || isPi) {
      runDetection()
    }
  }, [isOpenCode, isPi])

  const runDetection = async () => {
    setDetecting(true)
    setDetectError('')
    try {
      const result = (await window.electronAPI.harness.detectConfig(harnessId)) as DetectedConfig | null
      setDetected(result)
      if (result) {
        setManualProvider(result.provider || '')
        setManualModel(result.model || '')
      }
    } catch (e) {
      setDetectError(e instanceof Error ? e.message : 'Detection failed')
    } finally {
      setDetecting(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (isKimiFlare) {
      onSubmit({
        harnessId,
        mode,
        model: kfModel,
        ...(mode === 'direct'
          ? { accountId: accountId || undefined, apiToken: apiToken || undefined }
          : { githubToken: githubToken || undefined, remoteWorkerUrl: remoteWorkerUrl || undefined }),
      })
      return
    }

    // OpenCode / Pi
    if (useManual) {
      onSubmit({
        harnessId,
        provider: manualProvider || undefined,
        model: manualModel || undefined,
        apiKey: manualApiKey || undefined,
      })
    } else {
      onSubmit({
        harnessId,
        provider: detected?.provider || undefined,
        model: detected?.model || undefined,
        apiKey: detected?.apiKey || undefined,
        baseUrl: detected?.baseUrl || undefined,
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* KimiFlare */}
      {isKimiFlare && (
        <>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-studio-surface border border-studio-elevated">
            <button
              type="button"
              onClick={() => setMode('direct')}
              className={`flex-1 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                mode === 'direct'
                  ? 'bg-studio-primary text-white'
                  : 'text-studio-text-secondary hover:text-studio-text'
              }`}
            >
              Direct (Cloudflare)
            </button>
            <button
              type="button"
              onClick={() => setMode('cloud')}
              className={`flex-1 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                mode === 'cloud'
                  ? 'bg-studio-primary text-white'
                  : 'text-studio-text-secondary hover:text-studio-text'
              }`}
            >
              Cloud (GitHub Auth)
            </button>
          </div>

          {mode === 'direct' && (
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-widest text-studio-text-tertiary mb-1.5">
                  Cloudflare Account ID
                </label>
                <input
                  type="text"
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  placeholder="your-account-id"
                  className="w-full px-3 py-2 rounded-lg bg-studio-surface border border-studio-elevated text-sm text-studio-text placeholder:text-studio-text-tertiary focus:outline-none focus:border-studio-primary"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-widest text-studio-text-tertiary mb-1.5">
                  Cloudflare API Token
                </label>
                <input
                  type="password"
                  value={apiToken}
                  onChange={(e) => setApiToken(e.target.value)}
                  placeholder="your-api-token"
                  className="w-full px-3 py-2 rounded-lg bg-studio-surface border border-studio-elevated text-sm text-studio-text placeholder:text-studio-text-tertiary focus:outline-none focus:border-studio-primary"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-widest text-studio-text-tertiary mb-1.5">
                  Model
                </label>
                <input
                  type="text"
                  value={kfModel}
                  disabled
                  className="w-full px-3 py-2 rounded-lg bg-studio-surface border border-studio-elevated text-sm text-studio-text disabled:opacity-60"
                />
              </div>
            </div>
          )}

          {mode === 'cloud' && (
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-widest text-studio-text-tertiary mb-1.5">
                  GitHub Token
                </label>
                <input
                  type="password"
                  value={githubToken}
                  onChange={(e) => setGithubToken(e.target.value)}
                  placeholder="ghp_..."
                  className="w-full px-3 py-2 rounded-lg bg-studio-surface border border-studio-elevated text-sm text-studio-text placeholder:text-studio-text-tertiary focus:outline-none focus:border-studio-primary"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-widest text-studio-text-tertiary mb-1.5">
                  Remote Worker URL
                </label>
                <input
                  type="text"
                  value={remoteWorkerUrl}
                  onChange={(e) => setRemoteWorkerUrl(e.target.value)}
                  placeholder="https://worker.your-subdomain.workers.dev"
                  className="w-full px-3 py-2 rounded-lg bg-studio-surface border border-studio-elevated text-sm text-studio-text placeholder:text-studio-text-tertiary focus:outline-none focus:border-studio-primary"
                />
              </div>
            </div>
          )}
        </>
      )}

      {/* OpenCode / Pi auto-detect */}
      {(isOpenCode || isPi) && (
        <>
          <div className="p-4 rounded-xl bg-studio-surface border border-studio-elevated">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-studio-text">
                {isOpenCode ? 'OpenCode' : 'Pi'} Configuration
              </span>
              <button
                type="button"
                onClick={runDetection}
                disabled={detecting}
                className="inline-flex items-center gap-1 text-[10px] text-studio-text-secondary hover:text-studio-text transition-colors"
              >
                <RefreshCw className={`w-3 h-3 ${detecting ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>

            {detecting && (
              <p className="text-xs text-studio-text-secondary">Detecting existing configuration...</p>
            )}

            {detectError && (
              <div className="flex items-center gap-2 text-xs text-studio-critical">
                <AlertCircle className="w-3.5 h-3.5" />
                {detectError}
              </div>
            )}

            {!detecting && detected && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-studio-success">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Configuration detected
                </div>
                {detected.provider && (
                  <div className="flex justify-between text-xs">
                    <span className="text-studio-text-secondary">Provider</span>
                    <span className="text-studio-text font-medium">{detected.provider}</span>
                  </div>
                )}
                {detected.model && (
                  <div className="flex justify-between text-xs">
                    <span className="text-studio-text-secondary">Model</span>
                    <span className="text-studio-text font-medium">{detected.model}</span>
                  </div>
                )}
                {detected.apiKey && (
                  <div className="flex justify-between text-xs">
                    <span className="text-studio-text-secondary">API Key</span>
                    <span className="text-studio-text font-medium">••••••••</span>
                  </div>
                )}
              </div>
            )}

            {!detecting && !detected && !detectError && (
              <div className="flex items-center gap-2 text-xs text-studio-warning">
                <AlertCircle className="w-3.5 h-3.5" />
                No configuration found. Run {isOpenCode ? '`opencode init`' : '`pi login`'} first, or enter manually below.
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              id="useManual"
              type="checkbox"
              checked={useManual}
              onChange={(e) => setUseManual(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-studio-elevated text-studio-primary focus:ring-studio-primary"
            />
            <label htmlFor="useManual" className="text-xs text-studio-text cursor-pointer select-none">
              Enter configuration manually
            </label>
          </div>

          {useManual && (
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-widest text-studio-text-tertiary mb-1.5">
                  Provider
                </label>
                <input
                  type="text"
                  value={manualProvider}
                  onChange={(e) => setManualProvider(e.target.value)}
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
                  value={manualModel}
                  onChange={(e) => setManualModel(e.target.value)}
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
                  value={manualApiKey}
                  onChange={(e) => setManualApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="w-full px-3 py-2 rounded-lg bg-studio-surface border border-studio-elevated text-sm text-studio-text placeholder:text-studio-text-tertiary focus:outline-none focus:border-studio-primary"
                />
              </div>
            </div>
          )}
        </>
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
