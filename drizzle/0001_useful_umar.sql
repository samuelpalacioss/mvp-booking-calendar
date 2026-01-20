CREATE TYPE "public"."organization_role" AS ENUM('owner', 'admin', 'member');--> statement-breakpoint
CREATE TABLE "Organization" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "Organization_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "Event" ALTER COLUMN "user_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "Event" ADD COLUMN "organization_id" integer;--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "organization_id" integer;--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "organization_role" "organization_role";--> statement-breakpoint
ALTER TABLE "Event" ADD CONSTRAINT "Event_organization_id_Organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."Organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "User" ADD CONSTRAINT "User_organization_id_Organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."Organization"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "Event_organization_id_idx" ON "Event" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "User_organization_id_idx" ON "User" USING btree ("organization_id");