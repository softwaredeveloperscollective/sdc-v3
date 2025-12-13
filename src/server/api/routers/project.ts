import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { z } from "zod";

export const projectRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string(),
        eventId: z.string(),
        techs: z.array(z.string()),
        authorId: z.string(),
      })
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.project.create({
        data: {
          name: input.name,
          description: input.description,
          event: {
            connect: {
              id: input.eventId,
            },
          },
          author: {
            connect: {
              id: input.authorId,
            },
          },
          techs: {
            connectOrCreate: input.techs.map((tech) => ({
              where: {
                id: tech,
              },
              create: {
                masterTechId: tech,
              },
            })),
          },
          superProject: {
            create: {
              name: input.name,
              description: input.description,
              author: {
                connect: {
                  id: input.authorId,
                },
              },
          },},
        },
      });
    }),
  createAndAssociateWithSuperProject: protectedProcedure
  .input(
    z.object({
      name: z.string(),
      description: z.string(),
      eventId: z.string(),
      techs: z.array(z.string()),
      authorId: z.string(),
      superProjectId: z.string(),
    })
  )
  .mutation(({ ctx, input }) => {
    return ctx.prisma.project.create({
      data: {
        name: input.name,
        description: input.description,
        event: {
          connect: {
            id: input.eventId,
          },
        },
        author: {
          connect: {
            id: input.authorId,
          },
        },
        techs: {
          connectOrCreate: input.techs.map((tech) => ({
            where: {
              id: tech,
            },
            create: {
              masterTechId: tech,
            },
          })),
        },
        superProject: {
          connect: {
            id: input.superProjectId,
        },},
      },
    });
  }),

  findUnique: publicProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.prisma.project.findUnique({
        where: {
          id: input.id,
        },
        include: {
          _count: {
            select: {
              likes: true,
            },
          },
          author: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
          techs: {
            include: {
              tech: {
                select: {
                  label: true,
                },
              },
            },
          },
        },
      });
    }),

  createComment: protectedProcedure
    .input(
      z.object({
        comment: z.string(),
        projectId: z.string(),
        authorId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.comment.create({
        data: {
          comment: input.comment,
          project: {
            connect: {
              id: input.projectId,
            },
          },
          user: {
            connect: {
              id: input.authorId,
            },
          },
        },
      });
    }),

    updateComment: protectedProcedure
    .input(
      z.object({
        comment: z.string(),
        id: z.string()
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.comment.update({
        where: {
          id: input.id
        },
        data: {
          comment: input.comment,
        },
      });
    }),

    deleteComment: protectedProcedure
    .input(
      z.object({
        id: z.string()
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.comment.delete({
        where: {
          id: input.id
        },
      });
    }),

    deleteAllProjectComments: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.comment.deleteMany({
        where: {
          projectId: input.projectId
        },
      });
    }),

  deleteProject: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const tx = await ctx.prisma.$transaction(async (prisma) => {
        // Delete all likes
        await prisma.like.deleteMany({
          where: {
            projectId: input.projectId
          }
        });

        // Delete all comments
        await prisma.comment.deleteMany({
          where: {
            projectId: input.projectId
          }
        });

        // Clean up tech associations
        await prisma.tech.deleteMany({
          where: {
            projectId: input.projectId
          }
        });

        // Update project to remove all member connections
        await prisma.project.update({
          where: { id: input.projectId },
          data: {
            members: {
              set: [] // This clears all member connections
            }
          }
        });

        // Delete the project and return it
        return prisma.project.delete({
          where: {
            id: input.projectId
          }
        });
      });

      return tx;
    }),

  editProject: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        name: z.string(),
        description: z.string(),
        techs: z.array(z.string()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const existingProject = await ctx.prisma.project.findUnique({
        where: { id: input.projectId },
        include: { techs: true }
      });

      const existingTechIds = existingProject?.techs.map(t => t.id) || [];
      const newTechIds = input.techs;

      const techsToAdd = newTechIds.filter(id => !existingTechIds.includes(id));
      const techsToRemove = existingTechIds.filter(id => !newTechIds.includes(id));

      if (techsToRemove.length > 0) {
        await ctx.prisma.tech.deleteMany({
          where: {
            id: {
              in: techsToRemove
            }
          }
        });
      }

      return ctx.prisma.project.update({
        where: {
          id: input.projectId,
        },
        data: {
          name: input.name,
          description: input.description,
          techs: {
            disconnect: techsToRemove.map(id => ({ id})),
            connectOrCreate: techsToAdd.map(tech => ({
              where: { id: tech},
              create: {masterTechId: tech }
            }))
          }
        },
        include: {
          techs: {
            include: {
              tech: true
            }
          }
        }
      });
    }),

  joinProject: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        userId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.user.update({
        where: {
          id: input.userId,
        },
        data: {
          memberOfProjects: {
            connect: {
              id: input.projectId,
            },
          },
        },
      });
    }),

  leaveProject: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        userId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.user.update({
        where: {
          id: input.userId,
        },
        data: {
          memberOfProjects: {
            disconnect: {
              id: input.projectId,
            },
          },
        },
      });
    }),

  getUserPastProjects: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const now = new Date();
      now.setHours(now.getHours() - 24);

      return ctx.prisma.project.findMany({
        where: {
          authorId: input.userId,
          event: {
            date: {
              lte: now,
            },
          },
        },
        include: {
          techs: {
            include: {
              tech: {
                select: {
                  id: true,
                  label: true,
                  imgUrl: true,
                },
              },
            },
          },
          event: {
            select: {
              id: true,
              name: true,
              date: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }),
});
