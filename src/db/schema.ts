// src/db/schema.ts
import { integer, pgTable, serial, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  role: text("role").default("user").notNull(),
  favoriteColor: text("favorite_color").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").unique().notNull(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  promptContent: text("prompt_content").notNull(),
  replyContent: text("reply_content"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const frames = pgTable("frames", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  type: text("type").notNull(), 
  imageUrl: text("image_url").notNull(),
  content: text("content"), // Added content column
  fontStyle: text("font_style").default("font-sans"), // Added fontStyle column
  createdAt: timestamp("created_at").defaultNow().notNull(),
});