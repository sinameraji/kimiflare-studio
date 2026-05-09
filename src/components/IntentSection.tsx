import { useState } from 'react'
import {
  ChevronDown,
  Shield,
  Activity,
  Zap,
  Eye,
  CheckCircle2,
  DollarSign,
  Database,
  type LucideIcon,
} from 'lucide-react'
import type { MentalModelSection, SectionState } from '../types/mentalModels.ts'

const iconMap: Record<string, LucideIcon> = {
  Shield,
  Activity,
  Zap,
  Eye,
  CheckCircle2,
  DollarSign,
  Database,
}

interface IntentSectionProps {
  section: MentalModelSection
  state: SectionState
  onToggleCheck: (checkId: string, checked: boolean) => void
  onChangeCheckText: (checkId: string, text: string) => void
  onChangeSelect: (selectId: string, value: string) => void
  onChangeCustomText: (text: string) => void
}

export default function IntentSection({
  section,
  state,
  onToggleCheck,
  onChangeCheckText,
  onChangeSelect,
  onChangeCustomText,
}: IntentSectionProps) {
  const [isOpen, setIsOpen] = useState(false)

  const Icon = iconMap[section.icon] ?? Shield

  const activeCount =
    Object.values(state.checks).filter(Boolean).length +
    Object.values(state.selects).filter((v) => v && v !== 'none').length +
    (state.customText.trim() ? 1 : 0)

  return (
    <div className="border border-studio-elevated rounded-xl overflow-hidden bg-studio-surface">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-studio-elevated-hover/30 transition-colors"
      >
        <Icon className="w-4 h-4 text-studio-text-secondary shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-studio-text">{section.title}</span>
            {activeCount > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-studio-primary/10 text-studio-primary font-medium">
                {activeCount}
              </span>
            )}
          </div>
          {section.description && (
            <p className="text-[11px] text-studio-text-secondary mt-0.5 truncate">{section.description}</p>
          )}
        </div>
        <ChevronDown
          className={`w-4 h-4 text-studio-text-tertiary shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="px-5 pb-5 pt-1 space-y-4 border-t border-studio-elevated">
          {/* Checkboxes */}
          {section.checks.length > 0 && (
            <div className="space-y-3">
              {section.checks.map((check) => {
                const checked = state.checks[check.id] ?? false
                return (
                  <div key={check.id} className="space-y-2">
                    <label className="flex items-start gap-2.5 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => onToggleCheck(check.id, e.target.checked)}
                        className="mt-0.5 w-4 h-4 rounded border-studio-elevated text-studio-primary focus:ring-studio-primary/30"
                      />
                      <span className="text-sm text-studio-text-secondary group-hover:text-studio-text transition-colors">
                        {check.label}
                      </span>
                    </label>
                    {checked && (
                      <div className="pl-6">
                        <textarea
                          rows={2}
                          value={state.checkTexts[check.id] ?? check.defaultPrompt}
                          onChange={(e) => onChangeCheckText(check.id, e.target.value)}
                          className="w-full bg-studio-bg rounded-lg p-2.5 text-xs text-studio-text-secondary leading-relaxed focus:outline-none focus:ring-1 focus:ring-studio-primary/40 resize-none border border-studio-elevated"
                        />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Dropdowns */}
          {section.selects.length > 0 && (
            <div className="space-y-3">
              {section.selects.map((sel) => (
                <div key={sel.id}>
                  <label className="text-[10px] font-semibold uppercase tracking-widest text-studio-text-tertiary block mb-1.5">
                    {sel.label}
                  </label>
                  <select
                    value={state.selects[sel.id] ?? 'none'}
                    onChange={(e) => onChangeSelect(sel.id, e.target.value)}
                    className="w-full bg-studio-bg rounded-lg px-3 py-2 text-sm text-studio-text border border-studio-elevated focus:outline-none focus:ring-1 focus:ring-studio-primary/40"
                  >
                    {sel.options.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          )}

          {/* Custom text */}
          {section.customPromptPlaceholder && (
            <div>
              <label className="text-[10px] font-semibold uppercase tracking-widest text-studio-text-tertiary block mb-1.5">
                Additional notes
              </label>
              <textarea
                rows={2}
                value={state.customText}
                onChange={(e) => onChangeCustomText(e.target.value)}
                placeholder={section.customPromptPlaceholder}
                className="w-full bg-studio-bg rounded-lg p-3 text-sm text-studio-text placeholder-studio-text-tertiary focus:outline-none focus:ring-1 focus:ring-studio-primary/40 resize-none border border-studio-elevated"
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
