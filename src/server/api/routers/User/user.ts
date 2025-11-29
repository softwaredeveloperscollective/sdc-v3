import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { z } from "zod";

export const userRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        title: true,
      },
      orderBy: {
        name: "asc",
      },
    });
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.prisma.user.findUnique({
        where: {
          id: input.id,
        },
        include: {
          // id: true,
          // role: true,
          techs: {
            select: {
              id: true,
              tech: {
                select: {
                  label: true,
                  imgUrl: true,
                },
              },
            },
          },
        },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().optional(),
        github: z.string().optional(),
        twitter: z.string().optional(),
        linkedin: z.string().optional(),
        website: z.string().optional(),
        techs: z.array(z.string()).optional(),
        ogTechs: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await ctx.prisma.user.update({
        where: {
          id: input.id,
        },
        data: {
          ...(input.title && {
            title: input.title,
          }),
          ...(input.github && {
            github: input.github,
          }),
          ...(input.twitter && {
            twitter: input.twitter,
          }),
          ...(input.linkedin && {
            linkedin: input.linkedin,
          }),
          ...(input.website && {
            website: input.website,
          }),
          ...(input.techs &&
            input.ogTechs && {
              techs: {
                connectOrCreate: input.techs.map((tech) => ({
                  where: {
                    id: tech,
                  },
                  create: {
                    masterTechId: tech,
                  },
                })),
                disconnect: input.ogTechs.map((tech) => ({
                  id: tech,
                })),
              },
            }),
        },
      });
    }),
});
