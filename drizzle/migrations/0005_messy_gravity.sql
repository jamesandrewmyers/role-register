CREATE TABLE `role_location` (
	`id` text PRIMARY KEY NOT NULL,
	`location_state` text NOT NULL,
	`city` text NOT NULL,
	`created_at` integer DEFAULT (strftime('%s','now')) NOT NULL,
	FOREIGN KEY (`location_state`) REFERENCES `role_state`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `role_qualifications` (
	`id` text PRIMARY KEY NOT NULL,
	`listing_id` text NOT NULL,
	`description` text NOT NULL,
	`type` text NOT NULL,
	`created_at` integer DEFAULT (strftime('%s','now')) NOT NULL,
	FOREIGN KEY (`listing_id`) REFERENCES `role_listing`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `role_state` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`abbreviation` text NOT NULL,
	`created_at` integer DEFAULT (strftime('%s','now')) NOT NULL
);
