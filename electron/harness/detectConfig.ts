import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'

export interface DetectedOpenCodeConfig {
  provider?: string
  model?: string
  apiKey?: string
  baseUrl?: string
  [key: string]: unknown
}

const opencodeConfigPaths = [
  path.join(os.homedir(), '.config', 'opencode', 'opencode.json'),
  path.join(os.homedir(), 'Library', 'Application Support', 'opencode', 'opencode.json'),
  path.join(os.homedir(), '.opencode', 'opencode.json'),
  path.join(os.homedir(), 'AppData', 'Roaming', 'opencode', 'opencode.json'),
]

export function detectOpenCodeConfig(): DetectedOpenCodeConfig | null {
  for (const configPath of opencodeConfigPaths) {
    try {
      if (fs.existsSync(configPath)) {
        const raw = fs.readFileSync(configPath, 'utf-8')
        const parsed = JSON.parse(raw) as DetectedOpenCodeConfig
        return {
          provider: parsed.provider,
          model: parsed.model,
          apiKey: parsed.apiKey,
          baseUrl: parsed.baseUrl,
          ...parsed,
        }
      }
    } catch {
      // Ignore unreadable or malformed config files
    }
  }
  return null
}

export interface DetectedPiConfig {
  provider?: string
  model?: string
  apiKey?: string
  [key: string]: unknown
}

export function detectPiConfig(): DetectedPiConfig | null {
  // Pi stores credentials via AuthStorage (platform-specific keychain or file).
  // We can't read the keychain directly, but we can check for a local config file.
  const piConfigPaths = [
    path.join(os.homedir(), '.config', 'pi', 'config.json'),
    path.join(os.homedir(), 'Library', 'Application Support', 'pi', 'config.json'),
    path.join(os.homedir(), '.pi', 'config.json'),
    path.join(os.homedir(), 'AppData', 'Roaming', 'pi', 'config.json'),
  ]

  for (const configPath of piConfigPaths) {
    try {
      if (fs.existsSync(configPath)) {
        const raw = fs.readFileSync(configPath, 'utf-8')
        const parsed = JSON.parse(raw) as DetectedPiConfig
        return {
          provider: parsed.provider,
          model: parsed.model,
          apiKey: parsed.apiKey,
          ...parsed,
        }
      }
    } catch {
      // Ignore unreadable or malformed config files
    }
  }
  return null
}
