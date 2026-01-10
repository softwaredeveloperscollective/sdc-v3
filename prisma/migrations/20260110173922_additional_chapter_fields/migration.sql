/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Chapter` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Chapter" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Chapter" ADD COLUMN     "discordUrl" STRING;
ALTER TABLE "Chapter" ADD COLUMN     "isActive" BOOL NOT NULL DEFAULT true;
ALTER TABLE "Chapter" ADD COLUMN     "location" STRING;
ALTER TABLE "Chapter" ADD COLUMN     "meetupUrl" STRING;
ALTER TABLE "Chapter" ADD COLUMN     "slug" STRING;
ALTER TABLE "Chapter" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Data migration: Generate slugs for existing chapters
UPDATE "Chapter" 
SET "slug" = LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE("name", ' ', '-'), '&', 'and'), ',', ''), '.', ''), '''', ''))
WHERE "slug" IS NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Chapter_slug_key" ON "Chapter"("slug");
