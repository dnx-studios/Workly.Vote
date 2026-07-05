import { pgTable, serial, text, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const commentsTable = pgTable("comments", {
  id: serial("id").primaryKey(),
  username: text("username").notNull(),
  content: text("content").notNull(),
  hasStar: boolean("has_star").default(false).notNull(),
  hasHeart: boolean("has_heart").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCommentSchema = createInsertSchema(commentsTable).omit({ id: true, createdAt: true, hasStar: true, hasHeart: true });
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Comment = typeof commentsTable.$inferSelect;
