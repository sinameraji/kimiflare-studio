import { useRef, useCallback, useEffect } from 'react'
import { X, Copy, Share2, CheckCircle2 } from 'lucide-react'
import { sampleMission, samplePlan } from '../data/sample.ts'
import { copyImageToClipboard } from '../utils/exportImage.ts'
import ArchitectureDiagram from './ArchitectureDiagram.tsx'

interface MissionReportProps {
  onClose: () => void
}

export default function MissionReport({ onClose }: MissionReportProps) {
  const cardRef = useRef<HTMLDivElement>(null)

  const handleCopyImage = useCallback(async () => {
    if (!cardRef.current) return
    try {
      await copyImageToClipboard(cardRef.current)
      alert('Image copied to clipboard')
    } catch {
      alert('Failed to copy image')
    }
  }, [])

  const handleShare = useCallback(async () => {
    const text = `Just delegated a full ${sampleMission.title} to my AI team. ${sampleMission.risksMitigated} risks mitigated, $${sampleMission.estimatedCost} spent, ~${sampleMission.hoursSaved} hours saved. ${sampleMission.autonomyLevel}% autonomy. This is what CTO work looks like now.`

    if (navigator.share) {
      try {
        await navigator.share({ title: sampleMission.title, text })
        return
      } catch {
        // fall through to fallback
      }
    }

    // Fallback: copy text + try image
    try {
      await navigator.clipboard.writeText(text)
      if (cardRef.current) {
        await copyImageToClipboard(cardRef.current)
      }
      alert('Text and image copied to clipboard')
    } catch {
      alert('Failed to share')
    }
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const riskCounts = { low: 0, medium: 0, high: 0 }
  samplePlan.risks.forEach((r) => {
    riskCounts[r.level]++
  })

  return (
    <div className="fixed inset-0 bg-studio-bg z-50 overflow-y-auto">
      {/* Toolbar */}
      <div className="sticky top-0 flex items-center justify-end gap-2 px-6 py-4 bg-studio-bg/90 backdrop-blur-sm z-10">
        <button
          onClick={handleCopyImage}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-studio-surface text-studio-text-secondary text-sm font-medium hover:text-studio-text border border-studio-elevated transition-colors"
        >
          <Copy className="w-4 h-4" />
          Copy Image
        </button>
        <button
          onClick={handleShare}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-studio-primary text-white text-sm font-medium hover:bg-studio-primary-light transition-colors"
        >
          <Share2 className="w-4 h-4" />
          Share
        </button>
        <button
          onClick={onClose}
          className="ml-2 p-2 rounded-lg hover:bg-studio-surface text-studio-text-tertiary hover:text-studio-text transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Report Card */}
      <div className="max-w-2xl mx-auto px-8 pb-16">
        <div
          ref={cardRef}
          className="bg-studio-bg rounded-2xl border border-studio-elevated p-10"
        >
          {/* Brand Header */}
          <div className="text-center mb-10">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-studio-text-tertiary">
              KimiFlare Studio
            </span>
          </div>

          {/* Mission Title */}
          <h1 className="text-2xl font-semibold text-studio-text text-center tracking-tight mb-10">
            {sampleMission.title}
          </h1>

          {/* Architecture Diagram */}
          <div className="mb-10">
            <ArchitectureDiagram
              before={samplePlan.architectureDelta.before}
              after={samplePlan.architectureDelta.after}
            />
          </div>

          {/* Risk Summary */}
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-studio-text">
                {samplePlan.risks.length} Risks Identified
              </span>
              <span className="text-sm font-medium text-studio-success flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                {samplePlan.risks.length} Risks Mitigated
              </span>
            </div>
            <div className="space-y-2">
              {samplePlan.risks.map((risk, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-xs text-studio-text-secondary w-24">{risk.category}</span>
                  <div className="flex-1 h-2 rounded-full bg-studio-elevated overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        risk.level === 'low'
                          ? 'bg-studio-success'
                          : risk.level === 'medium'
                            ? 'bg-studio-warning'
                            : 'bg-studio-critical'
                      }`}
                      style={{ width: risk.level === 'high' ? '100%' : risk.level === 'medium' ? '60%' : '30%' }}
                    />
                  </div>
                  <span
                    className={`text-[10px] uppercase font-bold w-16 text-right ${
                      risk.level === 'low'
                        ? 'text-studio-success'
                        : risk.level === 'medium'
                          ? 'text-studio-warning'
                          : 'text-studio-critical'
                    }`}
                  >
                    {risk.level}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Cost & Time */}
          <div className="flex items-center justify-center gap-8 mb-10">
            <div className="text-center">
              <div className="text-2xl font-semibold text-studio-cost">
                ${sampleMission.estimatedCost}
              </div>
              <div className="text-[11px] text-studio-text-secondary mt-1">spent</div>
            </div>
            <div className="w-px h-10 bg-studio-elevated" />
            <div className="text-center">
              <div className="text-2xl font-semibold text-studio-text">
                ~{sampleMission.hoursSaved} hours
              </div>
              <div className="text-[11px] text-studio-text-secondary mt-1">saved</div>
            </div>
          </div>

          {/* Autonomy */}
          <div className="border border-studio-elevated rounded-xl p-5 text-center mb-10">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-studio-text-tertiary block mb-2">
              Autonomy Granted
            </span>
            <span className="text-3xl font-semibold text-studio-primary">
              {sampleMission.autonomyLevel}%
            </span>
          </div>

          {/* Footer */}
          <div className="text-center">
            <span className="text-[11px] text-studio-text-tertiary">
              Directed via KimiFlare Studio
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
