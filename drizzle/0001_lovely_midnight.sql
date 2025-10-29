CREATE TABLE `activities` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`location` text NOT NULL,
	`city` text NOT NULL,
	`description` text NOT NULL,
	`category` text NOT NULL,
	`duration` text NOT NULL,
	`price` integer NOT NULL,
	`rating` real NOT NULL,
	`max_participants` integer NOT NULL,
	`available_spots` integer NOT NULL,
	`includes` text,
	`images` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `bookings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`booking_type` text NOT NULL,
	`item_id` integer NOT NULL,
	`booking_details` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`total_amount` integer NOT NULL,
	`payment_status` text DEFAULT 'pending' NOT NULL,
	`booking_date` text NOT NULL,
	`travel_date` text NOT NULL,
	`passengers` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `buses` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`operator` text NOT NULL,
	`bus_number` text NOT NULL,
	`from_city` text NOT NULL,
	`to_city` text NOT NULL,
	`departure_time` text NOT NULL,
	`arrival_time` text NOT NULL,
	`duration` text NOT NULL,
	`price` integer NOT NULL,
	`available_seats` integer NOT NULL,
	`bus_type` text NOT NULL,
	`amenities` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `flights` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`airline` text NOT NULL,
	`flight_number` text NOT NULL,
	`from_city` text NOT NULL,
	`to_city` text NOT NULL,
	`departure_time` text NOT NULL,
	`arrival_time` text NOT NULL,
	`duration` text NOT NULL,
	`price` integer NOT NULL,
	`available_seats` integer NOT NULL,
	`class_type` text NOT NULL,
	`baggage_allowance` text,
	`meal_included` integer DEFAULT false,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `hotels` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`location` text NOT NULL,
	`city` text NOT NULL,
	`rating` real NOT NULL,
	`price_per_night` integer NOT NULL,
	`amenities` text,
	`room_type` text NOT NULL,
	`available_rooms` integer NOT NULL,
	`check_in` text NOT NULL,
	`check_out` text NOT NULL,
	`images` text,
	`created_at` text NOT NULL
);
