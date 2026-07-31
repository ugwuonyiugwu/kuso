import { boolean, integer, pgTable, serial, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  secretToken: text("secret_token").notNull(),
  role: text("role").default("user").notNull(),
  favoriteColor: text("favorite_color").notNull(),
  customPrompt: text("custom_prompt").default("Anonymous messages!").notNull(),
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
  content: text("content"),
  fontStyle: text("font_style").default("font-sans"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const siteSettings = pgTable("site_settings", {
  id: text("id").primaryKey().default("global_config"),
  adImage: text("ad_image"),
  adLink: text("ad_link"),
  isActive: boolean("is_active").default(true).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const newMonthWishes = pgTable("new_month_wishes", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});