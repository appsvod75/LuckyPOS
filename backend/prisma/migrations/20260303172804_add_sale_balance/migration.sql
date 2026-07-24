-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_sales_h" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "branch_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "total" DECIMAL NOT NULL,
    "tax" DECIMAL NOT NULL DEFAULT 0,
    "discount" DECIMAL NOT NULL DEFAULT 0,
    "payment_method" TEXT NOT NULL DEFAULT 'CASH',
    "balance" DECIMAL NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "client_id" INTEGER,
    CONSTRAINT "sales_h_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "sales_h_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "sales_h_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_sales_h" ("branch_id", "client_id", "created_at", "discount", "id", "payment_method", "tax", "total", "user_id") SELECT "branch_id", "client_id", "created_at", "discount", "id", "payment_method", "tax", "total", "user_id" FROM "sales_h";
DROP TABLE "sales_h";
ALTER TABLE "new_sales_h" RENAME TO "sales_h";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
