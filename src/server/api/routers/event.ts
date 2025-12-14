/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { z } from "zod";
import { createEventSchema } from "./schema/event.schema";

const parseLocalDate = (dateString: string | Date): Date => {
  if (dateString instanceof Date) {
    return dateString;
  }
  const dateISO = `${dateString}T00:00:00.000Z`;
  return new Date(dateISO);
};

export const eventRouter = createTRPCRouter({
  getAllByChapter: publicProcedure
  .input(z.object({ chapterId: z.string() }))
  .query(async ({ ctx, input }) => {
    return ctx.prisma.event.findMany({
      where: { chapterId: input.chapterId },
      orderBy: { date: "desc" },
    });
  }),
  getAll: publicProcedure.query(async ({ ctx }) => {
    const events = await ctx.prisma.event.findMany({
      orderBy: {
        date: "desc",
      },
    });

    return events;
  }),

  findUnique: publicProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const currentUser = ctx.session?.user;

      const event = await ctx.prisma.event.findUnique({
        where: {
          id: input.id,
        },

        include: {
          projects: {
            orderBy: [{
              createdAt: "desc",
            }],
            include: {
              members: {
                select: {
                  id: true,
                  name: true,
                },
              },
              _count: {
                select: {
                  likes: true,
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
              comments: {
                include: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                      title: true,
                      image: true,
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
                    },
                  },
                },
                orderBy: {
                  createdAt: "desc",
                },
              },
              author: {
                select: {
                  id: true,
                  email: true,
                  name: true,
                },
              },
            },
          },
          members: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (currentUser) {
        const membersWithUserStatus = event?.members?.map((member) => ({
          ...member,
          isCurrentUserMember: member.id === currentUser.id,
        }));

        const projectsWithUser = event?.projects?.map((project) => {
          const isMember = project?.members?.some(
            (member) => member.id === currentUser.id,
          );

          return {
            ...project,
            isMember,
          };
        });

        const isUserPartOfAnyProject = projectsWithUser?.some(
          (project) => project.isMember,
        );

        return {
          ...event,
          members: membersWithUserStatus,
          projects: projectsWithUser?.map((project) => ({
            ...project,
            isUserPartOfAnyProject,
          })),
        };
      }

      return event;
    }),

  create: protectedProcedure
    .input(createEventSchema)
    .mutation(async ({ ctx, input }) => {
      const {
        name,
        date,
        location,
        description,
        startTime,
        chapterId,
      } = input;

      const event = await ctx.prisma.event.create({
        data: {
          name,
          date: parseLocalDate(date),
          description,
          startTime,
          location,
          chapterId,
        },
      });

      return event;
    }),

  update: protectedProcedure
    .input(
      createEventSchema.extend({
        id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, name, date, location, description, startTime, chapterId } = input;

      const event = await ctx.prisma.event.update({
        where: { id },
        data: {
          name,
          date: parseLocalDate(date),
          description,
          startTime,
          location,
          chapterId,
        },
      });

      return event;
    }),

  attendEvent: protectedProcedure
    .input(
      z.object({
        eventId: z.string(),
        userId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.user.update({
        where: {
          id: input.userId,
        },
        data: {
          memberOfEvents: {
            connect: {
              id: input.eventId,
            },
          },
        },
      });
    }),

  // getAllAttendees: publicProcedure
  //   .input(z.object({
  //     eventId: z.string(),
  //   }))
  //   .query(async ({ ctx, input }) => {
  //     const attendees = await ctx.prisma.event.findUnique({
  //       where: {
  //         id: input.eventId,
  //       },
  //       include: {
  //         users: true
  //     });

  //     // Assuming you want to return just the users, not the entire event object.
  //     return attendees ? attendees.users : [];
  //   }),

  getAllUsersAttendingEventButNotInProjects: protectedProcedure
    .input(
      z.object({
        eventId: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const usersAttendingEventNotInProjects = await ctx.prisma.user.findMany({
        where: {
          memberOfEvents: {
            some: {
              id: input.eventId,
            },
          },
        },
        select: {
          name: true,
          // email: true,
        },
      });

      return usersAttendingEventNotInProjects;
    }),

  autoAssignUsersToProjects: protectedProcedure
    .input(z.object({ eventId: z.string() })) // Taking event ID as input
    .mutation(async ({ ctx, input }) => {
      // Fetch users attending the specific event and not in any project
      const usersInEventNotInProjects = await ctx.prisma.user.findMany({
        where: {
          memberOfEvents: {
            some: {
              id: input.eventId, // Filtering users based on event participation
            },
          },
          // NOT: {
          //   projects: {
          //     some: { eventId: input.eventId }, // Ensuring they are not part of any project
          //   },
          // },
        },
      });

      // Fetch existing projects
      const projects = await ctx.prisma.project.findMany({
        where: {
          // Assuming there's a relation or field that links projects to events
          eventId: input.eventId, // Filter projects by the event
        },
      });

      if (projects.length === 0) {
        return {
          status: "error",
          message: "No projects available for assignment.",
        };
      }

      // Assigning users to projects
      const updateUserPromises = usersInEventNotInProjects
        .map((user, index) => {
          // console.log(user.techs);
          const project = projects[index % projects.length]; // Round-robin assignment
          if (project !== undefined) {
            return ctx.prisma.user.update({
              where: { id: user.id },
              data: {
                memberOfProjects: {
                  connect: { id: project.id },
                },
              },
            });
          }
          return null;
        })
        .filter((p) => p !== null);

      await Promise.all(updateUserPromises);

      return {
        status: "success",
        message: "Users assigned to projects successfully.",
      };
    }),

  // function to leave the event

  leaveEvent: protectedProcedure
    .input(
      z.object({
        eventId: z.string(),
        userId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.user.update({
        where: {
          id: input.userId,
        },
        data: {
          memberOfEvents: {
            disconnect: {
              id: input.eventId,
            },
          },
        },
      });
    }),
});
