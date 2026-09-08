import { createMcpHandler, withMcpAuth } from "mcp-handler"
import { z } from "zod"

import { verifyMcpToken, viewerFromAuthInfo } from "@/lib/mcp/auth"
import {
  canViewProject,
  getProjectList,
  getProjectMembers,
  getProjectSummary,
  searchProjects,
} from "@/lib/projects/queries"

const listProjectsSchema: z.ZodRawShape = {
  archived: z
    .boolean()
    .optional()
    .describe("Include archived projects instead of active ones. Defaults to false."),
}

const getProjectSchema: z.ZodRawShape = {
  slug: z.string().describe("The project's slug (its `id` field from list_projects/search_projects)."),
}

const searchProjectsSchema: z.ZodRawShape = {
  query: z.string().optional().describe("Free-text match against project name/description."),
  status: z
    .enum(["Production", "Staging", "Development"])
    .optional()
    .describe("Filter by deploy status."),
  tag: z.string().optional().describe("Filter to projects carrying this exact tag."),
  archived: z
    .boolean()
    .optional()
    .describe("Include archived projects instead of active ones. Defaults to false."),
}

const getProjectMembersSchema: z.ZodRawShape = {
  slug: z.string().describe("The project's slug (its `id` field from list_projects/search_projects)."),
}

type ListProjectsArgs = { archived?: boolean }
type GetProjectArgs = { slug: string }
type SearchProjectsArgs = {
  query?: string
  status?: "Production" | "Staging" | "Development"
  tag?: string
  archived?: boolean
}

const handler = createMcpHandler(
  (server) => {
    server.registerTool(
      "list_projects",
      {
        title: "List projects",
        description:
          "List projects visible to the authenticated user. Admins see all projects; members see only projects they're assigned to.",
        inputSchema: listProjectsSchema,
      },
      async (args, extra) => {
        const { archived } = args as ListProjectsArgs
        const viewer = viewerFromAuthInfo(extra.authInfo)
        const projects = await getProjectList(viewer, { archived })
        return { content: [{ type: "text", text: JSON.stringify(projects, null, 2) }] }
      }
    )

    server.registerTool(
      "get_project",
      {
        title: "Get project",
        description:
          "Get a single project's summary (description, status, tags, detail sections, and relation counts) by slug. Never includes secrets.",
        inputSchema: getProjectSchema,
      },
      async (args, extra) => {
        const { slug } = args as GetProjectArgs
        const viewer = viewerFromAuthInfo(extra.authInfo)
        const summary = await getProjectSummary(slug)
        if (!summary || !(await canViewProject(summary.id, viewer))) {
          return {
            content: [{ type: "text", text: `No project found with slug "${slug}".` }],
            isError: true,
          }
        }
        return { content: [{ type: "text", text: JSON.stringify(summary, null, 2) }] }
      }
    )

    server.registerTool(
      "search_projects",
      {
        title: "Search projects",
        description:
          "Search projects visible to the authenticated user by free-text (matches name/description), and optionally filter by status or tag.",
        inputSchema: searchProjectsSchema,
      },
      async (args, extra) => {
        const { query, status, tag, archived } = args as SearchProjectsArgs
        const viewer = viewerFromAuthInfo(extra.authInfo)
        const projects = await searchProjects(viewer, { query, status, tag, archived })
        return { content: [{ type: "text", text: JSON.stringify(projects, null, 2) }] }
      }
    )

    server.registerTool(
      "get_project_members",
      {
        title: "Get project members",
        description: "List the members with access to a project, by slug.",
        inputSchema: getProjectMembersSchema,
      },
      async (args, extra) => {
        const { slug } = args as GetProjectArgs
        const viewer = viewerFromAuthInfo(extra.authInfo)
        const summary = await getProjectSummary(slug)
        if (!summary || !(await canViewProject(summary.id, viewer))) {
          return {
            content: [{ type: "text", text: `No project found with slug "${slug}".` }],
            isError: true,
          }
        }
        const members = await getProjectMembers(slug)
        return { content: [{ type: "text", text: JSON.stringify(members, null, 2) }] }
      }
    )
  },
  {
    serverInfo: { name: "devminified-project-hub", version: "0.1.0" },
  },
  { basePath: "/api" }
)

const authHandler = withMcpAuth(handler, verifyMcpToken, {
  required: true,
  resourceUrl: process.env.MCP_RESOURCE_URL,
})

export { authHandler as GET, authHandler as POST, authHandler as DELETE }
