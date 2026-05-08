# KimiFlare Studio — Product Plan

> **Status**: Conceptual / Prototype Phase  
> **Stack**: Electron, React, TypeScript  
> **Philosophy**: The IDE is dead. This is a CTO dashboard for delegating to AI agents.

---

## 1. Why This Exists

The terminal version of KimiFlare treats the user as a pair programmer. KimiFlare Studio treats the user as a **Technical Lead delegating to a team of agents**.

Terminal is designed for command-line interfaces, not GUIs. We have outgrown it. In 2026, humans do not need to look at every line of code AI writes. We need to **direct, understand, and trust** the work being done.

**The mental model**: You are the CTO. The app is your engineering dashboard. You don't read every commit; you review architecture decisions, risk assessments, and cost implications.

---

## 2. What We Explicitly Do NOT Build

- ❌ Code editor / syntax highlighting (use GitHub or terminal for that)
- ❌ File tree browser (irrelevant at this altitude)
- ❌ Line-by-line diff view (the agent is trusted; we verify outcomes, not syntax)
- ❌ Debugger integration (the agent debugs itself; we see the conclusion)
- ❌ IDE-style "pair programming" (the agent works autonomously; we govern)

---

## 3. The "Mission" Lifecycle

Every interaction is a **Mission**, not a chat thread. A Mission has phases:

```
Intent → Plan → Execute → Verify
```

### 3.1 Intent Capture
Not just a chat box. Structured input:
- **Goal**: What are we building? (free text)
- **Constraints**: Non-negotiables (budget, latency, compliance, tech stack)
- **Confidence Level**: "Explore" vs "Execute" vs "Emergency Fix"
- **Context Scope**: Which parts of the system can the agent touch?

This turns vague prompts into **commissioned work with clear boundaries**.

### 3.2 Plan Canvas (Pre-Execution)
Before any code is written, the agent produces:
- **Approach Summary**: Plain English strategy
- **Architecture Delta**: Visual diff of how the system changes (C4 diagrams, not code diffs)
- **Risk Assessment**: Security, performance, breaking changes, rollback complexity
- **Cost Projection**: Token estimate, API cost, infrastructure impact
- **Alternative Approaches**: "We could do X (fast, risky) or Y (slow, robust)"

**User story**: *As a CTO, I want to reject a plan before $50 of API tokens are spent building the wrong thing.*

### 3.3 Execution Theater (During)
While the agent works:
- **Live Activity Stream**: High-level actions, not logs ("Refactoring auth middleware" not "Opened file.js")
- **System Diagram Evolution**: Watch the architecture diagram update in real-time as files change
- **Cost Ticker**: Running total of spend for this session
- **Anomaly Alerts**: "This change touches 47 files — unusually broad. Proceed?"
- **Agent Monologue**: The agent's internal reasoning, surfaced (Chain-of-Thought visibility)

### 3.4 Verification Gallery (Post-Execution)
Instead of code review:
- **Behavioral Proof**: "I tested this with 12 scenarios; here are the inputs/outputs"
- **Screenshot/Visual Diff**: For UI changes (if applicable)
- **Contract Verification**: API schema changes, type safety proofs
- **Rollback Snapshot**: One-click "undo this entire session"

---

## 4. Core Features

### 4.1 The Decision Journal (Persistent)
Every significant choice the agent makes is logged:
- **Decision**: "Chose Redis over PostgreSQL for session store"
- **Rationale**: Auto-generated pros/cons
- **Trade-offs**: "Sacrifices durability for speed"
- **Reversibility**: "Easy to change later" vs "Architectural commitment"
- **Human Override History**: When you said "no, do it this way instead"

This becomes **organizational memory**. New team members (or future you) can read why the system is the way it is.

### 4.2 The Risk Radar (Ongoing)
A persistent panel showing:
- **Security Surface**: New endpoints, auth changes, dependency vulnerabilities introduced
- **Performance Impact**: Latency regressions, bundle size changes, DB query complexity
- **Operational Risk**: New infrastructure required, monitoring gaps, rollback difficulty
- **Compliance**: GDPR/Privacy implications of data handling changes

**User story**: *As a TPM, I want to know if this feature introduces PII handling before it ships.*

### 4.3 The Context Map (Memory Visualization)
Visualize what the agent knows:
- **Knowledge Graph**: Entities in the codebase (services, DB tables, external APIs)
- **Memory Confidence**: "I'm 90% sure the auth flow works like this" vs "I'm guessing here"
- **Gaps**: "I don't understand how billing works — human input needed"

### 4.4 Multi-Agent Orchestration
Not one agent, but a **cabinet**:
- **Architect Agent**: Designs structure, reviews plans
- **Implementation Agent**: Writes code
- **Security Agent**: Reviews for vulnerabilities
- **Performance Agent**: Checks efficiency
- **Testing Agent**: Validates behavior

The UI shows them as **parallel tracks** with their own statuses, like watching CI pipelines but for reasoning.

---

## 5. User Stories by Persona

### The Solo Founder/CTO
> "I need to refactor my monolith to microservices. I don't have time to review 200 files. I want to see the before/after architecture diagram, understand the migration risk, approve the plan, and then check in 2 hours to see if it's done."

### The Staff Engineer
> "I'm evaluating three different caching strategies for our ML inference pipeline. I want the agent to model the trade-offs (cost, latency, complexity) and present them as a decision matrix, not code."

