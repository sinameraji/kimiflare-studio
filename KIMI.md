# KIMI.md — KimiFlare Studio

> A CTO dashboard for delegating to AI agents. Built with Electron, React, and TypeScript.

---

## 1. Project

| Attribute | Value |
|-----------|-------|
| **Name** | KimiFlare Studio |
| **Runtime** | Node.js (Electron) |
| **Renderer** | React 19 + TypeScript 5.7 |
| **Bundler** | Vite 6 |
| **Styling** | Tailwind CSS 3.4 + custom MUJI-inspired palette |
| **Package manager** | npm |

---

## 2. Build / test / run

| Command | What it does | Notes |
|---------|--------------|-------|
| `npm install` | Install dependencies | — |
| `npm run dev` | Start Vite dev server + Electron | Runs `build:electron` first; Electron loads `http://localhost:5173`. DevTools auto-open. |
| `npm run build` | Full production build | `tsc` → `vite build` → `build:electron`. Outputs to `dist/` and `dist-electron/`. |
| `npm run build:electron` | Compile Electron main/preload only | Uses `tsconfig.electron.json`. |
| `npm run preview` | Preview Vite production build | Does not start Electron. |
| `npm run typecheck` | Type-check renderer + Electron | `tsc --noEmit` for both tsconfigs. |

> **No test suite exists yet.** There are no `*.test.*` or `*.spec.*` files in the project.

---

## 3. Layout

| Directory / File | Rationale |
|------------------|-----------|
| `src/` | Renderer process code (React app). Strict TypeScript, no emit. |
| `src/components/` | React components — one file per major UI region (LeftRail, CenterStage, WelcomeScreen, etc.). |
| `src/data/sample.ts` | Static mock data for the prototype. All components read from here until a backend is wired. |
| `src/utils/` | Small pure helpers (e.g., `exportImage.ts` for clipboard image generation). |
| `src/main.tsx` | Renderer entry point. Mounts `<App />` into `#root` with `StrictMode`. |
| `src/index.css` | Global styles + Tailwind directives + custom scrollbar styling. |
| `electron/` | Electron main-process code. |
| `electron/main.ts` | Entry point for the main process. Creates `BrowserWindow`, loads dev URL or `dist/index.html`. |
| `electron/preload.ts` | Preload script exposing a typed `window.electronAPI` via `contextBridge`. |
| `dist/` | Vite production build output (renderer). |
| `dist-electron/` | Compiled Electron main/preload output. |
| `index.html` | HTML shell for the renderer. Loads Google Fonts (Inter, JetBrains Mono). |
| `PLAN.md` | Product plan and feature roadmap. Read this for UX intent and "what we do NOT build". |
| `PLAN-EXECUTION.md` | Execution log tracking delivered milestones (M0–M5). |

---

## 4. Conventions

### Naming
- **Components**: PascalCase files (`CenterStage.tsx`), default-export functions.
- **Data/constants**: camelCase, named exports (`sampleMission`, `samplePlan`).
- **CSS classes**: Tailwind utility-first; custom colors use `studio-*` prefix defined in `tailwind.config.js`.

### Imports
- ESM only (`"type": "module"`).
- **Always include `.tsx` / `.ts` extensions** in relative imports (e.g., `import App from './App.tsx'`). Required by `allowImportingTsExtensions` + `moduleResolution: bundler`.
- Path alias `@/` maps to `src/` (Vite + TypeScript both configured).

### TypeScript strictness
- `strict: true`
- `noUnusedLocals: true`
- `noUnusedParameters: true`
- `noFallthroughCasesInSwitch: true`
- Target: `ES2022`, JSX: `react-jsx`.

### Electron-specific TS config
- `tsconfig.electron.json` extends root config.
- Differences: `noEmit: false`, `allowImportingTsExtensions: false`, `jsx: preserve`, `lib: ["ES2022"]`.
- Output dir: `dist-electron/`.

### Git
- **Commit style**: Conventional commits (`feat(ui):`, `fix(electron):`, `refactor(ui):`).
- **Branching**: Single `main` branch. No feature branches observed in history.
- **History**: Short, focused commits (13 commits total at time of writing).

### Testing
- None yet. If adding tests, place them co-located or in a `src/__tests__/` directory. Follow the existing file-naming convention (`*.test.tsx`).

---

## 5. Dependencies

| Rule | Detail |
|------|--------|
| **Add runtime** | `npm install <pkg>` |
| **Add dev** | `npm install -D <pkg>` |
| **Runtime deps** | React, React-DOM, `lucide-react`, `@xyflow/react` (flow diagrams), `html-to-image` (report export). Keep these external — Vite bundles them. |
| **Native deps** | Electron is a devDependency. Do not bundle Electron into the renderer build. |
| **Version pinning** | Uses caret ranges (`^`) in `package.json`. `package-lock.json` is committed. |

---

## 6. Do / Don't

1. **Never commit secrets** — `.env` and `.env.local` are gitignored. No `dotenv` is installed; add it only if needed.
2. **Never enable `nodeIntegration`** — `contextIsolation: true` and `nodeIntegration: false` are mandatory for security.
3. **Don't omit `.tsx` extensions** in local imports — TypeScript will error.
4. **Don't add unused variables** — `noUnusedLocals` and `noUnusedParameters` are enforced.
5. **Don't build a code editor** — This is explicitly out of scope per `PLAN.md`.
6. **Don't add IDE-style file trees or diff viewers** — The product philosophy is "architecture, not code."
7. **Keep the MUJI palette** — Warm, minimal tones. Reference `tailwind.config.js` before adding new colors.
8. **Prefer default exports for page-level components** — Matches existing pattern (`App`, `CenterStage`, etc.).

---

## 7. Debugging & Troubleshooting

| Issue | Fix |
|-------|-----|
| Electron shows blank screen | Check that Vite dev server is running on `localhost:5173`. `wait-on` guards this, but verify manually. |
| `__dirname is not defined` in ESM | Use `path.dirname(fileURLToPath(import.meta.url))` (already done in `electron/main.ts`). |
| Type errors in `electron/` | Run `npm run typecheck` — electron uses a separate tsconfig. |
| Stale build artifacts | `rm -rf dist dist-electron` and rebuild. |
| DevTools not opening | Only auto-open in dev mode (`isDev = !app.isPackaged`). Press `Cmd+Option+I` / `Ctrl+Shift+I` manually. |

---

## 8. Architecture Notes

- **Process model**: Standard Electron two-process architecture.
  - **Main** (`electron/main.ts`): Window management, dev/prod URL routing.
  - **Renderer** (`src/`): React SPA. No Node.js APIs exposed directly.
  - **Preload** (`electron/preload.ts`): Minimal `contextBridge` exposing safe IPC helpers.
- **State**: Local React state (`useState`) only. No Redux, Zustand, or context providers yet.
- **Data flow**: Components import mock data from `src/data/sample.ts`. No API client exists.
- **UI layout**: "Mission Control" — LeftRail (mission queue), CenterStage (mission lifecycle with intent/plan/execute/verify phases), WelcomeScreen (landing).
- **Future IPC**: `window.electronAPI.sendMessage` / `onMessage` are wired but unused. Extend `preload.ts` and add `ipcMain` handlers in `main.ts` when needed.
