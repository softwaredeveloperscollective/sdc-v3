/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "@/server/api/trpc";
import { fetchGitHubContributors, fetchGitHubUserProfile } from "@/server/lib/github";
import { contributorSchema } from "@/server/api/routers/schema/contributor"; 

// Helper to fetch and upsert contributors
async function syncContributors(ctx: any) {
  const githubContributors = await fetchGitHubContributors();

  for (const [index, contributor] of githubContributors.entries()) {
    let userProfile;
    try {
      userProfile = await fetchGitHubUserProfile(contributor.login);
    } catch (error) {
      console.warn(`Failed to fetch profile for ${contributor.login}:`, error);
      userProfile = null;
    }

    await ctx.prisma.contributor.upsert({
      where: { githubLogin: contributor.login },
      update: {
        name: userProfile?.name || null,
        contributions: contributor.contributions,
        sortRank: index + 1,
        imgUrl: contributor.avatar_url,
        githubUrl: contributor.html_url,
        lastFetched: new Date(),
      },
      create: {
        githubLogin: contributor.login,
        name: userProfile?.name || null,
        imgUrl: contributor.avatar_url,
        githubUrl: contributor.html_url,
        contributions: contributor.contributions,
        sortRank: index + 1,
        showPublic: true,
        lastFetched: new Date(),
      },
    });
  }
  return githubContributors.length;
}

export const contributorsRouter = createTRPCRouter({
  getAll: publicProcedure
    .output(z.array(contributorSchema))
    .query(async ({ ctx }) => {
      await syncContributors(ctx); // <-- fetch and upsert before every call
      return await ctx.prisma.contributor.findMany({
        where: { showPublic: true },
        orderBy: { sortRank: 'asc' },
      });
  }),

  updateVisibility: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        showPublic: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.contributor.update({
        where: { id: input.id },
        data: { showPublic: input.showPublic },
      });
    }),

  updateFromGitHub: publicProcedure.mutation(async ({ ctx }) => {
    const count = await syncContributors(ctx);
    return { success: true, count };
  }),
});