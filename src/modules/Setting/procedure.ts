import { createTRPCRouter, baseProcedure } from "@/trpc/init";
import { z } from "zod";
import { siteSettings } from "@/db/schema";
import { eq } from "drizzle-orm";

export const settingsRouter = createTRPCRouter({
  getAdSettings: baseProcedure.query(async ({ ctx }) => {
    const settings = await ctx.db.query.siteSettings.findFirst({
      where: eq(siteSettings.id, "global_config"),
    });

    return settings || { adImage: "", adLink: "", isActive: false };
  }),

  updateAdSettings: baseProcedure
    .input(
      z.object({
        adImage: z.string(),
        adLink: z.string().optional(),
        isActive: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.query.siteSettings.findFirst({
        where: eq(siteSettings.id, "global_config"),
      });

      if (!existing) {
        const [newConfig] = await ctx.db.insert(siteSettings).values({
          id: "global_config",
          adImage: input.adImage,
          adLink: input.adLink || "",
          isActive: input.isActive,
        }).returning();
        return newConfig;
      } else {
        const [updatedConfig] = await ctx.db
          .update(siteSettings)
          .set({
            adImage: input.adImage,
            adLink: input.adLink || "",
            isActive: input.isActive,
            updatedAt: new Date(),
          })
          .where(eq(siteSettings.id, "global_config"))
          .returning();
        return updatedConfig;
      }
    }),
});