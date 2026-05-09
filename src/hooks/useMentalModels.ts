import { useState, useCallback, useEffect } from 'react'
import yaml from 'js-yaml'
import type { MentalModelsConfig, MentalModelSection } from '../types/mentalModels.ts'
import { defaultMentalModels } from '../data/defaultMentalModels.ts'

const STORAGE_KEY = 'kimiflare-mental-models'

function loadFromStorage(): MentalModelsConfig | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = yaml.load(raw) as MentalModelsConfig
    if (parsed && Array.isArray(parsed.sections)) return parsed
    return null
  } catch {
    return null
  }
}

function saveToStorage(config: MentalModelsConfig) {
  try {
    const raw = yaml.dump(config, { indent: 2, lineWidth: -1 })
    localStorage.setItem(STORAGE_KEY, raw)
  } catch {
    // ignore
  }
}

export function useMentalModels() {
  const [config, setConfig] = useState<MentalModelsConfig>(() => {
    const stored = loadFromStorage()
    return stored ?? defaultMentalModels
  })

  useEffect(() => {
    saveToStorage(config)
  }, [config])

  const resetToDefaults = useCallback(() => {
    setConfig(defaultMentalModels)
  }, [])

  const updateFromYaml = useCallback((yamlText: string): { success: boolean; error?: string } => {
    try {
      const parsed = yaml.load(yamlText) as MentalModelsConfig
      if (!parsed || typeof parsed !== 'object') {
        return { success: false, error: 'YAML did not parse to an object.' }
      }
      if (!Array.isArray(parsed.sections)) {
        return { success: false, error: 'Missing or invalid "sections" array.' }
      }
      for (const section of parsed.sections) {
        if (!section.id || !section.title || !Array.isArray(section.checks)) {
          return { success: false, error: `Section "${section.title ?? 'unknown'}" is missing required fields (id, title, checks).` }
        }
      }
      setConfig(parsed)
      return { success: true }
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : String(err) }
    }
  }, [])

  const exportToYaml = useCallback((): string => {
    return yaml.dump(config, { indent: 2, lineWidth: -1 })
  }, [config])

  return {
    sections: config.sections,
    config,
    resetToDefaults,
    updateFromYaml,
    exportToYaml,
  }
}

export function getIconComponent(iconName: string) {
  // Dynamic import of lucide icons by name string
  // We'll resolve this in the component layer to avoid bundling issues
  return iconName
}

export type { MentalModelSection }
