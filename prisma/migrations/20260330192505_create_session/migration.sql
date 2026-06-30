-- CreateTable
CREATE TABLE "Session" (
    "id" BLOB NOT NULL PRIMARY KEY,
    "userId" BLOB NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
