CREATE TABLE "geo_points" (
	"id" serial PRIMARY KEY NOT NULL,
	"lat" text NOT NULL,
	"lon" text NOT NULL,
	"info" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "polygons" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"coordinates" text,
	"properties" json
);
