// Local-only demo data for visual verification. Not part of the deliverable.
import "dotenv/config"
import bcrypt from "bcryptjs"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../src/generated/prisma/client"

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) })

const projects = [
  { slug: "onlinecook", name: "OnlineCook", description: "Recipe marketplace and meal-planning platform with a Next.js storefront and a NestJS API.", status: "Production", tags: ["nextjs", "nestjs", "postgres"], archived: false },
  { slug: "shopcash", name: "ShopCash", description: "Cashback and rewards engine powering partner checkout flows across three regions.", status: "Production", tags: ["react", "stripe", "lambda"], archived: false },
  { slug: "workadventure", name: "WorkAdventure", description: "Virtual office spaces with real-time presence, spatial audio, and map editing.", status: "Staging", tags: ["websockets", "docker", "phaser"], archived: false },
  { slug: "fleetview", name: "FleetView", description: "Telemetry dashboard for logistics fleets — live maps, alerting, and route replay.", status: "Development", tags: ["mapbox", "timescale"], archived: false },
  { slug: "atlas-billing", name: "Atlas Billing", description: "Usage-metered billing service with invoicing, dunning, and revenue reporting.", status: "Staging", tags: ["go", "kafka"], archived: false },
  { slug: "pulse-crm", name: "Pulse CRM", description: "Lightweight CRM for small agencies: pipelines, notes, and email sync.", status: "Development", tags: ["remix", "prisma"], archived: false },
  { slug: "legacy-portal", name: "Legacy Portal", description: "Retired customer portal kept for historical reference and audit exports.", status: "Development", tags: ["php", "legacy"], archived: true },
  { slug: "beta-labs", name: "Beta Labs", description: "Sunset experimentation sandbox — archived after the platform consolidation.", status: "Development", tags: ["experiment"], archived: true },
]

const people = [
  { email: "sara@devminified.com", name: "Sara Ahmed", role: "USER", status: "APPROVED" },
  { email: "omar@devminified.com", name: "Omar Khan", role: "USER", status: "APPROVED" },
  { email: "lina@devminified.com", name: "Lina Farouk", role: "ADMIN", status: "APPROVED" },
  { email: "peter@devminified.com", name: "Peter Novak", role: "USER", status: "PENDING" },
  { email: "yuki@devminified.com", name: "Yuki Tanaka", role: "USER", status: "APPROVED" },
]

async function main() {
  const hash = await bcrypt.hash("Devminified@786_", 10)
  for (const p of people) {
    await prisma.user.upsert({
      where: { email: p.email },
      update: { name: p.name, role: p.role as never, status: p.status as never },
      create: { ...p, passwordHash: hash } as never,
    })
  }

  for (const p of projects) {
    const project = await prisma.project.upsert({
      where: { slug: p.slug },
      update: { ...p, status: p.status as never },
      create: {
        ...p,
        status: p.status as never,
        detailSections: [
          { heading: "Environments", links: [{ label: "Production", url: `https://${p.slug}.example.com` }, { label: "Staging", url: `https://staging.${p.slug}.example.com` }] },
          { heading: "Repositories", links: [{ label: "Web", url: `https://github.com/devminified/${p.slug}-web` }, { label: "API", url: `https://github.com/devminified/${p.slug}-api` }] },
        ],
        secretSections: [{ heading: "Ops", links: [{ label: "Grafana", url: "https://grafana.example.com" }] }],
      },
    })

    const existing = await prisma.projectTab.count({ where: { projectId: project.id } })
    if (existing > 0) continue

    const mk = async (feature: string, names: string[]) =>
      Promise.all(names.map((name, order) =>
        prisma.projectTab.create({ data: { projectId: project.id, feature: feature as never, name, order } })))

    const envTabs = await mk("ENV", ["Frontend", "Backend", "Database"])
    const scopeTabs = await mk("ENV_SCOPE", ["Production", "Preview", "Development"])
    const docTabs = await mk("DOC", ["Architecture", "Runbooks", "Onboarding"])
    const readmeTabs = await mk("README", ["Frontend", "Backend"])

    await prisma.envVar.createMany({
      data: [
        { key: "NEXT_PUBLIC_API_URL", value: `https://api.${p.slug}.example.com`, projectId: project.id, tabId: envTabs[0].id, scopeTabId: scopeTabs[0].id },
        { key: "NEXT_PUBLIC_SENTRY_DSN", value: "https://abc123@o1.ingest.sentry.io/42", projectId: project.id, tabId: envTabs[0].id, scopeTabId: scopeTabs[0].id },
        { key: "DATABASE_URL", value: "postgresql://user:pass@db.internal:5432/app", projectId: project.id, tabId: envTabs[2].id, scopeTabId: scopeTabs[0].id },
        { key: "REDIS_URL", value: "redis://cache.internal:6379", projectId: project.id, tabId: envTabs[1].id, scopeTabId: scopeTabs[1].id },
        { key: "JWT_SECRET", value: "s3cr3t-rotate-me", projectId: project.id, tabId: envTabs[1].id, scopeTabId: scopeTabs[2].id },
      ],
    })
    await prisma.doc.createMany({
      data: [
        { title: "System architecture", description: "Service topology, data flow, and the failure domains we care about.", projectId: project.id, tabId: docTabs[0].id },
        { title: "Incident runbook", description: "First 15 minutes of a production incident: who to page and what to check.", projectId: project.id, tabId: docTabs[1].id },
        { title: "Day-one setup", description: "Local environment, seed data, and the accounts you need before you start.", projectId: project.id, tabId: docTabs[2].id },
      ],
    })
    await prisma.readme.createMany({
      data: [
        { title: "Web app", content: `# ${p.name} web\n\nNext.js app router front end.\n\n## Getting started\n\n\`\`\`bash\nnpm install\nnpm run dev\n\`\`\`\n\n- Node 22+\n- Postgres 16\n\n> Ask in #${p.slug} if the seed script fails.`, projectId: project.id, tabId: readmeTabs[0].id },
        { title: "API", content: `# ${p.name} API\n\nNestJS service exposing REST + a thin GraphQL gateway.\n\n| Env | URL |\n| --- | --- |\n| prod | https://api.${p.slug}.example.com |\n| stage | https://api.staging.${p.slug}.example.com |`, projectId: project.id, tabId: readmeTabs[1].id },
      ],
    })
  }

  // Give every non-admin access to the first four projects.
  const members = await prisma.user.findMany({ where: { role: "USER" } })
  const visible = await prisma.project.findMany({ where: { archived: false }, take: 4 })
  for (const u of members) {
    await prisma.user.update({ where: { id: u.id }, data: { projects: { set: visible.map((v) => ({ id: v.id })) } } })
  }
  console.log("✓ fixtures loaded")
}

main().finally(() => prisma.$disconnect())
