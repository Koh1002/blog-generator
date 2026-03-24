import { z } from "zod";

export const Platform = z.enum(["note", "x", "linkedin"]);
export const Tone = z.enum(["casual", "professional", "provocative", "educational"]);

export const generateDraftSchema = z.object({
  ideaId: z.string(),
  platform: Platform,
  tone: Tone.default("casual"),
  additionalContext: z.string().max(1000).optional(),
  variantCount: z.number().int().min(1).max(3).default(1),
});

export const draftContentSchema = z.object({
  content: z.string(),
  platformNotes: z.string().optional(),
});

export type GenerateDraftInput = z.infer<typeof generateDraftSchema>;
export type DraftContent = z.infer<typeof draftContentSchema>;
