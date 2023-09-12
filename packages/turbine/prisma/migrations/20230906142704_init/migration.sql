-- CreateTable
CREATE TABLE "Container" (
    "name" TEXT NOT NULL PRIMARY KEY,
    "loadDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "loadedProductType" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Maintenance" (
    "name" TEXT NOT NULL PRIMARY KEY,
    "duration" INTEGER NOT NULL,
    "operationDate" DATETIME
);

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "skeleton" TEXT NOT NULL,
    "modificationDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isPremade" BOOLEAN NOT NULL DEFAULT false
);

-- CreateTable
CREATE TABLE "ProfileValue" (
    "profileId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" INTEGER NOT NULL,
    CONSTRAINT "ProfileValue_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Container_name_key" ON "Container"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Maintenance_name_key" ON "Maintenance"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_id_key" ON "Profile"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ProfileValue_profileId_key_key" ON "ProfileValue"("profileId", "key");
