import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, date, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const itineraryDays = pgTable("itinerary_days", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  dayNumber: integer("day_number").notNull(),
  date: date("date").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  city: text("city").notNull(),
  activities: jsonb("activities").notNull(), // Array of activity objects
  meals: jsonb("meals").notNull(), // Breakfast, lunch, dinner details
  accommodation: text("accommodation"),
  imageUrl: text("image_url"),
  departureTime: text("departure_time"),
  estimatedDuration: text("estimated_duration"),
});

export const attractions = pgTable("attractions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  nameEn: text("name_en").notNull(),
  city: text("city").notNull(),
  category: text("category").notNull(), // "world_heritage", "architecture", "museum", etc.
  description: text("description").notNull(),
  visitDuration: text("visit_duration"),
  ticketRequired: text("ticket_required"),
  imageUrl: text("image_url"),
  highlights: jsonb("highlights"), // Array of highlight strings
});

export const travelReminders = pgTable("travel_reminders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  category: text("category").notNull(), // "documents", "money", "packing", etc.
  title: text("title").notNull(),
  items: jsonb("items").notNull(), // Array of reminder items
  icon: text("icon").notNull(),
  priority: integer("priority").notNull(), // 1-5, 1 being highest priority
});

export const weatherData = pgTable("weather_data", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  city: text("city").notNull(),
  date: date("date").notNull(),
  temperature: integer("temperature"),
  condition: text("condition"),
  description: text("description"),
  icon: text("icon"),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertItineraryDaySchema = createInsertSchema(itineraryDays).omit({
  id: true,
});

export const insertAttractionSchema = createInsertSchema(attractions).omit({
  id: true,
});

export const insertTravelReminderSchema = createInsertSchema(travelReminders).omit({
  id: true,
});

export const insertWeatherDataSchema = createInsertSchema(weatherData).omit({
  id: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertItineraryDay = z.infer<typeof insertItineraryDaySchema>;
export type ItineraryDay = typeof itineraryDays.$inferSelect;
export type InsertAttraction = z.infer<typeof insertAttractionSchema>;
export type Attraction = typeof attractions.$inferSelect;
export type InsertTravelReminder = z.infer<typeof insertTravelReminderSchema>;
export type TravelReminder = typeof travelReminders.$inferSelect;
export type InsertWeatherData = z.infer<typeof insertWeatherDataSchema>;
export type WeatherData = typeof weatherData.$inferSelect;

// Cache table for AI-generated descriptions
export const descriptionsCache = pgTable("descriptions_cache", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  dayNumber: integer("day_number").notNull(),
  dataHash: text("data_hash").notNull(), // MD5 hash of input data
  generatedDescription: text("generated_description").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertDescriptionsCacheSchema = createInsertSchema(descriptionsCache).omit({
  id: true,
});

export type DescriptionsCache = typeof descriptionsCache.$inferSelect;
export type InsertDescriptionsCache = z.infer<typeof insertDescriptionsCacheSchema>;

// Additional types for frontend usage
export interface Activity {
  time: string;
  name: string;
  location?: string;
  duration: string;
  description?: string;
  notes?: string;
}

export interface Meals {
  breakfast?: string;
  lunch?: string;
  dinner?: string;
}

export interface ReminderItem {
  text: string;
  completed?: boolean;
}
