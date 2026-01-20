CREATE TABLE "User_Customer" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "User_Customer_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" integer NOT NULL,
	"person_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "User_Customer" ADD CONSTRAINT "User_Customer_user_id_User_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "User_Customer" ADD CONSTRAINT "User_Customer_person_id_Person_id_fk" FOREIGN KEY ("person_id") REFERENCES "public"."Person"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "User_Customer_user_id_idx" ON "User_Customer" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "User_Customer_person_id_idx" ON "User_Customer" USING btree ("person_id");--> statement-breakpoint
CREATE UNIQUE INDEX "User_Customer_user_person_idx" ON "User_Customer" USING btree ("user_id","person_id");