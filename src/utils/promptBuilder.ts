export interface IntentData {
  goal: string
  constraints: string[]
  confidenceLevel: 'explore' | 'execute' | 'emergency_fix'
  contextScope: string
  techStack?: string
  budget?: string
  deadline?: string
}

export interface PlanData {
  approach: string
  architectureDelta: string
  risks: string[]
  costProjection: string
  alternatives: string[]
}

export function buildPlanPrompt(intent: IntentData): string {
  return `
You are in PLAN MODE. Do not write, edit, or execute any files.
Your job is to analyze the codebase and produce a structured plan.

## Goal
${intent.goal}

## Constraints
${intent.constraints.map((c) => `- ${c}`).join('\n')}

## Confidence Level
${intent.confidenceLevel}

## Context Scope
You may only touch: ${intent.contextScope}

## Output Format
1. **Approach**: High-level strategy (2-3 paragraphs)
2. **Architecture Delta**: Describe how the system structure changes
3. **Risks**: Security, performance, breaking changes, rollback complexity
4. **Cost Projection**: Estimated token usage and API cost
5. **Alternatives**: 2-3 alternative approaches with trade-offs
`.trim()
}

export function buildExecutePrompt(approvedPlan: PlanData): string {
  return `
The following plan has been approved. Execute it now.
You may read, write, edit, and execute files as needed.

## Approved Plan
${approvedPlan.approach}

## Constraints
- Follow the approved approach. Do not deviate without good reason.
- If you encounter unexpected complexity, pause and summarize before continuing.
- Run tests after making changes if a test suite exists.
`.trim()
}
