import { createTRPCRouter, baseProcedure } from "@/trpc/init";
import { z } from "zod";
import { users, messages } from "@/db/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";

export const userRouter = createTRPCRouter({
  createUser: baseProcedure
    .input(
      z.object({
        username: z.string().min(3),
        color: z.string(),
        role: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existingUser = await ctx.db.query.users.findFirst({
        where: eq(users.username, input.username),
      });

      if (existingUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "This username is already taken.",
        });
      }

      const secretToken = nanoid(32);

      const [newUser] = await ctx.db.insert(users).values({
        username: input.username,
        favoriteColor: input.color,
        role: input.role ?? "user",
        secretToken: secretToken,
        customPrompt: "Anonymous messages!",
      }).returning();

      return newUser;
    }),

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

      if (!user) {
        return null;
      }

      return user;
    }),

  // Lookup user directly by secret token for token-only dashboard access
  getUserByToken: baseProcedure
    .input(
      z.object({
        token: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.secretToken, input.token),
      });

      if (!user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid access token.",
        });
      }

      return user;
    }),

  // Updated: Creates a new message row with a unique slug and updates the user's base prompt
  updatePrompt: baseProcedure
    .input(
      z.object({
        token: z.string(),
        prompt: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.secretToken, input.token),
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found or invalid token.",
        });
      }

      // Update user's current custom prompt
      await ctx.db
        .update(users)
        .set({ customPrompt: input.prompt })
        .where(eq(users.secretToken, input.token));

      // Generate a new unique slug/token for this specific message prompt row
      const newSlug = nanoid(10);

      // Insert a brand new message row into the database table
      const [newMessage] = await ctx.db.insert(messages).values({
        userId: user.id,
        promptContent: input.prompt,
        slug: newSlug,
      }).returning();

      return {
        slug: newMessage.slug,
        promptContent: newMessage.promptContent,
      };
    }),

  getSecureDashboard: baseProcedure
    .input(
      z.object({
        username: z.string(),
        token: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const user = await ctx.db.query.users.findFirst({
        where: eq(users.username, input.username),
      });

      if (!user || user.secretToken !== input.token) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid or missing access token!",
        });
      }

      return user;
    }),
});