/*
  Warnings:

  - You are about to drop the `EmergencyContact` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `emergencyContactId` on the `Child` table. All the data in the column will be lost.
  - Added the required column `emergencyContactName` to the `Child` table without a default value. This is not possible if the table is not empty.
  - Added the required column `emergencyContactPhone` to the `Child` table without a default value. This is not possible if the table is not empty.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "EmergencyContact";
PRAGMA foreign_keys=on;

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
    "emergencyContactName" TEXT NOT NULL,
    "emergencyContactPhone" TEXT NOT NULL,
    "checkedIn" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Child_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Child" ("age", "checkedIn", "createdAt", "grade", "id", "medical", "name", "picPermission", "qrcode", "transportation", "tshirtSize", "updatedAt", "userId") SELECT "age", "checkedIn", "createdAt", "grade", "id", "medical", "name", "picPermission", "qrcode", "transportation", "tshirtSize", "updatedAt", "userId" FROM "Child";
DROP TABLE "Child";
ALTER TABLE "new_Child" RENAME TO "Child";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
