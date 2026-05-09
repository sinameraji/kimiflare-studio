import { useState, useMemo, useCallback } from 'react'
import { Settings, Sparkles } from 'lucide-react'
import type { MentalModelSection, AllSectionStates } from '../types/mentalModels.ts'
import IntentSection from './IntentSection.tsx'
import MentalModelEditor from './MentalModelEditor.tsx'

interface IntentBuilderProps {
  sections: MentalModelSection[]
  yamlText: string
  onUpdateYaml: (yamlText: string) => { success: boolean; error?: string }
  onResetDefaults: () => void
  onGenerate: (assembledPrompt: string) => void
}

function createEmptyState(section: MentalModelSection): AllSectionStates[string] {
  const selects: Record<string, string> = {}
  for (const sel of section.selects) {
    selects[sel.id] = sel.options[0]?.value ?? ''
  }
  return {
    checks: {},
    checkTexts: {},
    selects,
    customText: '',
  }
}

export default function IntentBuilder({
  sections,
  yamlText,
  onUpdateYaml,
  onResetDefaults,
  onGenerate,
}: IntentBuilderProps) {
  const [goal, setGoal] = useState(
    'Refactor the authentication middleware from session-based to JWT with Redis-backed revocation'
  )
  const [sectionStates, setSectionStates] = useState<AllSectionStates>(() => {
    const initial: AllSectionStates = {}
    for (const section of sections) {
      initial[section.id] = createEmptyState(section)
    }
    return initial
  })
  const [showEditor, setShowEditor] = useState(false)
  const [showPreview, setShowPreview] = useState(true)

  // Re-initialize states when sections change (e.g., after YAML edit)
  const initStatesForSections = useCallback((newSections: MentalModelSection[]) => {
    setSectionStates((prev) => {
      const next: AllSectionStates = {}
      for (const section of newSections) {
        const existing = prev[section.id]
        if (existing) {
          // Merge: keep existing check values, but ensure all selects exist
          const selects: Record<string, string> = {}
          for (const sel of section.selects) {
            selects[sel.id] = existing.selects[sel.id] ?? sel.options[0]?.value ?? ''
          }
          next[section.id] = { ...existing, selects }
        } else {
          next[section.id] = createEmptyState(section)
        }
      }
      return next
    })
  }, [])

  const assembledPrompt = useMemo(() => {
    const parts: string[] = []
    if (goal.trim()) {
      parts.push(`Goal:\n${goal.trim()}`)
    }

    for (const section of sections) {
      const state = sectionStates[section.id]
      if (!state) continue

      const sectionParts: string[] = []

      // Checks
      for (const check of section.checks) {
        if (state.checks[check.id]) {
          const text = (state.checkTexts[check.id] ?? check.defaultPrompt).trim()
          if (text) sectionParts.push(text)
        }
      }

      // Selects
      for (const sel of section.selects) {
        const value = state.selects[sel.id]
        if (value && value !== 'none') {
          const prompt = sel.defaultPromptTemplate.replace(/\{\{value\}\}/g, value).trim()
          if (prompt) sectionParts.push(prompt)
        }
      }

      // Custom text
      if (state.customText.trim()) {
        sectionParts.push(state.customText.trim())
      }

      if (sectionParts.length > 0) {
        parts.push(`\n${section.title}:\n${sectionParts.map((p) => `- ${p}`).join('\n')}`)
      }
    }

    return parts.join('\n')
  }, [goal, sections, sectionStates])

  const updateSection = useCallback(
    (sectionId: string, updater: (prev: AllSectionStates[string]) => AllSectionStates[string]) => {
      setSectionStates((prev) => ({
        ...prev,
        [sectionId]: updater(prev[sectionId] ?? createEmptyState(sections.find((s) => s.id === sectionId)!)),
      }))
    },
    [sections]
  )

  const handleToggleCheck = useCallback(
    (sectionId: string, checkId: string, checked: boolean) => {
      updateSection(sectionId, (prev) => ({
        ...prev,
        checks: { ...prev.checks, [checkId]: checked },
        checkTexts: {
          ...prev.checkTexts,
          [checkId]: prev.checkTexts[checkId] ?? sections.find((s) => s.id === sectionId)?.checks.find((c) => c.id === checkId)?.defaultPrompt ?? '',
        },
      }))
    },
    [updateSection, sections]
  )

  const handleChangeCheckText = useCallback(
    (sectionId: string, checkId: string, text: string) => {
      updateSection(sectionId, (prev) => ({
        ...prev,
        checkTexts: { ...prev.checkTexts, [checkId]: text },
      }))
    },
    [updateSection]
  )

  const handleChangeSelect = useCallback(
    (sectionId: string, selectId: string, value: string) => {
      updateSection(sectionId, (prev) => ({
        ...prev,
        selects: { ...prev.selects, [selectId]: value },
      }))
    },
    [updateSection]
  )

  const handleChangeCustomText = useCallback(
    (sectionId: string, text: string) => {
      updateSection(sectionId, (prev) => ({
        ...prev,
        customText: text,
      }))
    },
    [updateSection]
  )

  const handleSaveYaml = useCallback(
    (text: string) => {
      const result = onUpdateYaml(text)
      if (result.success) {
        // Re-init states after a short delay to let parent state update
        setTimeout(() => initStatesForSections(sections), 0)
      }
      return result
    },
    [onUpdateYaml, initStatesForSections, sections]
  )

  const activeCount = useMemo(() => {
    let count = 0
    for (const section of sections) {
      const state = sectionStates[section.id]
      if (!state) continue
      count += Object.values(state.checks).filter(Boolean).length
      count += Object.values(state.selects).filter((v) => v && v !== 'none').length
      if (state.customText.trim()) count += 1
    }
    return count
  }, [sections, sectionStates])

  return (
    <div className="mt-6 space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-sm font-semibold text-studio-text">Intent Builder</h3>
        <p className="text-[11px] text-studio-text-secondary mt-0.5">
          Describe your goal, then opt into mental models to enrich the prompt.
        </p>
      </div>

      {/* Goal */}
      <div>
        <label className="text-[10px] font-semibold uppercase tracking-widest text-studio-text-tertiary block mb-2">
          Goal
        </label>
        <textarea
          rows={3}
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          className="w-full bg-studio-surface rounded-lg p-3 text-sm text-studio-text placeholder-studio-text-tertiary focus:outline-none focus:ring-1 focus:ring-studio-primary/50 resize-none border border-studio-elevated"
          placeholder="What do you want to build or change?"
        />
      </div>

      {/* Mental Model Sections */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-studio-text-tertiary">
              Mental Models
            </span>
            {activeCount > 0 && (
              <span className="text-[10px] text-studio-primary font-medium">
                {activeCount} active
              </span>
            )}
          </div>
          <button
            onClick={() => setShowEditor(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium text-studio-text-tertiary hover:text-studio-text-secondary hover:bg-studio-elevated transition-colors"
          >
            <Settings className="w-3 h-3" />
            Edit Mental Models
          </button>
        </div>
        {sections.map((section) => (
          <IntentSection
            key={section.id}
            section={section}
            state={sectionStates[section.id] ?? createEmptyState(section)}
            onToggleCheck={(checkId, checked) => handleToggleCheck(section.id, checkId, checked)}
            onChangeCheckText={(checkId, text) => handleChangeCheckText(section.id, checkId, text)}
            onChangeSelect={(selectId, value) => handleChangeSelect(section.id, selectId, value)}
            onChangeCustomText={(text) => handleChangeCustomText(section.id, text)}
          />
        ))}
      </div>

      {/* Live Preview */}
      <div className="border border-studio-elevated rounded-xl overflow-hidden bg-studio-surface">
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="w-full flex items-center justify-between px-5 py-3 text-left hover:bg-studio-elevated-hover/30 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-studio-primary" />
            <span className="text-xs font-medium text-studio-text">Assembled Prompt</span>
          </div>
          <span className="text-[10px] text-studio-text-tertiary">
            {showPreview ? 'Hide' : 'Show'}
          </span>
        </button>
        {showPreview && (
          <div className="px-5 pb-4 pt-1 border-t border-studio-elevated">
            <pre className="text-xs font-mono text-studio-text-secondary leading-relaxed whitespace-pre-wrap bg-studio-bg rounded-lg p-4 border border-studio-elevated">
              {assembledPrompt || 'Start typing your goal and select mental models to see the assembled prompt...'}
            </pre>
          </div>
        )}
      </div>

      {/* Generate */}
      <button
        onClick={() => onGenerate(assembledPrompt)}
        className="w-full py-2.5 rounded-lg bg-studio-primary text-white text-sm font-medium hover:bg-studio-primary-light transition-colors"
      >
        Generate Plan
      </button>

      {/* Editor Modal */}
      {showEditor && (
        <MentalModelEditor
          yamlText={yamlText}
          onSave={handleSaveYaml}
          onClose={() => setShowEditor(false)}
          onReset={() => {
            onResetDefaults()
            setShowEditor(false)
          }}
        />
      )}
    </div>
  )
}
