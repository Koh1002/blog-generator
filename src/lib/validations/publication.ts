import { z } from "zod";

export const createPublicationSchema = z.object({
  ideaId: z.string(),
  draftId: z.string().optional(),
  platform: z.enum(["note", "x", "linkedin"]),
  url: z.string().url().optional().or(z.literal("")),
  reactionNote: z.string().max(500).optional(),
  publishedAt: z.string().datetime().optional(),
});

export type CreatePublicationInput = z.infer<typeof createPublicationSchema>;
