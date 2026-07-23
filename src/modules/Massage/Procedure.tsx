import { z } from "zod";
import { baseProcedure as publicProcedure, createTRPCRouter } from "@/trpc/init";
import { db } from "@/db";
import { users, messages } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";

export const messageRouter = createTRPCRouter({
  send: publicProcedure
    .input(
      z.object({
        recipientUsername: z.string(),
        content: z.string().min(1, "Message cannot be empty").max(500, "Message is too long"),
      })
    )
    .mutation(async ({ input }) => {
      const [targetUser] = await db
        .select()
        .from(users)
        .where(eq(users.username, input.recipientUsername))
        .limit(1);

      if (!targetUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      const uniqueSlug = nanoid(10);

      const [newMessage] = await db
        .insert(messages)
        .values({
          slug: uniqueSlug,
          userId: targetUser.id,
          promptContent: input.content,
        })
        .returning();

      return { success: true, messageId: newMessage.id, slug: newMessage.slug };
    }),

  replyToPrompt: publicProcedure
    .input(
      z.object({
        slug: z.string(),
        replyContent: z.string().min(1, "Reply cannot be empty").max(500, "Reply is too long"),
      })
    )
    .mutation(async ({ input }) => {
      const [targetMessage] = await db
        .select()
        .from(messages)
        .where(eq(messages.slug, input.slug))
        .limit(1);

      if (!targetMessage) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Message link not found",
        });
      }

      const [updatedMessage] = await db
        .update(messages)
        .set({ replyContent: input.replyContent })
        .where(eq(messages.slug, input.slug))
        .returning();

      return { success: true, messageId: updatedMessage.id };
    }),

  getInbox: publicProcedure
    .input(
      z.object({
        username: z.string(),
      })
    )
    .query(async ({ input }) => {
      const [targetUser] = await db
        .select()
        .from(users)
        .where(eq(users.username, input.username))
        .limit(1);

      if (!targetUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      const userMessages = await db
        .select()
        .from(messages)
        .where(eq(messages.userId, targetUser.id))
        .orderBy(desc(messages.createdAt));

      return userMessages;
    }),
});