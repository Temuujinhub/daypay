-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('user', 'lender_admin', 'super_admin', 'mlro');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "lender_id" UUID,
ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'user';
