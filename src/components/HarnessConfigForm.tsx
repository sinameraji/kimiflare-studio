import { useState, useEffect } from 'react'
import { ChevronLeft, RefreshCw, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react'
import type { HarnessConfig, HarnessId } from '../types/harness.ts'

interface HarnessConfigFormProps {
  harnessId: HarnessId
  onSubmit: (config: HarnessConfig) => void
  onBack?: () => void
}

interface DetectedConfig {
  mode?: 'direct' | 'cloud'
  provider?: string
  model?: string
  apiKey?: string
  baseUrl?: string
  accountId?: string
  apiToken?: string
  githubToken?: string
  remoteWorkerUrl?: string
  [key: string]: unknown
}

/* ------------------------------------------------------------------ */
/*  Inline help links                                                  */
/* ------------------------------------------------------------------ */

function HelpLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-[11px] text-studio-primary hover:underline"
    >
      {children}
      <ExternalLink className="w-3 h-3" />
    </a>
  )
}

function KimiFlareDirectHelp() {
  return (
    <div className="p-3 rounded-lg bg-studio-primary/5 border border-studio-primary/10 space-y-1.5">
      <p className="text-[11px] font-medium text-studio-text">Need a Cloudflare API Token?</p>
      <ol className="text-[11px] text-studio-text-secondary list-decimal list-inside space-y-0.5">
        <li>
          Go to{' '}
          <HelpLink href="https://dash.cloudflare.com/profile/api-tokens">
            Cloudflare API Tokens
          </HelpLink>
        </li>
        <li>Click "Create Token" → "Custom token"</li>
        <li>
          Permissions: <span className="text-studio-text font-medium">Account / AI Gateway / Read</span> and{' '}
          <span className="text-studio-text font-medium">Account / Workers AI / Edit</span>
        </li>
        <li>Copy the token and paste it above</li>
      </ol>
      <p className="text-[10px] text-studio-text-tertiary pt-1">
        Your Account ID is on the right sidebar of any Cloudflare dashboard page.
      </p>
    </div>
  )
}

function KimiFlareCloudHelp() {
  return (
    <div className="p-3 rounded-lg bg-studio-primary/5 border border-studio-primary/10 space-y-1.5">
      <p className="text-[11px] font-medium text-studio-text">Need a GitHub Token?</p>
      <ol className="text-[11px] text-studio-text-secondary list-decimal list-inside space-y-0.5">
        <li>
          Go to{' '}
          <HelpLink href="https://github.com/settings/tokens">GitHub Personal Access Tokens</HelpLink>
        </li>
        <li>Click "Generate new token (classic)"</li>
        <li>
          Scope: <span className="text-studio-text font-medium">read:user</span> (minimum)
        </li>
        <li>Copy the token and paste it above</li>
      </ol>
      <p className="text-[10px] text-studio-text-tertiary pt-1">
        Cloud mode proxies AI requests through a Cloudflare Worker. Your app never sees raw Cloudflare credentials.
      </p>
    </div>
  )
}

function OpenCodeHelp() {
  return (
    <div className="p-3 rounded-lg bg-studio-primary/5 border border-studio-primary/10 space-y-1.5">
      <p className="text-[11px] font-medium text-studio-text">First time with OpenCode?</p>
      <ol className="text-[11px] text-studio-text-secondary list-decimal list-inside space-y-0.5">
        <li>
          Install: <code className="text-studio-text bg-studio-elevated px-1 rounded">npm install -g @opencode-ai/sdk</code>
        </li>
        <li>
          Run: <code className="text-studio-text bg-studio-elevated px-1 rounded">opencode init</code>
        </li>
        <li>Follow the interactive setup to choose your provider and model</li>
      </ol>
      <p className="text-[10px] text-studio-text-tertiary pt-1">
        Once configured, KimiFlare Studio will automatically detect your settings.
      </p>
    </div>
  )
}

function PiHelp() {
  return (
    <div className="p-3 rounded-lg bg-studio-primary/5 border border-studio-primary/10 space-y-1.5">
      <p className="text-[11px] font-medium text-studio-text">First time with Pi?</p>
      <ol className="text-[11px] text-studio-text-secondary list-decimal list-inside space-y-0.5">
        <li>
          Install: <code className="text-studio-text bg-studio-elevated px-1 rounded">npm install -g @earendil-works/pi-coding-agent</code>
        </li>
        <li>
          Run: <code className="text-studio-text bg-studio-elevated px-1 rounded">pi login</code>
        </li>
        <li>Follow the prompts to authenticate with your preferred provider</li>
      </ol>
      <p className="text-[10px] text-studio-text-tertiary pt-1">
        Once logged in, KimiFlare Studio will reuse your existing Pi credentials.
      </p>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

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

  // Auto-detect state (all harnesses)
  const [detected, setDetected] = useState<DetectedConfig | null>(null)
  const [detecting, setDetecting] = useState(false)
  const [detectError, setDetectError] = useState('')

  // Manual override state (for OpenCode / Pi)
  const [useManual, setUseManual] = useState(false)
  const [manualProvider, setManualProvider] = useState('')
  const [manualModel, setManualModel] = useState('')
  const [manualApiKey, setManualApiKey] = useState('')

  useEffect(() => {
    runDetection()
  }, [harnessId])

  const runDetection = async () => {
    setDetecting(true)
    setDetectError('')
    try {
      const result = (await window.electronAPI.harness.detectConfig(harnessId)) as DetectedConfig | null
      setDetected(result)
      if (result) {
        if (result.mode) setMode(result.mode)
        if (result.accountId) setAccountId(result.accountId)
        if (result.apiToken) setApiToken(result.apiToken)
        if (result.githubToken) setGithubToken(result.githubToken)
        if (result.remoteWorkerUrl) setRemoteWorkerUrl(result.remoteWorkerUrl)
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

          {/* Detection status for KimiFlare */}
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-studio-text-tertiary">
              Credentials
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

          {!detecting && detected?.mode === mode && (
            <div className="flex items-center gap-2 text-xs text-studio-success">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Credentials detected from existing setup
            </div>
          )}

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
              <KimiFlareDirectHelp />
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
              <KimiFlareCloudHelp />
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
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs text-studio-warning">
                  <AlertCircle className="w-3.5 h-3.5" />
                  No configuration found.
                </div>
                {isOpenCode ? <OpenCodeHelp /> : <PiHelp />}
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
