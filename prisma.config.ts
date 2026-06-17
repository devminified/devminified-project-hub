import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  // Prisma Migrate / Studio / CLI use the session-mode pooler (no pgbouncer).
  // The app's runtime client uses the transaction pooler via the pg adapter.
  datasource: {
    url: env("DIRECT_URL"),
  },
});
