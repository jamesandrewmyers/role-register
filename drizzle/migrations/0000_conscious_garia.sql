CREATE TABLE `data_received` (
	`id` text PRIMARY KEY NOT NULL,
	`url` text NOT NULL,
	`title` text NOT NULL,
	`html` text NOT NULL,
	`text` text NOT NULL,
	`received_at` text DEFAULT 'CURRENT_TIMESTAMP',
	`processed` text DEFAULT 'false',
	`processing_notes` text
);
--> statement-breakpoint
CREATE TABLE `role_application` (
	`id` text PRIMARY KEY NOT NULL,
	`listing_id` text NOT NULL,
	`status` text NOT NULL,
	`applied_at` text,
	`updated_at` text,
	FOREIGN KEY (`listing_id`) REFERENCES `role_listing`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `role_attachment` (
	`id` text PRIMARY KEY NOT NULL,
	`listing_id` text NOT NULL,
	`type` text NOT NULL,
	`path_or_url` text,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP',
	FOREIGN KEY (`listing_id`) REFERENCES `role_listing`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `role_callout` (
	`id` text PRIMARY KEY NOT NULL,
	`listing_id` text NOT NULL,
	`content` text NOT NULL,
	FOREIGN KEY (`listing_id`) REFERENCES `role_listing`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `role_company` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`website` text,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP'
);
--> statement-breakpoint
CREATE TABLE `role_contact` (
	`id` text PRIMARY KEY NOT NULL,
	`listing_id` text NOT NULL,
	`name` text NOT NULL,
	`email` text,
	`phone` text,
	FOREIGN KEY (`listing_id`) REFERENCES `role_listing`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `role_event` (
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
CREATE TABLE `role_listing` (
	`id` text PRIMARY KEY NOT NULL,
	`company_id` text,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`captured_at` text DEFAULT 'CURRENT_TIMESTAMP',
	FOREIGN KEY (`company_id`) REFERENCES `role_company`(`id`) ON UPDATE no action ON DELETE cascade
);
