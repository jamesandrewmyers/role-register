PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_data_received` (
	`id` text PRIMARY KEY NOT NULL,
	`url` text NOT NULL,
	`title` text NOT NULL,
	`html` text NOT NULL,
	`text` text NOT NULL,
	`received_at` integer DEFAULT (strftime('%s','now')) NOT NULL,
	`processed` text DEFAULT 'false',
	`processing_notes` text
);
--> statement-breakpoint
INSERT INTO `__new_data_received`("id", "url", "title", "html", "text", "received_at", "processed", "processing_notes") SELECT "id", "url", "title", "html", "text", "received_at", "processed", "processing_notes" FROM `data_received`;--> statement-breakpoint
DROP TABLE `data_received`;--> statement-breakpoint
ALTER TABLE `__new_data_received` RENAME TO `data_received`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_event_info` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`payload` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` integer DEFAULT (strftime('%s','now')) NOT NULL,
	`updated_at` integer,
	`error` text,
	`retries` integer DEFAULT 0
);
--> statement-breakpoint
INSERT INTO `__new_event_info`("id", "type", "payload", "status", "created_at", "updated_at", "error", "retries") SELECT "id", "type", "payload", "status", "created_at", "updated_at", "error", "retries" FROM `event_info`;--> statement-breakpoint
DROP TABLE `event_info`;--> statement-breakpoint
ALTER TABLE `__new_event_info` RENAME TO `event_info`;--> statement-breakpoint
CREATE TABLE `__new_role_application` (
	`id` text PRIMARY KEY NOT NULL,
	`listing_id` text NOT NULL,
	`status` text NOT NULL,
	`applied_at` integer,
	`updated_at` integer,
	FOREIGN KEY (`listing_id`) REFERENCES `role_listing`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_role_application`("id", "listing_id", "status", "applied_at", "updated_at") SELECT "id", "listing_id", "status", "applied_at", "updated_at" FROM `role_application`;--> statement-breakpoint
DROP TABLE `role_application`;--> statement-breakpoint
ALTER TABLE `__new_role_application` RENAME TO `role_application`;--> statement-breakpoint
CREATE TABLE `__new_role_attachment` (
	`id` text PRIMARY KEY NOT NULL,
	`listing_id` text NOT NULL,
	`type` text NOT NULL,
	`path_or_url` text,
	`created_at` integer DEFAULT (strftime('%s','now')) NOT NULL,
	FOREIGN KEY (`listing_id`) REFERENCES `role_listing`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_role_attachment`("id", "listing_id", "type", "path_or_url", "created_at") SELECT "id", "listing_id", "type", "path_or_url", "created_at" FROM `role_attachment`;--> statement-breakpoint
DROP TABLE `role_attachment`;--> statement-breakpoint
ALTER TABLE `__new_role_attachment` RENAME TO `role_attachment`;--> statement-breakpoint
CREATE TABLE `__new_role_company` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`website` text,
	`created_at` integer DEFAULT (strftime('%s','now')) NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_role_company`("id", "name", "website", "created_at") SELECT "id", "name", "website", "created_at" FROM `role_company`;--> statement-breakpoint
DROP TABLE `role_company`;--> statement-breakpoint
ALTER TABLE `__new_role_company` RENAME TO `role_company`;--> statement-breakpoint
CREATE TABLE `__new_role_event` (
	`id` text PRIMARY KEY NOT NULL,
	`listing_id` text NOT NULL,
	`application_id` text,
	`title` text NOT NULL,
	`event_date` integer,
	`notes` text,
	FOREIGN KEY (`listing_id`) REFERENCES `role_listing`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`application_id`) REFERENCES `role_application`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_role_event`("id", "listing_id", "application_id", "title", "event_date", "notes") SELECT "id", "listing_id", "application_id", "title", "event_date", "notes" FROM `role_event`;--> statement-breakpoint
DROP TABLE `role_event`;--> statement-breakpoint
ALTER TABLE `__new_role_event` RENAME TO `role_event`;--> statement-breakpoint
CREATE TABLE `__new_role_listing` (
	`id` text PRIMARY KEY NOT NULL,
	`company_id` text,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`captured_at` integer DEFAULT (strftime('%s','now')) NOT NULL,
	FOREIGN KEY (`company_id`) REFERENCES `role_company`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_role_listing`("id", "company_id", "title", "description", "captured_at") SELECT "id", "company_id", "title", "description", "captured_at" FROM `role_listing`;--> statement-breakpoint
DROP TABLE `role_listing`;--> statement-breakpoint
ALTER TABLE `__new_role_listing` RENAME TO `role_listing`;