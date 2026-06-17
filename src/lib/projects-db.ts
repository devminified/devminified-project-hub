import { prisma } from "@/lib/prisma"
import type { Project } from "@/lib/projects"

function toUpdatedAt(date: Date): string {
  return date.toISOString().slice(0, 10)
}

/**
 * DB-backed equivalents of getProjects / getProject in `projects.ts`.
 * They return the same `Project` shape the UI already consumes, so pages
 * can switch from the mock data to these by swapping the import once the
 * Supabase database has been migrated and seeded.
 */
export async function getProjectsFromDb(viewer: {
  id: string
  role: string
}): Promise<Project[]> {
  // Admins see every project; members only see projects they're assigned to.
  const where =
    viewer.role === "ADMIN" ? {} : { members: { some: { id: viewer.id } } }
  const rows = await prisma.project.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    include: { envs: true, docs: true, readmes: true },
  })

  return rows.map((p) => ({
    id: p.slug,
    name: p.name,
    description: p.description,
    status: p.status,
    tags: p.tags,
    updatedAt: toUpdatedAt(p.updatedAt),
    envs: p.envs.map((e) => ({ key: e.key, value: e.value, scope: e.scope })),
    docs: p.docs.map((d) => ({
      title: d.title,
      description: d.description,
      updatedAt: toUpdatedAt(d.updatedAt),
    })),
    readmes: p.readmes.map((r) => ({ title: r.title, content: r.content })),
  }))
}

export type Component = "FRONTEND" | "BACKEND" | "DB"

export type EnvRecord = {
  id: string
  key: string
  value: string
  scope: "Production" | "Preview" | "Development"
  component: Component | null
}
export type DocRecord = {
  id: string
  title: string
  description: string
  component: Component | null
  updatedAt: string
}
export type ReadmeRecord = {
  id: string
  title: string
  content: string
  component: Component | null
}

export type ProjectDetail = {
  id: string // database id
  slug: string
  name: string
  description: string
  status: "Production" | "Staging" | "Development"
  tags: string[]
  productionUrl: string | null
  stagingUrl: string | null
  updatedAt: string
  envs: EnvRecord[]
  docs: DocRecord[]
  readmes: ReadmeRecord[]
}

/** Full project including database ids — used by the editable workspace. */
export async function getProjectDetail(
  slug: string
): Promise<ProjectDetail | null> {
  const p = await prisma.project.findUnique({
    where: { slug },
    include: {
      envs: { orderBy: { key: "asc" } },
      docs: { orderBy: { title: "asc" } },
      readmes: { orderBy: { title: "asc" } },
    },
  })
  if (!p) return null

  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    description: p.description,
    status: p.status,
    tags: p.tags,
    productionUrl: p.productionUrl,
    stagingUrl: p.stagingUrl,
    updatedAt: toUpdatedAt(p.updatedAt),
    envs: p.envs.map((e) => ({
      id: e.id,
      key: e.key,
      value: e.value,
      scope: e.scope,
      component: e.component,
    })),
    docs: p.docs.map((d) => ({
      id: d.id,
      title: d.title,
      description: d.description,
      component: d.component,
      updatedAt: toUpdatedAt(d.updatedAt),
    })),
    readmes: p.readmes.map((r) => ({
      id: r.id,
      title: r.title,
      content: r.content,
      component: r.component,
    })),
  }
}

export async function getProjectFromDb(slug: string): Promise<Project | null> {
  const p = await prisma.project.findUnique({
    where: { slug },
    include: { envs: true, docs: true, readmes: true },
  })
  if (!p) return null

  return {
    id: p.slug,
    name: p.name,
    description: p.description,
    status: p.status,
    tags: p.tags,
    updatedAt: toUpdatedAt(p.updatedAt),
    envs: p.envs.map((e) => ({ key: e.key, value: e.value, scope: e.scope })),
    docs: p.docs.map((d) => ({
      title: d.title,
      description: d.description,
      updatedAt: toUpdatedAt(d.updatedAt),
    })),
    readmes: p.readmes.map((r) => ({ title: r.title, content: r.content })),
  }
}
