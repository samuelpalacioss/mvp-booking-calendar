CREATE TYPE "public"."booking_status" AS ENUM('pending', 'confirmed', 'cancelled', 'completed', 'no_show');--> statement-breakpoint
CREATE TYPE "public"."currency" AS ENUM('USD', 'BS', 'EUR');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('admin', 'user');--> statement-breakpoint
CREATE TABLE "Booking" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "Booking_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"event_option_id" integer NOT NULL,
	"client_id" integer,
	"date" date NOT NULL,
	"time_slot" time NOT NULL,
	"status" "booking_status" DEFAULT 'pending' NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Client" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "Client_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"ci" varchar(10),
	"email" varchar(320) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "Client_ci_unique" UNIQUE("ci")
);
--> statement-breakpoint
CREATE TABLE "Duration" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "Duration_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"duration" interval NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "EventOption" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "EventOption_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"event_id" varchar(255) NOT NULL,
	"duration_id" integer,
	"capacity" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "Event" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"url_slug" varchar(100) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "Event_url_slug_unique" UNIQUE("url_slug")
);
--> statement-breakpoint
CREATE TABLE "Payment" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "Payment_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"booking_id" integer NOT NULL,
	"client_id" integer,
	"amount_usd" numeric(10, 2) NOT NULL,
	"amount_bs" numeric(10, 2),
	"tasa_cambio" numeric(10, 4),
	"currency" "currency" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "Payment_booking_id_unique" UNIQUE("booking_id")
);
--> statement-breakpoint
CREATE TABLE "Price" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "Price_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"event_option_id" integer NOT NULL,
	"usd_amount" numeric(10, 2) NOT NULL,
	"valid_from" date NOT NULL,
	"valid_until" date,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "User" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "User_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"username" varchar(100) NOT NULL,
	"email" varchar(320) NOT NULL,
	"password" varchar(255) NOT NULL,
	"role" "role" DEFAULT 'user' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_event_option_id_EventOption_id_fk" FOREIGN KEY ("event_option_id") REFERENCES "public"."EventOption"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_client_id_Client_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."Client"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "EventOption" ADD CONSTRAINT "EventOption_event_id_Event_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."Event"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "EventOption" ADD CONSTRAINT "EventOption_duration_id_Duration_id_fk" FOREIGN KEY ("duration_id") REFERENCES "public"."Duration"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Event" ADD CONSTRAINT "Event_user_id_User_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."User"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_booking_id_Booking_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."Booking"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_client_id_Client_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."Client"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "Price" ADD CONSTRAINT "Price_event_option_id_EventOption_id_fk" FOREIGN KEY ("event_option_id") REFERENCES "public"."EventOption"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "Booking_event_option_id_idx" ON "Booking" USING btree ("event_option_id");--> statement-breakpoint
CREATE INDEX "Booking_client_id_idx" ON "Booking" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "Booking_date_time_idx" ON "Booking" USING btree ("date","time_slot");--> statement-breakpoint
CREATE INDEX "Booking_status_idx" ON "Booking" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "Client_ci_idx" ON "Client" USING btree ("ci");--> statement-breakpoint
CREATE INDEX "Client_email_idx" ON "Client" USING btree ("email");--> statement-breakpoint
CREATE INDEX "EventOption_event_id_idx" ON "EventOption" USING btree ("event_id");--> statement-breakpoint
CREATE INDEX "EventOption_duration_id_idx" ON "EventOption" USING btree ("duration_id");--> statement-breakpoint
CREATE UNIQUE INDEX "Event_slug_idx" ON "Event" USING btree ("url_slug");--> statement-breakpoint
CREATE INDEX "Event_user_id_idx" ON "Event" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "Payment_booking_id_idx" ON "Payment" USING btree ("booking_id");--> statement-breakpoint
CREATE INDEX "Payment_client_id_idx" ON "Payment" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "Price_event_option_id_idx" ON "Price" USING btree ("event_option_id");--> statement-breakpoint
CREATE INDEX "Price_active_idx" ON "Price" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "Price_valid_from_idx" ON "Price" USING btree ("valid_from");--> statement-breakpoint
CREATE UNIQUE INDEX "User_email_idx" ON "User" USING btree ("email");