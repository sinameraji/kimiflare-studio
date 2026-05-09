import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'

/* ------------------------------------------------------------------ */
/*  OpenCode                                                           */
/* ------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------ */
/*  Pi                                                                 */
/* ------------------------------------------------------------------ */

export interface DetectedPiConfig {
  provider?: string
  model?: string
  apiKey?: string
  [key: string]: unknown
}

export function detectPiConfig(): DetectedPiConfig | null {
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

/* ------------------------------------------------------------------ */
/*  KimiFlare                                                          */
/* ------------------------------------------------------------------ */

export interface DetectedKimiFlareConfig {
  mode?: 'direct' | 'cloud'
  accountId?: string
  apiToken?: string
  githubToken?: string
  remoteWorkerUrl?: string
  model?: string
}

const kimiflareConfigPaths = [
  path.join(os.homedir(), '.config', 'kimiflare', 'config.json'),
  path.join(os.homedir(), 'Library', 'Application Support', 'kimiflare', 'config.json'),
  path.join(os.homedir(), '.kimiflare', 'config.json'),
  path.join(os.homedir(), 'AppData', 'Roaming', 'kimiflare', 'config.json'),
]

export function detectKimiFlareConfig(): DetectedKimiFlareConfig | null {
  // 1. Check config file
  for (const configPath of kimiflareConfigPaths) {
    try {
      if (fs.existsSync(configPath)) {
        const raw = fs.readFileSync(configPath, 'utf-8')
        const parsed = JSON.parse(raw) as Record<string, unknown>

        // Determine mode from file contents
        if (parsed.githubToken || parsed.remoteWorkerUrl) {
          return {
            mode: 'cloud',
            githubToken: String(parsed.githubToken || ''),
            remoteWorkerUrl: String(parsed.remoteWorkerUrl || ''),
          }
        }
        return {
          mode: 'direct',
          accountId: String(parsed.accountId || parsed.account_id || ''),
          apiToken: String(parsed.apiToken || parsed.api_token || ''),
          model: String(parsed.model || ''),
        }
      }
    } catch {
      // Ignore unreadable or malformed config files
    }
  }

  // 2. Check environment variables (inherited from parent process)
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID || process.env.CF_ACCOUNT_ID || ''
  const apiToken = process.env.CLOUDFLARE_API_TOKEN || process.env.CF_API_TOKEN || ''

  if (accountId && apiToken) {
    return {
      mode: 'direct',
      accountId,
      apiToken,
      model: process.env.KIMIFLARE_MODEL || '',
    }
  }

  return null
}
