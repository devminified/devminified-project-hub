-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('PENDING', 'APPROVED');

-- AlterTable: existing users are treated as already approved.
ALTER TABLE "User" ADD COLUMN "status" "UserStatus" NOT NULL DEFAULT 'APPROVED';
