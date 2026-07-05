import { pgTable, serial, text, integer, timestamp, unique } from "drizzle-orm/pg-core";

export const commentReactionsTable = pgTable("comment_reactions", {
  id: serial("id").primaryKey(),
  commentId: integer("comment_id").notNull(),
  username: text("username").notNull(),
  reactionType: text("reaction_type").notNull(), // 'like' | 'dislike'
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => ({
  uniqUserComment: unique("crx_unique_user_comment").on(t.commentId, t.username),
}));

export type CommentReaction = typeof commentReactionsTable.$inferSelect;
