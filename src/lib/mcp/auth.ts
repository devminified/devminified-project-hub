import "server-only"
import { createHash } from "node:crypto"

import type { AuthInfo } from "@modelcontextprotocol/sdk/server/auth/types.js"
import { prisma } from "@/lib/prisma"

export type McpViewer = { id: string; email: string; role: string }

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex")
}

/**
 * Verifies a personal access token for `withMcpAuth`. The resolved viewer
 * (mirrors the cookie-session shape used by `dal.ts`/`queries.ts`) is stashed
 * in `AuthInfo.extra` so tool handlers can read it off `extra.authInfo`.
 */
export async function verifyMcpToken(
  _req: Request,
  bearerToken?: string
): Promise<AuthInfo | undefined> {
  if (!bearerToken) return undefined

  const tokenHash = hashToken(bearerToken)
  const apiToken = await prisma.apiToken.findUnique({
    where: { tokenHash },
    select: {
      id: true,
      revokedAt: true,
      user: { select: { id: true, email: true, role: true } },
    },
  })
  if (!apiToken || apiToken.revokedAt) return undefined

  // Best-effort — a slow/failed write here shouldn't fail the request.
  void prisma.apiToken
    .update({ where: { id: apiToken.id }, data: { lastUsedAt: new Date() } })
    .catch(() => {})

  const viewer: McpViewer = apiToken.user
  return {
    token: bearerToken,
    clientId: viewer.id,
    scopes: [viewer.role === "ADMIN" ? "admin" : "member"],
    extra: { viewer },
  }
}

export function viewerFromAuthInfo(authInfo: AuthInfo | undefined): McpViewer {
  const viewer = authInfo?.extra?.viewer as McpViewer | undefined
  if (!viewer) throw new Error("Unauthorized: no valid access token.")
  return viewer
}
