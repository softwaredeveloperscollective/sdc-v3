import z from "zod";

export const createEventSchema = z.object({
  name: z.string(),
  date: z.coerce.date(),
  location: z.string(),
  description: z.string(),
  startTime: z.string(), 
  chapterId: z.string().nullable(),
});

export type createEventInput = z.TypeOf<typeof createEventSchema>;
