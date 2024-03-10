/*
  Warnings:

  - Added the required column `photoUrl` to the `Child` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Child" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "grade" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "medical" TEXT NOT NULL,
    "qrcode" TEXT NOT NULL,
    "photoUrl" TEXT NOT NULL,
    "picPermission" BOOLEAN NOT NULL DEFAULT true,
    "tshirtSize" TEXT NOT NULL,
    "transportation" BOOLEAN NOT NULL DEFAULT false,
    "emergencyContactName" TEXT NOT NULL,
    "emergencyContactPhone" TEXT NOT NULL,
    "checkedIn" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Child_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Child" ("age", "checkedIn", "createdAt", "emergencyContactName", "emergencyContactPhone", "grade", "id", "medical", "name", "picPermission", "qrcode", "transportation", "tshirtSize", "updatedAt", "userId") SELECT "age", "checkedIn", "createdAt", "emergencyContactName", "emergencyContactPhone", "grade", "id", "medical", "name", "picPermission", "qrcode", "transportation", "tshirtSize", "updatedAt", "userId" FROM "Child";
DROP TABLE "Child";
ALTER TABLE "new_Child" RENAME TO "Child";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
