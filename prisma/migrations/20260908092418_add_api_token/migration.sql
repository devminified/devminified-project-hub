-- CreateEnum
CREATE TYPE "TabFeature" AS ENUM ('DOC', 'ENV', 'ENV_SCOPE', 'README');

-- AlterTable
ALTER TABLE "Doc" ADD COLUMN     "fileType" TEXT,
ADD COLUMN     "fileUrl" TEXT,
ADD COLUMN     "tabId" TEXT;

-- AlterTable
ALTER TABLE "EnvVar" ADD COLUMN     "scopeTabId" TEXT,
ADD COLUMN     "tabId" TEXT;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "archived" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Readme" ADD COLUMN     "fileType" TEXT,
ADD COLUMN     "fileUrl" TEXT,
ADD COLUMN     "tabId" TEXT;

-- CreateTable
CREATE TABLE "ApiToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "lastUsedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),

    CONSTRAINT "ApiToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectTab" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "feature" "TabFeature" NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectTab_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ApiToken_tokenHash_key" ON "ApiToken"("tokenHash");

-- CreateIndex
CREATE INDEX "ApiToken_userId_idx" ON "ApiToken"("userId");

-- CreateIndex
CREATE INDEX "ProjectTab_projectId_feature_idx" ON "ProjectTab"("projectId", "feature");

-- CreateIndex
CREATE INDEX "Doc_tabId_idx" ON "Doc"("tabId");

-- CreateIndex
CREATE INDEX "EnvVar_tabId_idx" ON "EnvVar"("tabId");

-- CreateIndex
CREATE INDEX "EnvVar_scopeTabId_idx" ON "EnvVar"("scopeTabId");

-- CreateIndex
CREATE INDEX "Readme_tabId_idx" ON "Readme"("tabId");

-- AddForeignKey
ALTER TABLE "ApiToken" ADD CONSTRAINT "ApiToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectTab" ADD CONSTRAINT "ProjectTab_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnvVar" ADD CONSTRAINT "EnvVar_tabId_fkey" FOREIGN KEY ("tabId") REFERENCES "ProjectTab"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnvVar" ADD CONSTRAINT "EnvVar_scopeTabId_fkey" FOREIGN KEY ("scopeTabId") REFERENCES "ProjectTab"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Doc" ADD CONSTRAINT "Doc_tabId_fkey" FOREIGN KEY ("tabId") REFERENCES "ProjectTab"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Readme" ADD CONSTRAINT "Readme_tabId_fkey" FOREIGN KEY ("tabId") REFERENCES "ProjectTab"("id") ON DELETE SET NULL ON UPDATE CASCADE;
