import type { MentalModelsConfig } from '../types/mentalModels.ts'

export const defaultMentalModels: MentalModelsConfig = {
  version: '1.0.0',
  sections: [
    {
      id: 'security',
      title: 'Security & Compliance',
      icon: 'Shield',
      description: 'Protect data, enforce access control, and meet regulatory requirements.',
      checks: [
        {
          id: 'no-secrets',
          label: 'No secrets in code',
          defaultPrompt:
            'Ensure no API keys, passwords, tokens, or other secrets are hardcoded. Use environment variables or a secrets manager.',
        },
        {
          id: 'input-validation',
          label: 'Input validation & sanitization',
          defaultPrompt:
            'Validate and sanitize all external inputs (user data, file uploads, query params) to prevent injection and malformed data attacks.',
        },
        {
          id: 'auth-review',
          label: 'AuthN / AuthZ review',
          defaultPrompt:
            'Review authentication and authorization logic. Ensure least-privilege access and verify token/session handling.',
        },
      ],
      selects: [
        {
          id: 'compliance-target',
          label: 'Compliance target',
          options: [
            { value: 'none', label: 'None' },
            { value: 'soc2', label: 'SOC 2' },
            { value: 'gdpr', label: 'GDPR' },
            { value: 'hipaa', label: 'HIPAA' },
            { value: 'pci-dss', label: 'PCI-DSS' },
          ],
          defaultPromptTemplate:
            'Design with {{value}} compliance in mind. Include audit logging, data retention policies, and access controls as required.',
        },
      ],
      customPromptPlaceholder: 'Add any security-specific requirements...',
    },
    {
      id: 'reliability',
      title: 'Reliability & Resilience',
      icon: 'Activity',
      description: 'Keep the system up, handle failures gracefully, and deploy safely.',
      checks: [
        {
          id: 'backward-compat',
          label: 'Backward compatibility',
          defaultPrompt:
            'Maintain backward compatibility with existing APIs, data formats, and clients. Provide migration paths where breaking changes are unavoidable.',
        },
        {
          id: 'graceful-degradation',
          label: 'Graceful degradation',
          defaultPrompt:
            'If a dependency fails, the system should degrade gracefully rather than crash entirely. Return cached or simplified responses where possible.',
        },
        {
          id: 'retry-circuit',
          label: 'Retry logic + circuit breaker',
          defaultPrompt:
            'Implement exponential backoff with jitter for retries, and a circuit breaker pattern to prevent cascading failures.',
        },
        {
          id: 'zero-downtime',
          label: 'Zero-downtime deploy',
          defaultPrompt:
            'Design the deployment so it can be rolled out without downtime. Use blue/green, canary, or rolling deployment strategies.',
        },
      ],
      selects: [],
      customPromptPlaceholder: 'Add reliability-specific requirements...',
    },
    {
      id: 'performance',
      title: 'Performance & Scale',
      icon: 'Zap',
      description: 'Meet latency targets and handle expected load efficiently.',
      checks: [
        {
          id: 'optimize-latency',
          label: 'Optimize for latency',
          defaultPrompt:
            'Optimize critical paths for low latency. Consider caching, connection pooling, and avoiding unnecessary serialization.',
        },
        {
          id: 'memory-efficient',
          label: 'Memory-efficient',
          defaultPrompt:
            'Be mindful of memory usage. Avoid memory leaks, unnecessary object retention, and unbounded buffers.',
        },
      ],
      selects: [
        {
          id: 'expected-load',
          label: 'Expected load',
          options: [
            { value: 'prototype', label: 'Prototype (< 1K req/day)' },
            { value: 'small', label: 'Small (1K–10K req/day)' },
            { value: 'medium', label: 'Medium (10K–100K req/day)' },
            { value: 'large', label: 'Large (100K–1M req/day)' },
            { value: 'massive', label: 'Massive (1M+ req/day)' },
          ],
          defaultPromptTemplate:
            'Architect for {{value}} scale. Choose data structures, algorithms, and infrastructure patterns appropriate for this load tier.',
        },
        {
          id: 'latency-target',
          label: 'Latency target',
          options: [
            { value: '<10ms', label: '< 10 ms' },
            { value: '<50ms', label: '< 50 ms' },
            { value: '<200ms', label: '< 200 ms' },
            { value: '<1s', label: '< 1 s' },
            { value: '<3s', label: '< 3 s' },
          ],
          defaultPromptTemplate:
            'Target p99 latency under {{value}}. Profile and optimize any hot paths that exceed this threshold.',
        },
      ],
      customPromptPlaceholder: 'Add performance-specific requirements...',
    },
    {
      id: 'observability',
      title: 'Observability',
      icon: 'Eye',
      description: 'Make the system debuggable and monitorable in production.',
      checks: [
        {
          id: 'structured-logging',
          label: 'Structured logging',
          defaultPrompt:
            'Use structured logging (JSON) with consistent field names. Include trace IDs, timestamps, and relevant context for every significant operation.',
        },
        {
          id: 'metrics',
          label: 'Metrics / monitoring hooks',
          defaultPrompt:
            'Expose key metrics (latency, throughput, error rate) via a standard format (e.g., Prometheus). Instrument critical paths.',
        },
        {
          id: 'health-check',
          label: 'Health check endpoint',
          defaultPrompt:
            'Provide a /health (or equivalent) endpoint that accurately reflects the readiness and liveness of the service and its dependencies.',
        },
        {
          id: 'alerting',
          label: 'Alerting rules',
          defaultPrompt:
            'Define clear alerting thresholds for error rate spikes, latency degradation, and resource exhaustion. Avoid alert fatigue.',
        },
      ],
      selects: [],
      customPromptPlaceholder: 'Add observability-specific requirements...',
    },
    {
      id: 'quality',
      title: 'Code Quality',
      icon: 'CheckCircle2',
      description: 'Keep the codebase maintainable, tested, and well-documented.',
      checks: [
        {
          id: 'unit-tests',
          label: 'Unit tests',
          defaultPrompt:
            'Write comprehensive unit tests for business logic, edge cases, and error paths. Aim for high coverage on critical modules.',
        },
        {
          id: 'integration-tests',
          label: 'Integration tests',
          defaultPrompt:
            'Include integration tests that verify end-to-end flows and interactions with external services or databases.',
        },
        {
          id: 'inline-docs',
          label: 'Inline documentation',
          defaultPrompt:
            'Document non-obvious logic, public APIs, and architectural decisions. Keep comments close to the code they describe.',
        },
        {
          id: 'existing-patterns',
          label: 'Follow existing patterns',
          defaultPrompt:
            'Match the existing codebase style, patterns, and conventions. Do not introduce new abstractions unless justified.',
        },
      ],
      selects: [
        {
          id: 'test-depth',
          label: 'Test depth',
          options: [
            { value: 'smoke', label: 'Smoke tests only' },
            { value: 'happy-path', label: 'Happy path + key errors' },
            { value: 'good-coverage', label: 'Good coverage (~80%)' },
            { value: 'full-coverage', label: 'Full coverage + property tests' },
          ],
          defaultPromptTemplate:
            'Testing expectation: {{value}}. Write tests accordingly and document any areas intentionally left uncovered.',
        },
      ],
      customPromptPlaceholder: 'Add code-quality-specific requirements...',
    },
    {
      id: 'cost',
      title: 'Cost & Efficiency',
      icon: 'DollarSign',
      description: 'Minimize infrastructure and API spend without sacrificing reliability.',
      checks: [
        {
          id: 'min-infra-cost',
          label: 'Minimize infra cost',
          defaultPrompt:
            'Choose cost-efficient infrastructure. Use serverless or spot instances where appropriate. Avoid over-provisioning.',
        },
        {
          id: 'min-token-usage',
          label: 'Minimize token / API usage',
          defaultPrompt:
            'If using LLM APIs, minimize token usage through prompt compression, caching, and batching. Document cost per request.',
        },
      ],
      selects: [
        {
          id: 'budget-sensitivity',
          label: 'Budget sensitivity',
          options: [
            { value: 'low', label: 'Low — optimize for speed' },
            { value: 'medium', label: 'Medium — balanced' },
            { value: 'high', label: 'High — minimize spend' },
          ],
          defaultPromptTemplate:
            'Budget sensitivity: {{value}}. Make trade-offs accordingly and justify any higher-cost choices.',
        },
      ],
      customPromptPlaceholder: 'Add cost-specific requirements...',
    },
    {
      id: 'data',
      title: 'Data & Privacy',
      icon: 'Database',
      description: 'Handle data responsibly, migrate safely, and ensure recoverability.',
      checks: [
        {
          id: 'pii-minimization',
          label: 'PII minimization',
          defaultPrompt:
            'Minimize collection and retention of personally identifiable information. Anonymize or pseudonymize where possible.',
        },
        {
          id: 'safe-migrations',
          label: 'Safe DB migrations',
          defaultPrompt:
            'Database migrations must be backward-compatible and reversible. Use expand/contract pattern for schema changes.',
        },
        {
          id: 'backup-recovery',
          label: 'Backup / recovery plan',
          defaultPrompt:
            'Ensure data is backed up regularly and recovery procedures are documented and tested. Define RPO and RTO targets.',
        },
      ],
      selects: [],
      customPromptPlaceholder: 'Add data-specific requirements...',
    },
  ],
}
