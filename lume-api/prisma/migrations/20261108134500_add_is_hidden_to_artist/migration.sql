-- AlterTable
ALTER TABLE "artist_profiles" ADD COLUMN IF NOT EXISTS "isHidden" BOOLEAN NOT NULL DEFAULT false;

