PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_role_listing` (
	`id` text PRIMARY KEY NOT NULL,
	`company_id` text,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`captured_at` integer DEFAULT (strftime('%s','now')) NOT NULL,
	`location` text,
	FOREIGN KEY (`company_id`) REFERENCES `role_company`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`location`) REFERENCES `role_location`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_role_listing`("id", "company_id", "title", "description", "captured_at") SELECT "id", "company_id", "title", "description", "captured_at" FROM `role_listing`;
--> statement-breakpoint
DROP TABLE `role_listing`;
--> statement-breakpoint
ALTER TABLE `__new_role_listing` RENAME TO `role_listing`;
--> statement-breakpoint
PRAGMA foreign_keys=ON;
