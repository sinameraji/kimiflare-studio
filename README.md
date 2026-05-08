# KimiFlare Studio

> A CTO dashboard for delegating to AI agents. Built with Electron, React, and TypeScript.

## Philosophy

The IDE is dead. In 2026, humans don't need to look at every line of code AI writes. KimiFlare Studio is designed for **technical leaders who direct, understand, and trust** autonomous agents — not pair-program with them.

## Features (Prototype)

- **Mission Control Layout**: Left rail (agents, projects, risk), center stage (mission lifecycle), right panel (decisions, costs, diagrams)
- **Plan Canvas**: Architecture deltas, risk assessments, cost projections, alternative approaches
- **Approval Slider**: Visual gesture from "Reject" to "Full Autonomy"
- **Decision Journal**: Persistent log of every architectural choice
- **Risk Radar**: Real-time security, performance, operational, and compliance risk tracking
- **Cost Tracker**: Running token and API cost tally
- **System Diagrams**: Visual architecture evolution (not code diffs)

## Development

```bash
# Install dependencies
npm install

# Run in development mode (Electron + Vite)
npm run dev

# Type check
npm run typecheck

# Build for production
npm run build
```

## Project Structure

```
kimiflare-studio/
├── electron/          # Electron main process
│   ├── main.ts        # Main window setup
│   └── preload.ts     # IPC bridge
├── src/
│   ├── components/    # React components
│   ├── data/          # Sample data for prototype
│   ├── App.tsx        # Root component
│   ├── main.tsx       # Renderer entry
│   └── index.css      # Tailwind + custom styles
├── PLAN.md            # Full product plan
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## Status

**Phase 0: Prototype** — Static UI with sample data. No agent wiring yet. Validating the "feeling" of Mission Control before building functionality.

See [PLAN.md](./PLAN.md) for the full product vision, user stories, and roadmap.
