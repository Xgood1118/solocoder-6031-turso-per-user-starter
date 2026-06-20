CREATE TABLE `projects` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`emoji` text NOT NULL DEFAULT '📁',
	`created_at` integer NOT NULL DEFAULT (unixepoch())
);

ALTER TABLE `todos` ADD `project_id` integer;
ALTER TABLE `todos` ADD `priority` text NOT NULL DEFAULT 'medium';
ALTER TABLE `todos` ADD `due_date` text;
ALTER TABLE `todos` ADD `created_at` integer NOT NULL DEFAULT (unixepoch());
