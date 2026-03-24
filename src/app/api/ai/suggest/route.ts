import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getLLMProvider } from "@/lib/ai/provider";
import { z } from "zod";

const suggestSchema = z.object({
  ideaId: z.string(),
  type: z.enum(["questions", "related"]),
});

const questionsResultSchema = z.object({
  suggestions: z.array(z.string()),
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  const data = suggestSchema.parse(body);

  const idea = await prisma.idea.findUnique({ where: { id: data.ideaId } });
  if (!idea) {
    return NextResponse.json({ error: "Idea not found" }, { status: 404 });
  }

  const llm = getLLMProvider();

  if (data.type === "questions") {
    const prompt = `
You are helping a content creator deepen their thinking about an idea.

## Idea:
${idea.title ? `Title: ${idea.title}\n` : ""}${idea.content}
${idea.summary ? `\nSummary: ${idea.summary}` : ""}

Generate 3-5 thought-provoking follow-up questions that would help the creator:
- Explore the idea from different angles
- Identify the strongest argument or narrative
- Consider counterarguments or alternative perspectives
- Find the unique insight worth sharing

Respond in the same language as the idea.

Respond as JSON:
{ "suggestions": ["question1", "question2", ...] }
`.trim();

    const result = await llm.completeJSON(prompt, questionsResultSchema);
    return NextResponse.json(result);
  }

  // type === "related"
  const allIdeas = await prisma.idea.findMany({
    where: { id: { not: data.ideaId } },
    select: { id: true, title: true, content: true, summary: true },
    take: 50,
    orderBy: { createdAt: "desc" },
  });

  if (allIdeas.length === 0) {
    return NextResponse.json({ relatedIdeas: [] });
  }

  const relatedResultSchema = z.object({
    relatedIdeas: z.array(
      z.object({
        id: z.string(),
        score: z.number().min(0).max(100),
        reason: z.string(),
      })
    ),
  });

  const ideasList = allIdeas
    .map(
      (i) =>
        `- ID: ${i.id} | ${i.title ?? i.content.slice(0, 80)}`
    )
    .join("\n");

  const prompt = `
You are finding related ideas for a content creator.

## Current Idea:
${idea.title ? `Title: ${idea.title}\n` : ""}${idea.content}

## Other Ideas:
${ideasList}

Find the top 3-5 most related ideas. Score each 0-100 for relevance.
Only include ideas with score >= 30.

Respond as JSON:
{ "relatedIdeas": [{ "id": "the_idea_id", "score": 0-100, "reason": "brief reason" }] }
`.trim();

  const result = await llm.completeJSON(prompt, relatedResultSchema);
  return NextResponse.json(result);
}
