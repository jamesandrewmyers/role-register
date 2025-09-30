CREATE TABLE `event_info` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`payload` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP',
	`updated_at` text,
	`error` text
);
