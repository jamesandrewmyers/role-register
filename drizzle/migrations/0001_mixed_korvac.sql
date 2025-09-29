PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_role_application` (
	`id` text PRIMARY KEY NOT NULL,
	`listing_id` text NOT NULL,
	`status` text NOT NULL,
	`applied_at` text,
	`updated_at` text,
	FOREIGN KEY (`listing_id`) REFERENCES `role_listing`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_role_application`("id", "listing_id", "status", "applied_at", "updated_at") SELECT "id", "listing_id", "status", "applied_at", "updated_at" FROM `role_application`;--> statement-breakpoint
DROP TABLE `role_application`;--> statement-breakpoint
ALTER TABLE `__new_role_application` RENAME TO `role_application`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_role_attachment` (
	`id` text PRIMARY KEY NOT NULL,
	`listing_id` text NOT NULL,
	`type` text NOT NULL,
	`path_or_url` text,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP',
	FOREIGN KEY (`listing_id`) REFERENCES `role_listing`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_role_attachment`("id", "listing_id", "type", "path_or_url", "created_at") SELECT "id", "listing_id", "type", "path_or_url", "created_at" FROM `role_attachment`;--> statement-breakpoint
DROP TABLE `role_attachment`;--> statement-breakpoint
ALTER TABLE `__new_role_attachment` RENAME TO `role_attachment`;--> statement-breakpoint
CREATE TABLE `__new_role_callout` (
	`id` text PRIMARY KEY NOT NULL,
	`listing_id` text NOT NULL,
	`content` text NOT NULL,
	FOREIGN KEY (`listing_id`) REFERENCES `role_listing`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_role_callout`("id", "listing_id", "content") SELECT "id", "listing_id", "content" FROM `role_callout`;--> statement-breakpoint
DROP TABLE `role_callout`;--> statement-breakpoint
ALTER TABLE `__new_role_callout` RENAME TO `role_callout`;--> statement-breakpoint
CREATE TABLE `__new_role_contact` (
	`id` text PRIMARY KEY NOT NULL,
	`listing_id` text NOT NULL,
	`name` text NOT NULL,
	`email` text,
	`phone` text,
	FOREIGN KEY (`listing_id`) REFERENCES `role_listing`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_role_contact`("id", "listing_id", "name", "email", "phone") SELECT "id", "listing_id", "name", "email", "phone" FROM `role_contact`;--> statement-breakpoint
DROP TABLE `role_contact`;--> statement-breakpoint
ALTER TABLE `__new_role_contact` RENAME TO `role_contact`;--> statement-breakpoint
CREATE TABLE `__new_role_event` (
	`id` text PRIMARY KEY NOT NULL,
	`listing_id` text NOT NULL,
	`application_id` text,
	`title` text NOT NULL,
	`event_date` text,
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
	`captured_at` text DEFAULT 'CURRENT_TIMESTAMP',
	FOREIGN KEY (`company_id`) REFERENCES `role_company`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_role_listing`("id", "company_id", "title", "description", "captured_at") SELECT "id", "company_id", "title", "description", "captured_at" FROM `role_listing`;--> statement-breakpoint
DROP TABLE `role_listing`;--> statement-breakpoint
ALTER TABLE `__new_role_listing` RENAME TO `role_listing`;