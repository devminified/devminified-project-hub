export type ProjectStatus = "Production" | "Staging" | "Development"

export type EnvVar = {
  key: string
  value: string
  scope: "Production" | "Preview" | "Development"
}

export type Doc = {
  title: string
  description: string
  updatedAt: string
}

export type Readme = {
  title: string
  content: string
}

export type Project = {
  id: string
  name: string
  description: string
  status: ProjectStatus
  tags: string[]
  updatedAt: string
  envs: EnvVar[]
  docs: Doc[]
  readmes: Readme[]
}

export const projects: Project[] = [
  {
    id: "atlas-web",
    name: "Atlas Web",
    description: "Customer-facing marketing site and dashboard built on Next.js.",
    status: "Production",
    tags: ["Next.js", "TypeScript", "Vercel"],
    updatedAt: "2026-06-12",
    envs: [
      { key: "DATABASE_URL", value: "postgres://••••••@db.atlas/app", scope: "Production" },
      { key: "NEXT_PUBLIC_API_URL", value: "https://api.atlas.dev", scope: "Production" },
      { key: "STRIPE_SECRET_KEY", value: "sk_live_••••••••", scope: "Production" },
      { key: "NEXT_PUBLIC_API_URL", value: "http://localhost:3001", scope: "Development" },
    ],
    docs: [
      { title: "Architecture Overview", description: "High-level system design and data flow.", updatedAt: "2026-05-30" },
      { title: "Deployment Runbook", description: "Steps to ship a release and roll back safely.", updatedAt: "2026-06-09" },
      { title: "API Reference", description: "REST endpoints, auth, and rate limits.", updatedAt: "2026-06-01" },
    ],
    readmes: [
      {
        title: "README.md",
        content:
          "# Atlas Web\n\nThe primary customer surface for Atlas.\n\n## Getting Started\n\n```bash\nnpm install\nnpm run dev\n```\n\nOpen http://localhost:3000 to view the app.",
      },
      {
        title: "CONTRIBUTING.md",
        content:
          "# Contributing\n\n1. Branch from `main`.\n2. Keep PRs focused and under 400 lines.\n3. All checks must pass before merge.",
      },
    ],
  },
  {
    id: "orbit-api",
    name: "Orbit API",
    description: "Core GraphQL gateway powering all internal services.",
    status: "Production",
    tags: ["Node.js", "GraphQL", "AWS"],
    updatedAt: "2026-06-14",
    envs: [
      { key: "REDIS_URL", value: "redis://••••••@cache.orbit", scope: "Production" },
      { key: "JWT_SECRET", value: "••••••••••••", scope: "Production" },
      { key: "LOG_LEVEL", value: "debug", scope: "Development" },
    ],
    docs: [
      { title: "Schema Design", description: "Conventions for types, queries, and mutations.", updatedAt: "2026-06-02" },
      { title: "Auth Flow", description: "Token issuance, refresh, and revocation.", updatedAt: "2026-05-21" },
    ],
    readmes: [
      {
        title: "README.md",
        content:
          "# Orbit API\n\nGraphQL gateway for the platform.\n\n## Run locally\n\n```bash\nnpm run dev:api\n```",
      },
    ],
  },
  {
    id: "pulse-mobile",
    name: "Pulse Mobile",
    description: "Cross-platform mobile companion app for on-the-go users.",
    status: "Staging",
    tags: ["React Native", "Expo"],
    updatedAt: "2026-06-10",
    envs: [
      { key: "EXPO_PUBLIC_API_URL", value: "https://staging.api.pulse", scope: "Preview" },
      { key: "SENTRY_DSN", value: "https://••••@sentry.io/pulse", scope: "Preview" },
    ],
    docs: [
      { title: "Release Checklist", description: "App store submission and review notes.", updatedAt: "2026-06-05" },
    ],
    readmes: [
      {
        title: "README.md",
        content: "# Pulse Mobile\n\nExpo-based mobile client.\n\n```bash\nnpx expo start\n```",
      },
    ],
  },
  {
    id: "ledger-core",
    name: "Ledger Core",
    description: "Double-entry accounting engine and financial reconciliation.",
    status: "Development",
    tags: ["Rust", "Postgres"],
    updatedAt: "2026-06-15",
    envs: [
      { key: "DATABASE_URL", value: "postgres://••••••@db.ledger", scope: "Development" },
      { key: "RUST_LOG", value: "info", scope: "Development" },
    ],
    docs: [
      { title: "Ledger Invariants", description: "Rules that must always hold for balances.", updatedAt: "2026-06-13" },
      { title: "Migration Guide", description: "Schema versioning and zero-downtime migrations.", updatedAt: "2026-06-11" },
    ],
    readmes: [
      {
        title: "README.md",
        content: "# Ledger Core\n\nThe accounting engine.\n\n```bash\ncargo run\n```",
      },
    ],
  },
  {
    id: "signal-analytics",
    name: "Signal Analytics",
    description: "Real-time event pipeline and product analytics dashboards.",
    status: "Staging",
    tags: ["Python", "Kafka", "ClickHouse"],
    updatedAt: "2026-06-08",
    envs: [
      { key: "KAFKA_BROKERS", value: "kafka-1:9092,kafka-2:9092", scope: "Preview" },
      { key: "CLICKHOUSE_URL", value: "https://••••@clickhouse.signal", scope: "Preview" },
    ],
    docs: [
      { title: "Event Taxonomy", description: "Naming and structure for tracked events.", updatedAt: "2026-05-28" },
    ],
    readmes: [
      {
        title: "README.md",
        content: "# Signal Analytics\n\nEvent pipeline.\n\n```bash\nmake dev\n```",
      },
    ],
  },
  {
    id: "forge-ci",
    name: "Forge CI",
    description: "Internal continuous-integration runners and build cache.",
    status: "Production",
    tags: ["Go", "Docker", "Kubernetes"],
    updatedAt: "2026-06-13",
    envs: [
      { key: "REGISTRY_URL", value: "registry.forge.internal", scope: "Production" },
      { key: "CACHE_BUCKET", value: "s3://forge-build-cache", scope: "Production" },
    ],
    docs: [
      { title: "Runner Setup", description: "Provisioning self-hosted build runners.", updatedAt: "2026-06-04" },
    ],
    readmes: [
      {
        title: "README.md",
        content: "# Forge CI\n\nBuild infrastructure.\n\n```bash\ngo run ./cmd/forge\n```",
      },
    ],
  },
]

export function getProjects(): Project[] {
  return projects
}

export function getProject(id: string): Project | undefined {
  return projects.find((p) => p.id === id)
}
