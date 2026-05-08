export const sampleMission = {
  id: 'mission-001',
  title: 'Refactor Auth Middleware to JWT + Redis',
  phase: 'plan' as const,
  status: 'pending_approval' as const,
  createdAt: '2026-05-08T09:30:00Z',
  estimatedCost: 12.45,
  actualCost: 0,
}

export const samplePlan = {
  approach: `Migrate the current session-based authentication to a stateless JWT system backed by Redis for token revocation. This eliminates the need for sticky sessions and reduces database load on the PostgreSQL primary.`,
  architectureDelta: {
    before: ['Load Balancer → App Server (sticky sessions) → PostgreSQL (sessions table)'],
    after: ['Load Balancer → App Server (stateless) → Redis (token blacklist) → PostgreSQL (users only)'],
  },
  risks: [
    { category: 'Security', level: 'medium' as const, description: 'JWT secret rotation strategy not yet defined. If leaked, all tokens compromised.' },
    { category: 'Performance', level: 'low' as const, description: 'Redis adds ~2ms latency per request but removes DB session queries.' },
    { category: 'Operational', level: 'high' as const, description: 'Requires new Redis cluster in production. Rollback requires session table to remain populated for 24h.' },
  ],
  costProjection: {
    tokens: '~850K',
    apiCost: '$12.45',
    infrastructure: '+$45/mo (Redis Cloud)',
    timeEstimate: '2-3 hours',
  },
  alternatives: [
    { name: 'Keep Current (Sessions)', pros: ['No infrastructure change', 'Well understood'], cons: ['Does not scale horizontally', 'DB load increases with users'] },
    { name: 'JWT Only (No Redis)', pros: ['Fastest to implement', 'Zero infra cost'], cons: ['Cannot revoke tokens instantly', 'Security risk on breach'] },
    { name: 'JWT + Redis (Recommended)', pros: ['Scales horizontally', 'Instant revocation', 'Industry standard'], cons: ['New infrastructure', 'Slightly more complex'] },
  ],
}

export const sampleAgents = [
  { id: 'architect', name: 'Architect', status: 'idle' as const, icon: 'Layout', description: 'Designs structure, reviews plans' },
  { id: 'implementer', name: 'Implementer', status: 'working' as const, icon: 'Code', description: 'Writes code and tests' },
  { id: 'security', name: 'Security', status: 'reviewing' as const, icon: 'Shield', description: 'Reviews for vulnerabilities' },
  { id: 'performance', name: 'Performance', status: 'idle' as const, icon: 'Zap', description: 'Checks efficiency and latency' },
  { id: 'testing', name: 'Testing', status: 'idle' as const, icon: 'CheckCircle', description: 'Validates behavior' },
]

export const sampleDecisions = [
  {
    id: 'd1',
    decision: 'Chose Redis over in-memory store for token blacklist',
    rationale: 'In-memory store would not survive process restarts and prevents horizontal scaling.',
    tradeOffs: 'Adds infrastructure dependency and ~2ms latency.',
    reversibility: 'Easy' as const,
    timestamp: '2026-05-08T09:35:00Z',
    agent: 'Architect',
  },
  {
    id: 'd2',
    decision: 'Selected RS256 over HS256 for JWT signing',
    rationale: 'RS256 allows key rotation without re-deploying all services. HS256 requires shared secret.',
    tradeOffs: 'Slightly larger token size (~200 bytes).',
    reversibility: 'Medium' as const,
    timestamp: '2026-05-08T09:36:00Z',
    agent: 'Security',
  },
]

export const sampleRiskRadar = {
  security: { score: 65, label: 'Medium', items: 2 },
  performance: { score: 85, label: 'Low', items: 1 },
  operational: { score: 35, label: 'High', items: 3 },
  compliance: { score: 90, label: 'Low', items: 0 },
}

export const sampleActivity = [
  { id: 1, agent: 'Architect', action: 'Analyzed current auth flow', time: '2 min ago', type: 'analysis' as const },
  { id: 2, agent: 'Security', action: 'Flagged missing secret rotation', time: '1 min ago', type: 'warning' as const },
  { id: 3, agent: 'Performance', action: 'Estimated Redis latency impact', time: 'Now', type: 'info' as const },
]
