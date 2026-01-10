/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "@/server/api/trpc";
import { 
  createChapterSchema, 
  updateChapterSchema, 
  getChapterSchema,
  chapterOutputSchema 
} from "./schema/chapter.schema";
import { z } from "zod";

export const chapterRouter = createTRPCRouter({
  getAll: publicProcedure
    .output(z.array(chapterOutputSchema))
    .query(async ({ ctx }) => {
      const chapters = await ctx.prisma.chapter.findMany({
        where: {
          isActive: true,
        },
        orderBy: {
          name: "asc",
        },
        include: {
          _count: {
            select: {
              events: true,
            },
          },
        },
      });

      return chapters;
    }),

  getAllWithInactive: protectedProcedure
    .output(z.array(chapterOutputSchema))
    .query(async ({ ctx }) => {
      if (ctx.session.user.role !== "ADMIN" && ctx.session.user.role !== "MOD") {
        throw new Error("Unauthorized");
      }

      const chapters = await ctx.prisma.chapter.findMany({
        orderBy: {
          name: "asc",
        },
        include: {
          _count: {
            select: {
              events: true,
            },
          },
        },
      });

      return chapters;
    }),

  getById: publicProcedure
    .input(getChapterSchema)
    .output(chapterOutputSchema)
    .query(async ({ ctx, input }) => {
      const chapter = await ctx.prisma.chapter.findUnique({
        where: {
          id: input.id,
        },
        include: {
          _count: {
            select: {
              events: true,
            },
          },
        },
      });

      if (!chapter) {
        throw new Error("Chapter not found");
      }

      return chapter;
    }),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .output(chapterOutputSchema)
    .query(async ({ ctx, input }) => {
      const chapter = await ctx.prisma.chapter.findUnique({
        where: {
          slug: input.slug,
        },
        include: {
          _count: {
            select: {
              events: true,
            },
          },
        },
      });

      if (!chapter) {
        throw new Error("Chapter not found");
      }

      return chapter;
    }),

  create: protectedProcedure
    .input(createChapterSchema)
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
      }

      const slug = input.slug || input.name.toLowerCase().replace(/\s+/g, "-");

      const chapter = await ctx.prisma.chapter.create({
        data: {
          name: input.name,
          slug,
          location: input.location,
          meetupUrl: input.meetupUrl,
          discordUrl: input.discordUrl,
          isActive: input.isActive ?? true,
        },
      });

      return chapter;
    }),

  update: protectedProcedure
    .input(updateChapterSchema)
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
      }

      const { id, ...data } = input;

      if (data.slug) {
        data.slug = data.slug.toLowerCase().replace(/\s+/g, "-");
      }

      const chapter = await ctx.prisma.chapter.update({
        where: { id },
        data,
      });

      return chapter;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.role !== "ADMIN") {
        throw new Error("Unauthorized");
      }

      const chapter = await ctx.prisma.chapter.update({
        where: { id: input.id },
        data: { isActive: false },
      });

      return chapter;
    }),
});
