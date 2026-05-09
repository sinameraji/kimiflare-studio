import { useState, useCallback } from 'react'
import { X, Download, RotateCcw, FileCode2 } from 'lucide-react'

interface MentalModelEditorProps {
  yamlText: string
  onSave: (yamlText: string) => { success: boolean; error?: string }
  onClose: () => void
  onReset: () => void
}

export default function MentalModelEditor({ yamlText, onSave, onClose, onReset }: MentalModelEditorProps) {
  const [text, setText] = useState(yamlText)
  const [error, setError] = useState<string | null>(null)
  const [savedFlash, setSavedFlash] = useState(false)

  const handleSave = useCallback(() => {
    const result = onSave(text)
    if (result.success) {
      setError(null)
      setSavedFlash(true)
      setTimeout(() => setSavedFlash(false), 1200)
    } else {
      setError(result.error ?? 'Invalid YAML')
    }
  }, [text, onSave])

  const handleDownload = useCallback(() => {
    const blob = new Blob([text], { type: 'text/yaml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'mental-models.yaml'
    a.click()
    URL.revokeObjectURL(url)
  }, [text])

  const handleReset = useCallback(() => {
    if (window.confirm('Reset to default mental models? All custom changes will be lost.')) {
      onReset()
    }
  }, [onReset])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-studio-bg rounded-2xl shadow-2xl w-full max-w-2xl mx-4 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-studio-elevated">
          <div className="flex items-center gap-2.5">
            <FileCode2 className="w-4 h-4 text-studio-primary" />
            <h3 className="text-sm font-semibold text-studio-text">Edit Mental Models</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-studio-elevated text-studio-text-tertiary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Info */}
        <div className="px-6 py-3 bg-studio-surface border-b border-studio-elevated">
          <p className="text-[11px] text-studio-text-secondary leading-relaxed">
            Edit the YAML below to customize mental models, checks, dropdowns, and default prompt snippets.
            Each section needs an <code className="text-studio-primary bg-studio-elevated px-1 rounded">id</code>,{' '}
            <code className="text-studio-primary bg-studio-elevated px-1 rounded">title</code>, and{' '}
            <code className="text-studio-primary bg-studio-elevated px-1 rounded">checks</code> array.
            Changes are saved to localStorage.
          </p>
        </div>

        {/* Editor */}
        <div className="flex-1 min-h-0 px-6 py-4">
          <textarea
            value={text}
            onChange={(e) => {
              setText(e.target.value)
              setError(null)
            }}
            spellCheck={false}
            className="w-full h-full min-h-[300px] bg-studio-surface rounded-xl p-4 text-xs font-mono text-studio-text leading-relaxed focus:outline-none focus:ring-1 focus:ring-studio-primary/40 resize-none border border-studio-elevated"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="px-6 pb-3">
            <div className="bg-studio-critical-light text-studio-critical text-xs rounded-lg px-3 py-2 border border-studio-critical/20">
              {error}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-studio-elevated">
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-studio-text-secondary hover:bg-studio-elevated transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset defaults
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-studio-text-secondary hover:bg-studio-elevated transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Export YAML
            </button>
          </div>
          <div className="flex items-center gap-2">
            {savedFlash && (
              <span className="text-xs text-studio-success font-medium animate-pulse">Saved!</span>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-studio-text-secondary hover:bg-studio-elevated transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-lg bg-studio-primary text-white text-xs font-medium hover:bg-studio-primary-light transition-colors"
            >
              Save & Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
