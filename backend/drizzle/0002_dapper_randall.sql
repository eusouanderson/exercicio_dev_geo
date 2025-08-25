CREATE TABLE "ai_results" (
	"id" serial PRIMARY KEY NOT NULL,
	"prompt" text NOT NULL,
	"result" text NOT NULL,
	"metadata" jsonb DEFAULT '{}',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
