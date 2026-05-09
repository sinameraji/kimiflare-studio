export interface MentalModelCheck {
  id: string
  label: string
  defaultPrompt: string
}

export interface MentalModelSelectOption {
  value: string
  label: string
}

export interface MentalModelSelect {
  id: string
  label: string
  options: MentalModelSelectOption[]
  defaultPromptTemplate: string
}

export interface MentalModelSection {
  id: string
  title: string
  icon: string
  description?: string
  checks: MentalModelCheck[]
  selects: MentalModelSelect[]
  customPromptPlaceholder?: string
}

export interface MentalModelsConfig {
  version: string
  sections: MentalModelSection[]
}

export interface SectionState {
  checks: Record<string, boolean>
  checkTexts: Record<string, string>
  selects: Record<string, string>
  customText: string
}

export type AllSectionStates = Record<string, SectionState>
