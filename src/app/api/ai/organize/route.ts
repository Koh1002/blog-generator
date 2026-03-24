import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getLLMProvider } from "@/lib/ai/provider";
import { buildOrganizePrompt } from "@/lib/ai/prompts/organize";
import { organizeResultSchema } from "@/lib/validations/idea";
import { slugify } from "@/lib/utils";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const ideaIds: string[] | undefined = body.ideaIds;

  const where = ideaIds?.length
    ? { id: { in: ideaIds } }
    : { status: "inbox" };

  const ideas = await prisma.idea.findMany({ where });

  if (ideas.length === 0) {
    return NextResponse.json({ results: [], message: "No ideas to organize" });
  }

  const [tags, categories] = await Promise.all([
    prisma.tag.findMany({ select: { name: true } }),
    prisma.category.findMany({ select: { name: true } }),
  ]);

  const llm = getLLMProvider();
  const results = [];

  for (const idea of ideas) {
    try {
      const prompt = buildOrganizePrompt(
        idea.content,
        tags.map((t) => t.name),
        categories.map((c) => c.name)
      );

      const result = await llm.completeJSON(prompt, organizeResultSchema);

      const tagRecords = await Promise.all(
        result.suggestedTags.map((name) =>
          prisma.tag.upsert({
            where: { name },
            create: { name },
            update: {},
          })
        )
      );

      const category = await prisma.category.upsert({
        where: { name: result.suggestedCategory },
        create: {
          name: result.suggestedCategory,
          slug: slugify(result.suggestedCategory),
        },
        update: {},
      });

      await prisma.$transaction(async (tx) => {
        await tx.idea.update({
          where: { id: idea.id },
          data: {
            title: result.title,
            summary: result.summary,
            ideaType: result.ideaType,
            importance: result.importance,
            platformFit: JSON.stringify(result.platformFit),
            status: idea.status === "inbox" ? "organized" : idea.status,
          },
        });

        await tx.ideaTag.deleteMany({ where: { ideaId: idea.id } });
        await tx.ideaTag.createMany({
          data: tagRecords.map((tag) => ({
            ideaId: idea.id,
            tagId: tag.id,
          })),
        });

        await tx.ideaCategory.deleteMany({ where: { ideaId: idea.id } });
        await tx.ideaCategory.create({
          data: { ideaId: idea.id, categoryId: category.id },
        });
      });

      // Add newly created tags/categories to the list for subsequent ideas
      for (const tag of result.suggestedTags) {
        if (!tags.find((t) => t.name === tag)) {
          tags.push({ name: tag });
        }
      }
      if (!categories.find((c) => c.name === result.suggestedCategory)) {
        categories.push({ name: result.suggestedCategory });
      }

      results.push({ ideaId: idea.id, success: true });
    } catch (error) {
      results.push({
        ideaId: idea.id,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return NextResponse.json({ results });
}
