-- CreateTable
CREATE TABLE "CallToAction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "api_endpoint" TEXT,
    "api_method" TEXT,
    "api_body" TEXT,
    "ui_endpoint" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "CallToAction_id_key" ON "CallToAction"("id");
