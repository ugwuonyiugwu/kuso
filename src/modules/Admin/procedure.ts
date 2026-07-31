// src/server/routers/frame.ts
import { createTRPCRouter, baseProcedure } from "@/trpc/init";
import { z } from "zod";
import { frames } from "@/db/schema";
import { eq } from "drizzle-orm";

export const frameRouter = createTRPCRouter({
  createFrame: baseProcedure
    .input(
      z.object({
        title: z.string(),
        type: z.string(),
        imageUrl: z.string(),
        content: z.string().optional(),
        fontStyle: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.db.insert(frames).values({
        title: input.title,
        type: input.type,
        imageUrl: input.imageUrl,
        content: input.content,
        fontStyle: input.fontStyle,
      });
    }),

  getByType: baseProcedure
    .input(
      z.object({
        type: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      return await ctx.db.query.frames.findMany({
        where: eq(frames.type, input.type),
      });
    }),

  getById: baseProcedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .query(async ({ ctx, input }) => {
      return await ctx.db.query.frames.findFirst({
        where: eq(frames.id, input.id),
      });
    }),

  // Added new procedure for storing short-link wish data
  createWish: baseProcedure
    .input(
      z.object({
        name: z.string().min(1),
        message: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Adjust this block to fit your Drizzle schema model name for wishes
      const [newWish] = await ctx.db.insert(frames).values({
        title: input.name,       // Mapping name to title or your chosen field
        content: input.message,  // Mapping message content
        type: "new-month-wish",  // Categorizing type
        imageUrl: "/frame.jpg",  // Default card frame image
      }).returning({ id: frames.id });

      return { id: newWish.id };
    }),
});