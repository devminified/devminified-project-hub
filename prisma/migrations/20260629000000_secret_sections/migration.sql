-- Admin-only secret sections, mirroring the shape of detailSections.
ALTER TABLE "Project" ADD COLUMN "secretSections" JSONB NOT NULL DEFAULT '[]';
