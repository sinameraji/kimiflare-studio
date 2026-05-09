import { app, safeStorage } from 'electron'
import path from 'node:path'
import fs from 'node:fs'

const CONFIG_FILE = 'config.json'
const ENCRYPTED_FILE = 'config.enc'

function getConfigPath(): string {
  return path.join(app.getPath('userData'), CONFIG_FILE)
}

function getEncryptedPath(): string {
  return path.join(app.getPath('userData'), ENCRYPTED_FILE)
}

export class ConfigStore {
  private cache: Map<string, unknown> = new Map()
  private initialized = false

  init(): void {
    if (this.initialized) return
    this.load()
    this.initialized = true
  }

  private load(): void {
    const plainPath = getConfigPath()
    const encPath = getEncryptedPath()

    if (fs.existsSync(encPath) && safeStorage.isEncryptionAvailable()) {
      try {
        const encrypted = fs.readFileSync(encPath)
        const decrypted = safeStorage.decryptString(encrypted)
        const data = JSON.parse(decrypted) as Record<string, unknown>
        for (const [key, value] of Object.entries(data)) {
          this.cache.set(key, value)
        }
        return
      } catch {
        // fall through to plain file
      }
    }

    if (fs.existsSync(plainPath)) {
      try {
        const raw = fs.readFileSync(plainPath, 'utf-8')
        const data = JSON.parse(raw) as Record<string, unknown>
        for (const [key, value] of Object.entries(data)) {
          this.cache.set(key, value)
        }
      } catch {
        // ignore corrupt file
      }
    }
  }

  private save(): void {
    const data = Object.fromEntries(this.cache)
    const json = JSON.stringify(data, null, 2)

    if (safeStorage.isEncryptionAvailable()) {
      const encrypted = safeStorage.encryptString(json)
      fs.writeFileSync(getEncryptedPath(), encrypted)
      // remove plain file if it exists
      const plainPath = getConfigPath()
      if (fs.existsSync(plainPath)) {
        fs.unlinkSync(plainPath)
      }
    } else {
      fs.writeFileSync(getConfigPath(), json)
    }
  }

  get<T>(key: string): T | undefined {
    return this.cache.get(key) as T | undefined
  }

  set<T>(key: string, value: T): void {
    this.cache.set(key, value)
    this.save()
  }

  getAll(): Record<string, unknown> {
    return Object.fromEntries(this.cache)
  }
}

export const configStore = new ConfigStore()
