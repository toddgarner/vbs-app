/*
  Warnings:

  - Added the required column `emergencyContactId` to the `Child` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tshirtSize` to the `Child` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "EmergencyContact" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Child" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "grade" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "medical" TEXT NOT NULL,
    "qrcode" TEXT NOT NULL,
    "picPermission" BOOLEAN NOT NULL DEFAULT true,
    "tshirtSize" TEXT NOT NULL,
    "transportation" BOOLEAN NOT NULL DEFAULT false,
    "emergencyContactId" INTEGER NOT NULL,
    "checkedIn" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Child_emergencyContactId_fkey" FOREIGN KEY ("emergencyContactId") REFERENCES "EmergencyContact" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Child_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Child" ("age", "checkedIn", "createdAt", "grade", "id", "medical", "name", "qrcode", "updatedAt", "userId") SELECT "age", "checkedIn", "createdAt", "grade", "id", "medical", "name", "qrcode", "updatedAt", "userId" FROM "Child";
DROP TABLE "Child";
ALTER TABLE "new_Child" RENAME TO "Child";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
