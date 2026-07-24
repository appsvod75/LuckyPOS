-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_inventory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "branch_id" INTEGER NOT NULL,
    "product_id" INTEGER NOT NULL,
    "stock_level" INTEGER NOT NULL DEFAULT 0,
    "min_stock" INTEGER NOT NULL DEFAULT 5,
    "max_stock" INTEGER NOT NULL DEFAULT 100,
    CONSTRAINT "inventory_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "inventory_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_inventory" ("branch_id", "id", "min_stock", "product_id", "stock_level") SELECT "branch_id", "id", "min_stock", "product_id", "stock_level" FROM "inventory";
DROP TABLE "inventory";
ALTER TABLE "new_inventory" RENAME TO "inventory";
CREATE UNIQUE INDEX "inventory_branch_id_product_id_key" ON "inventory"("branch_id", "product_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
