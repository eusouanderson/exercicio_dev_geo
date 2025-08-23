CREATE TABLE "points" (
	"id" serial PRIMARY KEY NOT NULL,
	"lat" text NOT NULL,
	"lon" text NOT NULL,
	"info" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
