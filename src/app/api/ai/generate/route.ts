import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getLLMProvider } from "@/lib/ai/provider";
import { buildGenerateDraftPrompt } from "@/lib/ai/prompts/generate-draft";
import { generateDraftSchema } from "@/lib/validations/draft";
import { draftContentSchema } from "@/lib/validations/draft";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const data = generateDraftSchema.parse(body);

  const idea = await prisma.idea.findUnique({
    where: { id: data.ideaId },
  });

  if (!idea) {
    return NextResponse.json({ error: "Idea not found" }, { status: 404 });
  }

  const llm = getLLMProvider();
  const drafts = [];

  // Get existing variant count for this platform
  const existingCount = await prisma.draft.count({
    where: { ideaId: data.ideaId, platform: data.platform },
  });

  for (let i = 0; i < data.variantCount; i++) {
    const prompt = buildGenerateDraftPrompt({
      ideaContent: idea.content,
      ideaSummary: idea.summary,
      platform: data.platform,
      tone: data.tone,
      additionalContext: data.additionalContext,
    });

    const result = await llm.completeJSON(prompt, draftContentSchema);

    const draft = await prisma.draft.create({
      data: {
        ideaId: data.ideaId,
        platform: data.platform,
        tone: data.tone,
        content: result.content,
        variant: existingCount + i + 1,
      },
    });

    drafts.push({ ...draft, platformNotes: result.platformNotes });
  }

  // Update idea status if needed
  if (idea.status === "organized" || idea.status === "candidate") {
    await prisma.idea.update({
      where: { id: data.ideaId },
      data: { status: "drafted" },
    });
  }

  return NextResponse.json(drafts);
}
