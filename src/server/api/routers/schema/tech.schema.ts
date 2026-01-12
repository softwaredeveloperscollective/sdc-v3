import { z } from "zod";

export const createTechSchema = z.object({
  slug: z.string().min(1, "Slug is required").toLowerCase(),
  label: z.string().min(1, "Label is required"),
  imgUrl: z.string().url("Must be a valid URL"),
});

export const updateTechSchema = createTechSchema.partial().extend({
  id: z.string(),
});

export const getTechSchema = z.object({
  id: z.string(),
});

export const techOutputSchema = z.object({
  id: z.string(),
  slug: z.string(),
  label: z.string(),
  imgUrl: z.string(),
  _count: z.object({
    Tech: z.number(),
  }),
});

export type CreateTechInput = z.infer<typeof createTechSchema>;
export type UpdateTechInput = z.infer<typeof updateTechSchema>;
export type GetTechInput = z.infer<typeof getTechSchema>;
export type TechOutput = z.infer<typeof techOutputSchema>;