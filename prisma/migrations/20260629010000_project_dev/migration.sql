-- Per-project "dev" role grants. Additive: a new join table, no data migration.
CREATE TABLE "ProjectDev" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProjectDev_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ProjectDev_userId_projectId_key" ON "ProjectDev"("userId", "projectId");
CREATE INDEX "ProjectDev_projectId_idx" ON "ProjectDev"("projectId");
CREATE INDEX "ProjectDev_userId_idx" ON "ProjectDev"("userId");

ALTER TABLE "ProjectDev" ADD CONSTRAINT "ProjectDev_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProjectDev" ADD CONSTRAINT "ProjectDev_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
