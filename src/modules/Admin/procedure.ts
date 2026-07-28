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
});