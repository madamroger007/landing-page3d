CREATE TABLE "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" text NOT NULL,
	"gross_amount" integer NOT NULL,
	"snap_token" text,
	"payment_type" text,
	"transaction_status" text DEFAULT 'pending',
	"transaction_id" text,
	"fraud_status" text,
	"customer_name" text,
	"customer_email" text,
	"customer_phone" text,
	"items" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"transaction_time" text,
	"settlement_time" text,
	CONSTRAINT "orders_order_id_unique" UNIQUE("order_id")
);
