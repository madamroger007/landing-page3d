import { integer, pgTable, serial, text, uniqueIndex } from 'drizzle-orm/pg-core';
import { productsTable } from './products';

export const toolsTable = pgTable('tools', {
    id: serial('id').primaryKey(),
    name: text('name').notNull().unique(),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
});

export const productToolsTable = pgTable(
    'product_tools',
    {
        id: serial('id').primaryKey(),
        productId: integer('product_id')
            .notNull()
            .references(() => productsTable.id, { onDelete: 'cascade' }),
        toolId: integer('tool_id')
            .notNull()
            .references(() => toolsTable.id, { onDelete: 'cascade' }),
        createdAt: text('created_at').notNull(),
    },
    (table) => ({
        uniqueProductTool: uniqueIndex('product_tools_product_id_tool_id_unique').on(table.productId, table.toolId),
    })
);

export type InsertTool = typeof toolsTable.$inferInsert;
export type SelectTool = typeof toolsTable.$inferSelect;

export type InsertProductTool = typeof productToolsTable.$inferInsert;
export type SelectProductTool = typeof productToolsTable.$inferSelect;
