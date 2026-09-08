import "dotenv/config"
import { randomBytes, createHash } from "node:crypto"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../src/generated/prisma/client"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

/**
 * Mints a personal access token for MCP/API use. No settings-page UI exists
 * yet for this, so it's a one-off CLI until that's built.
 *
 * Usage: tsx scripts/create-api-token.ts <email> [token-name]
 */
async function main() {
  const [email, name = "MCP token"] = process.argv.slice(2)
  if (!email) {
    console.error("Usage: tsx scripts/create-api-token.ts <email> [token-name]")
    process.exit(1)
  }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    console.error(`No user found with email "${email}".`)
    process.exit(1)
  }

  const token = randomBytes(32).toString("base64url")
  const tokenHash = createHash("sha256").update(token).digest("hex")

  await prisma.apiToken.create({
    data: { userId: user.id, name, tokenHash },
  })

  console.log(`Token for ${email} (${name}) — shown once, not recoverable:\n`)
  console.log(token)
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
