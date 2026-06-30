-- CreateTable
CREATE TABLE "ArrayStorage" (
    "id" BLOB NOT NULL PRIMARY KEY,
    "userId" BLOB NOT NULL,
    "items" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
