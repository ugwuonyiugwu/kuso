import { createTRPCRouter, baseProcedure } from "@/trpc/init";
import { z } from "zod";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const userRouter = createTRPCRouter({
  createUser: baseProcedure
    .input(
      z.object({
        username: z.string().min(3),
        color: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Check if username already exists
      const existingUser = await ctx.db.query.users.findFirst({
        where: eq(users.username, input.username),
      });

      if (existingUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "This username is already taken.",
        });
      }

      return await ctx.db.insert(users).values({
        username: input.username,
        favoriteColor: input.color,
      });
    }),

  // Lookup user by unique username for sign-in
  getUserByUsername: baseProcedure
    .input(
      z.object({
        username: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.username, input.username),
      });

      // Return null safely instead of throwing a NOT_FOUND error
      if (!user) {
        return null;
      }

      return user;
    }),
});