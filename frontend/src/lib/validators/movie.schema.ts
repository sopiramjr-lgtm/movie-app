import { z } from "zod";

export const movieSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  posterUrl: z.string().url("Must be a valid URL"),
  backdropUrl: z.string().url("Must be a valid URL").optional(),
  releaseYear: z
    .number()
    .int()
    .min(1888)
    .max(new Date().getFullYear() + 5),
  genre: z.array(z.string()).min(1, "Select at least one genre"),
  rating: z.number().min(0).max(10),
  durationMinutes: z.number().positive("Duration must be positive"),
  director: z.string().min(1, "Director is required"),
  cast: z.array(z.string()),
});

export const movieFilterSchema = z.object({
  genre: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.enum(["rating", "releaseYear", "title"]).optional(),
  order: z.enum(["asc", "desc"]).optional(),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().optional().default(10),
});

export type MovieInput = z.infer<typeof movieSchema>;
export type MovieFilterInput = z.infer<typeof movieFilterSchema>;
