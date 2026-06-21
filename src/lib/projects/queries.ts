import "server-only"

import { unstable_cache } from "next/cache"

import { prisma } from "@/lib/prisma"
import { parseDetailSections, toUpdatedAt } from "./utils"
import type {
  DocRecord,
  EnvRecord,
  ProjectListItem,
  ProjectSummary,
  ReadmeRecord,
} from "./types"

type Viewer = { id: string; role: string }

/** Cache tag for everything belonging to a single project. */
export function projectTag(slug: string) {
  return `project:${slug}`
}

/** Admins see every project; members only see ones they're assigned to. */
function visibilityWhere(viewer: Viewer) {
  return viewer.role === "ADMIN"
    ? {}
    : { members: { some: { id: viewer.id } } }
}

/**
 * Dashboard list. Selects only scalar columns — no env/doc/readme rows — so the
 * grid of project cards loads fast regardless of how much content each holds.
 */
export async function getProjectList(viewer: Viewer): Promise<ProjectListItem[]> {
  const rows = await prisma.project.findMany({
    where: visibilityWhere(viewer),
    orderBy: { updatedAt: "desc" },
    select: {
      slug: true,
      name: true,
      status: true,
      description: true,
      tags: true,
      updatedAt: true,
    },
  })

  return rows.map((p) => ({
    id: p.slug,
    name: p.name,
    status: p.status,
    description: p.description,
    tags: p.tags,
    updatedAt: toUpdatedAt(p.updatedAt),
  }))
}

/**
 * Detail-page header data: scalar fields, detail sections, and relation counts
 * (cheap aggregates) — but none of the heavy relation rows. Cached per slug and
 * invalidated via `revalidateTag(projectTag(slug))` on any mutation.
 */
export async function getProjectSummary(
  slug: string
): Promise<ProjectSummary | null> {
  return cachedQuery(
    slug,
    "summary",
    async () => {
      const p = await prisma.project.findUnique({
        where: { slug },
        select: {
          id: true,
          slug: true,
          name: true,
          description: true,
          status: true,
          tags: true,
          detailSections: true,
          updatedAt: true,
          _count: { select: { envs: true, docs: true, readmes: true } },
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
        detailSections: parseDetailSections(p.detailSections),
        updatedAt: toUpdatedAt(p.updatedAt),
        counts: {
          envs: p._count.envs,
          docs: p._count.docs,
          readmes: p._count.readmes,
        },
      } satisfies ProjectSummary
    }
  )
}

/** Returns whether `viewer` may view `projectId` (admins always may). */
export async function canViewProject(
  projectId: string,
  viewer: Viewer
): Promise<boolean> {
  if (viewer.role === "ADMIN") return true
  const access = await prisma.project.findFirst({
    where: { id: projectId, members: { some: { id: viewer.id } } },
    select: { id: true },
  })
  return Boolean(access)
}

/* ----------------------- per-tab relation queries ----------------------- */
/* Keyed by slug and cached behind the per-project tag, so switching back to a
   previously-viewed tab is served from cache (no DB round trip). */

export async function getProjectEnvs(slug: string): Promise<EnvRecord[]> {
  return cachedQuery(slug, "envs", async () => {
    const rows = await prisma.envVar.findMany({
      where: { project: { slug } },
      orderBy: { key: "asc" },
    })
    return rows.map((e) => ({
      id: e.id,
      key: e.key,
      value: e.value,
      scope: e.scope,
      component: e.component,
    }))
  })
}

export async function getProjectDocs(slug: string): Promise<DocRecord[]> {
  return cachedQuery(slug, "docs", async () => {
    const rows = await prisma.doc.findMany({
      where: { project: { slug } },
      orderBy: { title: "asc" },
    })
    return rows.map((d) => ({
      id: d.id,
      title: d.title,
      description: d.description,
      component: d.component,
      updatedAt: toUpdatedAt(d.updatedAt),
    }))
  })
}

export async function getProjectReadmes(slug: string): Promise<ReadmeRecord[]> {
  return cachedQuery(slug, "readmes", async () => {
    const rows = await prisma.readme.findMany({
      where: { project: { slug } },
      orderBy: { title: "asc" },
    })
    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      content: r.content,
      component: r.component,
    }))
  })
}

/**
 * Wrap a per-project query in the Next Data Cache, keyed by slug + section and
 * tagged so a single `revalidateTag(projectTag(slug))` clears all of a project's
 * cached reads. A 60s `revalidate` acts as a safety net.
 */
function cachedQuery<T>(
  slug: string,
  section: string,
  query: () => Promise<T>
): Promise<T> {
  return unstable_cache(query, ["project", section, slug], {
    tags: [projectTag(slug)],
    revalidate: 60,
  })()
}
