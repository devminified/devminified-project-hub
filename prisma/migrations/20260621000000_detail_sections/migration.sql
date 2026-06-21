-- Add the new dynamic detail sections column.
ALTER TABLE "Project" ADD COLUMN "detailSections" JSONB NOT NULL DEFAULT '[]';

-- Backfill: fold any existing production/staging URLs into a single "URLs" section
-- so no data is lost when the fixed columns are dropped.
UPDATE "Project"
SET "detailSections" = jsonb_build_array(
  jsonb_build_object(
    'heading', 'URLs',
    'links', (
      SELECT jsonb_agg(link)
      FROM (
        SELECT jsonb_build_object('label', 'Production', 'url', "productionUrl") AS link
        WHERE "productionUrl" IS NOT NULL AND "productionUrl" <> ''
        UNION ALL
        SELECT jsonb_build_object('label', 'Staging', 'url', "stagingUrl") AS link
        WHERE "stagingUrl" IS NOT NULL AND "stagingUrl" <> ''
      ) AS links
    )
  )
)
WHERE ("productionUrl" IS NOT NULL AND "productionUrl" <> '')
   OR ("stagingUrl" IS NOT NULL AND "stagingUrl" <> '');

-- Drop the now-replaced fixed URL columns.
ALTER TABLE "Project" DROP COLUMN "productionUrl";
ALTER TABLE "Project" DROP COLUMN "stagingUrl";
