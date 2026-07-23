import { z } from "zod";
import { baseProcedure as publicProcedure, createTRPCRouter } from "@/trpc/init";
import { db } from "@/db";
import { users, messages } from "@/db/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

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

      const [newMessage] = await db
        .insert(messages)
        .values({
          userId: targetUser.id,
          content: input.content,
        })
        .returning();

      return { success: true, messageId: newMessage.id };
    }),
});