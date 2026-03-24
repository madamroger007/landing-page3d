ALTER TABLE "orders" ADD COLUMN "order_label" text DEFAULT 'progress' NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "product_link" text;