### The Technical PM
> "The team wants to add a real-time collaboration feature. I need to know: does this require WebSockets? What's the infrastructure cost? Does it conflict with our GDPR compliance? I don't care about the React components."

### The Agent Itself (meta)
> "I need to surface my uncertainty. When I'm making an architectural guess, I should flag it prominently so the human can correct me before I build a castle on sand."

---

## 6. UI/UX Design

### 6.1 Layout: "Mission Control"
- **Left Rail**: Persistent context (project selector, active agents, risk radar summary)
- **Center Stage**: The current "mission" (intent → plan → execution → verification)
- **Right Panel**: Contextual details (decision journal, cost tracker, system diagram)
- **Bottom Bar**: Global status (connection, total session cost, active tool count)

### 6.2 Navigation: Session-Based, Not Chat-Based
Don't scroll through infinite chat history like Slack. Each "mission" is a **document** with phases. You can jump to:
- The Plan (approved or pending)
- The Execution (live or archived)
- The Verification (results)
- The Decision Journal (persistent)

### 6.3 Animations & Feedback
- **Progressive Disclosure**: Start with high-level summary; expand for detail
- **Ambient Motion**: Gentle pulses on active agents; no spinner fatigue
- **Semantic Zoom**: On the system diagram, zoom from "whole system" to "this service" to "this function" — but never to raw code unless explicitly requested

---

## 7. Color Palette: "Deep Space Executive"

Given the audience (CTOs, staff engineers) and the mood (trust, clarity, authority):

### Base
| Token | Hex | Usage |
|-------|-----|-------|
| Background | `#0B0F19` | Richer than pure black; reduces eye strain, feels premium |
| Surface | `#151B2B` | Cards, panels |
| Elevated | `#1E2538` | Hover states, active selections |

### Accents: "Signal, Not Noise"
| Token | Hex | Usage |
|-------|-----|-------|
| Primary Action | `#4F46E5` | Indigo — intelligent, trustworthy, distinct from generic "tech blue" |
| Success/Verified | `#10B981` | Emerald — calm, not aggressive |
| Warning/Risk | `#F59E0B` | Amber — attention without panic |
| Critical/Blocker | `#EF4444` | Red — use sparingly |
| Information/AI | `#06B6D4` | Cyan — futuristic, agent-associated |

### Text
| Token | Hex | Usage |
|-------|-----|-------|
| Primary | `#F1F5F9` | Slate-100, soft white |
| Secondary | `#94A3B8` | Slate-400, metadata, timestamps |
| Tertiary | `#64748B` | Slate-500, inactive, disabled |

### Special
| Token | Hex | Usage |
|-------|-----|-------|
| Decision Journal | `#FBBF24` | Amber-400 with subtle left border |
| Cost Indicators | `#A78BFA` | Violet-300 — spend visible without alarm |

### Why This Works
- Dark mode default respects the developer audience
- High contrast meets WCAG AA without being harsh
- Semantic color coding lets you scan Risk Radar or Activity Stream instantly
- Indigo + Cyan feels like *intelligent infrastructure* rather than gaming or finance
- No gradients on UI chrome — flat, precise, serious. Gradients only for data visualization

---

## 8. The "Delight" Moments

1. **The Approval Gesture**: When a plan is presented, you don't type "LGTM" — you drag a slider from "Reject" to "Approve with Constraints" to "Full Autonomy." Visual, satisfying, clear.

2. **The Reveal**: When execution completes, the system diagram *morphs* from "before" to "after" with a smooth animation.

3. **The "Wait" Alert**: If the agent is about to do something expensive or irreversible, the UI literally **pauses** with a full-screen gate: "This will cost ~$12 and modify your database schema. Confirm?"

4. **The Weekly Brief**: Every Monday, the app generates a "What Your Agents Did Last Week" summary with architecture changes, cost totals, and decisions made — like a GitHub contribution graph but for AI activity.

---

## 9. Technical Architecture (TBD)

### Open Questions
- How does the desktop app communicate with the agent? (Local server? IPC? SSE?)
- What library for system diagrams? (React Flow, D3, Excalidraw-as-a-library?)
- What data structure represents "risk"?
- How do we share core agent logic between `kimiflare` (CLI) and `kimiflare-studio` (desktop)?

### Proposed Stack
- **Electron** (main + renderer process)
- **React 19** + **TypeScript 5.7**
- **Vite** for renderer build
- **Tailwind CSS** for styling
- **React Flow** or **@xyflow/react** for system diagrams
- **Zustand** or **Jotai** for state management

---

## 10. Roadmap

### Phase 0: Prototype (Now)
- Static UI with sample data
- No agent wiring
- Validate the "feeling" of Mission Control

### Phase 1: Intent → Plan
- Real intent capture
- Plan generation (static or mocked)
- Approval flow

### Phase 2: Execution Theater
- Live activity stream
- Cost ticker
- System diagram evolution

### Phase 3: Verification & Memory
- Decision Journal
- Risk Radar
- Context Map

### Phase 4: Multi-Agent
- Cabinet of specialized agents
- Parallel execution tracks
- Agent-to-agent communication

---

## 11. Relationship to KimiFlare CLI

This is a **separate product** with shared DNA. Eventually:
- Extract `@kimiflare/core` for shared agent logic, tool schemas, API client
- CLI remains the lightweight, terminal-native option
- Studio becomes the "mission control" experience

Do not merge the codebases. They serve different user modes and have different release cadences.

---

*Last updated: 2026-05-08*  
*Next step: Build Phase 0 prototype and validate the feeling.*
