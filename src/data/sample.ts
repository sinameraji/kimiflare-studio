export const sampleMission = {
  id: 'mission-001',
  title: 'Refactor Auth Middleware to JWT + Redis',
  phase: 'plan' as const,
  status: 'pending_approval' as const,
  createdAt: '2026-05-08T09:30:00Z',
  estimatedCost: 12.45,
  actualCost: 0,
  autonomyLevel: 87,
  hoursSaved: 6,
  risksMitigated: 3,
}

export const samplePlan = {
  approach: `Migrate the current session-based authentication to a stateless JWT system backed by Redis for token revocation. This eliminates the need for sticky sessions and reduces database load on the PostgreSQL primary.`,
  architectureDelta: {
    before: ['Load Balancer → App Server (sticky sessions) → PostgreSQL (sessions table)'],
    after: ['Load Balancer → App Server (stateless) → Redis (token blacklist) → PostgreSQL (users only)'],
  },
  risks: [
    { category: 'Security', level: 'medium' as const, confidence: 'medium' as const, description: 'JWT secret rotation strategy not yet defined. If leaked, all tokens compromised.' },
    { category: 'Performance', level: 'low' as const, confidence: 'high' as const, description: 'Redis adds ~2ms latency per request but removes DB session queries.' },
    { category: 'Operational', level: 'high' as const, confidence: 'high' as const, description: 'Requires new Redis cluster in production. Rollback requires session table to remain populated for 24h.' },
  ],
  costProjection: {
    tokens: '~850K',
    apiCost: '$12.45',
    infrastructure: '+$45/mo',
    timeEstimate: '2-3 hours',
  },
  alternatives: [
    { name: 'Keep Current (Sessions)', pros: ['No infrastructure change', 'Well understood'], cons: ['Does not scale horizontally', 'DB load increases with users'] },
    { name: 'JWT Only (No Redis)', pros: ['Fastest to implement', 'Zero infra cost'], cons: ['Cannot revoke tokens instantly', 'Security risk on breach'] },
    { name: 'JWT + Redis (Recommended)', pros: ['Scales horizontally', 'Instant revocation', 'Industry standard'], cons: ['New infrastructure', 'Slightly more complex'] },
  ],
}

export const sampleMissions = [
  { id: 'mission-001', title: 'Refactor Auth to JWT + Redis', status: 'pending_approval' as const, phase: 'plan' as const },
  { id: 'mission-002', title: 'Add rate limiting to API gateway', status: 'in_progress' as const, phase: 'execute' as const },
  { id: 'mission-003', title: 'Migrate from REST to GraphQL', status: 'completed' as const, phase: 'verify' as const },
]

export const sampleActivity = [
  { id: 1, agent: 'Architect', action: 'Analyzed current auth flow', time: '2 min ago', type: 'analysis' as const },
  { id: 2, agent: 'Security', action: 'Flagged missing secret rotation', time: '1 min ago', type: 'warning' as const },
  { id: 3, agent: 'Performance', action: 'Estimated Redis latency impact', time: 'Now', type: 'info' as const },
]
