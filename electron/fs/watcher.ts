import type { FSWatcher } from 'chokidar'
import type { FileChangeEvent } from '../../src/types/harness.ts'

let chokidar: typeof import('chokidar') | undefined

try {
  chokidar = await import('chokidar')
} catch {
  console.warn('[watcher] chokidar not available; file watching disabled')
}

const watchers = new Map<string, FSWatcher>()

export function watchWorkspace(
  dirPath: string,
  onChange: (change: FileChangeEvent) => void,
): void {
  if (!chokidar) {
    console.warn('[watcher] cannot watch; chokidar not installed')
    return
  }

  unwatchWorkspace(dirPath)

  const watcher = chokidar.watch(dirPath, {
    ignored: /node_modules|\.git|dist|dist-electron/,
    persistent: true,
    ignoreInitial: true,
  })

  watcher
    .on('add', (p) => onChange({ type: 'add', path: p }))
    .on('change', (p) => onChange({ type: 'change', path: p }))
    .on('unlink', (p) => onChange({ type: 'delete', path: p }))

  watchers.set(dirPath, watcher)
}

export function unwatchWorkspace(dirPath: string): void {
  watchers.get(dirPath)?.close()
  watchers.delete(dirPath)
}
