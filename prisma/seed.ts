import "dotenv/config"
import bcrypt from "bcryptjs"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "../src/generated/prisma/client"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

const ADMIN_EMAIL = "abdullah@devminified.com"
const ADMIN_PASSWORD = "Devminified@786_"

async function seedAdmin() {
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10)
  await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: { passwordHash, role: "ADMIN", name: "Abdullah" },
    create: {
      email: ADMIN_EMAIL,
      name: "Abdullah",
      passwordHash,
      role: "ADMIN",
    },
  })
  console.log(`✓ Seeded admin user ${ADMIN_EMAIL}`)
}

async function seedProject() {
  // Start clean: a single empty project to fill in from the UI.
  await prisma.project.deleteMany({})
  await prisma.project.create({
    data: {
      slug: "onlinecook",
      name: "OnlineCook",
      description: "",
      status: "Development",
      tags: [],
    },
  })
  console.log("✓ Seeded empty project OnlineCook")
}

async function main() {
  await seedAdmin()
  await seedProject()
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
