/*
  Warnings:

  - You are about to alter the column `value` on the `ProfileValue` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Float`.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ProfileValue" (
    "profileId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" REAL NOT NULL,
    CONSTRAINT "ProfileValue_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ProfileValue" ("key", "profileId", "value") SELECT "key", "profileId", "value" FROM "ProfileValue";
DROP TABLE "ProfileValue";
ALTER TABLE "new_ProfileValue" RENAME TO "ProfileValue";
CREATE UNIQUE INDEX "ProfileValue_profileId_key_key" ON "ProfileValue"("profileId", "key");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
