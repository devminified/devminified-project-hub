-- CreateEnum
CREATE TYPE "Component" AS ENUM ('FRONTEND', 'BACKEND', 'DB');

-- AlterTable
ALTER TABLE "Doc" ADD COLUMN     "component" "Component";

-- AlterTable
ALTER TABLE "EnvVar" ADD COLUMN     "component" "Component";

-- AlterTable
ALTER TABLE "Readme" ADD COLUMN     "component" "Component";
