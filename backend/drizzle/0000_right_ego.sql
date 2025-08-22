CREATE TABLE "polygons" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"coordinates" text,
	"properties" json
);
