import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  favoriteColor: text("favorite_color").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});