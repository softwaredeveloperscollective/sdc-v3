import { z } from "zod";

export const createChapterSchema = z.object({
  name: z.string().min(1, "Chapter name is required"),
  slug: z.string().optional(),
  location: z.string().optional(),
  meetupUrl: z.string().url().optional(),
  discordUrl: z.string().url().optional(),
  isActive: z.boolean().default(true),
});

export const updateChapterSchema = createChapterSchema.partial().extend({
  id: z.string(),
});

export const getChapterSchema = z.object({
  id: z.string(),
});

export const chapterOutputSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string().nullable(),
  location: z.string().nullable(),
  meetupUrl: z.string().nullable(),
  discordUrl: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  _count: z.object({
    events: z.number(),
  }).optional(),
});

export type CreateChapterInput = z.infer<typeof createChapterSchema>;
export type UpdateChapterInput = z.infer<typeof updateChapterSchema>;
export type GetChapterInput = z.infer<typeof getChapterSchema>;
export type ChapterOutput = z.infer<typeof chapterOutputSchema>;