import { z } from "zod";

const normalizeUrl = (url: string): string => {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  // Add https:// prefix
  return `https://${trimmed}`;
};

const urlSchema = z
  .string()
  .min(1, "Image URL is required")
  .transform(normalizeUrl)
  .refine(
    (val) => {
      try {
        new URL(val);
        return true;
      } catch {
        return false;
      }
    },
    { message: "Must be a valid URL or domain name" }
  );

export const createTechSchema = z.object({
  slug: z
    .string()
    .min(1)
    .toLowerCase()
    .optional()
    .or(z.literal(""))
    .transform((val) => val || undefined),
  label: z.string().min(1, "Label is required"),
  imgUrl: urlSchema,
});

export const updateTechSchema = createTechSchema
  .partial()
  .extend({
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