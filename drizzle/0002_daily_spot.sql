CREATE TABLE "Person" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "Person_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"ci" varchar(10),
	"email" varchar(320) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "Person_ci_unique" UNIQUE("ci")
);
--> statement-breakpoint
ALTER TABLE "Booking" RENAME COLUMN "client_id" TO "person_id";--> statement-breakpoint
ALTER TABLE "Payment" RENAME COLUMN "client_id" TO "person_id";--> statement-breakpoint
ALTER TABLE "Booking" DROP CONSTRAINT "Booking_client_id_Client_id_fk";
--> statement-breakpoint
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_client_id_Client_id_fk";
--> statement-breakpoint
DROP INDEX "Booking_client_id_idx";--> statement-breakpoint
DROP INDEX "Client_email_idx";--> statement-breakpoint
DROP INDEX "Payment_client_id_idx";--> statement-breakpoint
ALTER TABLE "Client" ALTER COLUMN "ci" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "Client" ADD COLUMN "birth_date" date NOT NULL;--> statement-breakpoint
ALTER TABLE "User" ADD COLUMN "client_id" integer NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "Person_ci_idx" ON "Person" USING btree ("ci");--> statement-breakpoint
CREATE INDEX "Person_email_idx" ON "Person" USING btree ("email");--> statement-breakpoint
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_person_id_Person_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."Person"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_person_id_Person_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."Person"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "User" ADD CONSTRAINT "User_client_id_Client_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."Client"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "Booking_person_id_idx" ON "Booking" USING btree ("person_id");--> statement-breakpoint
CREATE INDEX "Payment_person_id_idx" ON "Payment" USING btree ("person_id");--> statement-breakpoint
CREATE UNIQUE INDEX "User_client_id_idx" ON "User" USING btree ("client_id");--> statement-breakpoint
ALTER TABLE "Client" DROP COLUMN "email";--> statement-breakpoint
ALTER TABLE "Client" DROP COLUMN "created_at";--> statement-breakpoint
ALTER TABLE "User" ADD CONSTRAINT "User_client_id_unique" UNIQUE("client_id");