/*
  Warnings:

  - You are about to drop the column `failed_attempts` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `lock_until` on the `users` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "master_config" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "business_name" TEXT,
    "address" TEXT,
    "phone" TEXT,
    "logo_url" TEXT,
    "gemini_api_key" TEXT,
    "ticket_header" TEXT,
    "ticket_footer" TEXT,
    "updated_at" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "pin_hash" TEXT NOT NULL,
    "role_id" INTEGER,
    "branch_id" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "users_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_users" ("branch_id", "created_at", "id", "name", "pin_hash", "role_id") SELECT "branch_id", "created_at", "id", "name", "pin_hash", "role_id" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
