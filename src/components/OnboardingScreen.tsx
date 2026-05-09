import { useState } from 'react'
import { ArrowRight, FolderOpen, CheckCircle2 } from 'lucide-react'
import type { HarnessConfig, HarnessId } from '../types/harness.ts'
import HarnessPicker from './HarnessPicker.tsx'
import HarnessConfigForm from './HarnessConfigForm.tsx'

interface OnboardingScreenProps {
  onComplete: (config: HarnessConfig, workspacePath: string) => Promise<void>
  onSelectFolder: () => Promise<string | undefined>
}

type Step = 'welcome' | 'harness' | 'config' | 'workspace' | 'done'

export default function OnboardingScreen({ onComplete, onSelectFolder }: OnboardingScreenProps) {
  const [step, setStep] = useState<Step>('welcome')
  const [selectedHarness, setSelectedHarness] = useState<HarnessId | null>(null)
  const [config, setConfig] = useState<HarnessConfig | null>(null)
  const [workspacePath, setWorkspacePath] = useState('')
  const [error, setError] = useState('')
  const [isStarting, setIsStarting] = useState(false)

  const handleSelectFolder = async () => {
    const path = await onSelectFolder()
    if (path) {
      setWorkspacePath(path)
    }
  }

  const handleComplete = async () => {
    if (!config || !workspacePath) return
    setError('')
    setIsStarting(true)
    try {
      await onComplete({ ...config, cwd: workspacePath }, workspacePath)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to start harness')
      setIsStarting(false)
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center h-full overflow-y-auto">
      <div className="w-full max-w-2xl px-8">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-10">
          {(['welcome', 'harness', 'config', 'workspace', 'done'] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  step === s
                    ? 'bg-studio-primary'
                    : ['welcome', 'harness', 'config', 'workspace', 'done'].indexOf(step) > i
                      ? 'bg-studio-success'
                      : 'bg-studio-elevated'
                }`}
              />
              {i < 4 && <div className="w-8 h-px bg-studio-elevated" />}
            </div>
          ))}
        </div>

        {step === 'welcome' && (
          <div className="text-center">
            <h1 className="text-3xl font-semibold text-studio-text tracking-tight mb-4">
              Welcome to KimiFlare Studio
            </h1>
            <p className="text-sm text-studio-text-secondary leading-relaxed mb-8 max-w-md mx-auto">
              A CTO dashboard for delegating to AI agents. Choose your harness, configure your
              model, and start directing architecture.
            </p>
            <button
              onClick={() => setStep('harness')}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-studio-primary text-white text-sm font-medium hover:bg-studio-primary-light transition-colors"
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {step === 'harness' && (
          <div>
            <h2 className="text-xl font-semibold text-studio-text mb-2">Choose a Harness</h2>
            <p className="text-sm text-studio-text-secondary mb-6">
              The harness is the agent that executes your instructions. You can change this later
              per project.
            </p>
            <HarnessPicker selected={selectedHarness} onSelect={setSelectedHarness} />
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => selectedHarness && setStep('config')}
                disabled={!selectedHarness}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-studio-primary text-white text-sm font-medium hover:bg-studio-primary-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 'config' && selectedHarness && (
          <div>
            <h2 className="text-xl font-semibold text-studio-text mb-2">Configure Harness</h2>
            <p className="text-sm text-studio-text-secondary mb-6">
              Set your provider, model, and API key. Credentials are encrypted with your system's
              secure storage.
            </p>
            <HarnessConfigForm
              harnessId={selectedHarness}
              onSubmit={(cfg) => {
                setConfig(cfg)
                setStep('workspace')
              }}
            />
          </div>
        )}

        {step === 'workspace' && (
          <div>
            <h2 className="text-xl font-semibold text-studio-text mb-2">Select Workspace</h2>
            <p className="text-sm text-studio-text-secondary mb-6">
              This is the folder the agent will read from and write to.
            </p>
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={handleSelectFolder}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-studio-surface border border-studio-elevated text-sm text-studio-text hover:border-studio-primary transition-colors"
              >
                <FolderOpen className="w-4 h-4" />
                Choose Folder
              </button>
              {workspacePath && (
                <span className="text-xs text-studio-text-secondary truncate max-w-md">
                  {workspacePath}
                </span>
              )}
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => workspacePath && setStep('done')}
                disabled={!workspacePath}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-studio-primary text-white text-sm font-medium hover:bg-studio-primary-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 'done' && (
          <div className="text-center">
            <CheckCircle2 className="w-12 h-12 text-studio-success mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-studio-text mb-2">You're ready to delegate</h2>
            <p className="text-sm text-studio-text-secondary mb-8">
              Your harness is configured and your workspace is set. Start your first mission.
            </p>
            {error && (
              <div className="mb-4 px-4 py-3 rounded-lg bg-studio-critical-light text-studio-critical text-sm border border-studio-critical/20">
                {error}
              </div>
            )}
            <button
              onClick={handleComplete}
              disabled={isStarting}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-studio-primary text-white text-sm font-medium hover:bg-studio-primary-light transition-colors disabled:opacity-60"
            >
              {isStarting ? 'Starting...' : 'Start First Mission'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
