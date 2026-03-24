import { z } from "zod";

export const IdeaStatus = z.enum([
  "inbox",
  "organized",
  "candidate",
  "drafted",
  "published",
  "hold",
]);

export const IdeaType = z.enum([
  "opinion",
  "howto",
  "story",
  "review",
  "question",
  "news_commentary",
]);

export const SourceType = z.enum(["manual", "voice", "import"]);

export const platformFitSchema = z.object({
  note: z.number().min(0).max(100),
  x: z.number().min(0).max(100),
  linkedin: z.number().min(0).max(100),
});

export const createIdeaSchema = z.object({
  content: z.string().min(1, "内容を入力してください").max(5000),
  title: z.string().max(200).optional(),
  sourceType: SourceType.default("manual"),
});

export const updateIdeaSchema = z.object({
  content: z.string().min(1).max(5000).optional(),
  title: z.string().max(200).optional().nullable(),
  summary: z.string().max(500).optional().nullable(),
  status: IdeaStatus.optional(),
  ideaType: IdeaType.optional().nullable(),
  importance: z.number().int().min(1).max(5).optional(),
  platformFit: platformFitSchema.optional().nullable(),
  tagIds: z.array(z.string()).optional(),
  categoryIds: z.array(z.string()).optional(),
});

export const organizeResultSchema = z.object({
  title: z.string(),
  summary: z.string(),
  ideaType: IdeaType,
  importance: z.number().int().min(1).max(5),
  platformFit: platformFitSchema,
  suggestedTags: z.array(z.string()),
  suggestedCategory: z.string(),
});

export type CreateIdeaInput = z.infer<typeof createIdeaSchema>;
export type UpdateIdeaInput = z.infer<typeof updateIdeaSchema>;
export type OrganizeResult = z.infer<typeof organizeResultSchema>;
export type PlatformFit = z.infer<typeof platformFitSchema>;
