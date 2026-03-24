import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getLLMProvider } from "@/lib/ai/provider";
import { buildOrganizePrompt } from "@/lib/ai/prompts/organize";
import { organizeResultSchema } from "@/lib/validations/idea";
import { slugify } from "@/lib/utils";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const idea = await prisma.idea.findUnique({ where: { id } });

  if (!idea) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const [tags, categories] = await Promise.all([
    prisma.tag.findMany({ select: { name: true } }),
    prisma.category.findMany({ select: { name: true } }),
  ]);

  const prompt = buildOrganizePrompt(
    idea.content,
    tags.map((t) => t.name),
    categories.map((c) => c.name)
  );

  const llm = getLLMProvider();
  const result = await llm.completeJSON(prompt, organizeResultSchema);

  // Ensure tags exist
  const tagRecords = await Promise.all(
    result.suggestedTags.map(async (name) => {
      return prisma.tag.upsert({
        where: { name },
        create: { name },
        update: {},
      });
    })
  );

  // Ensure category exists
  const category = await prisma.category.upsert({
    where: { name: result.suggestedCategory },
    create: {
      name: result.suggestedCategory,
      slug: slugify(result.suggestedCategory),
    },
    update: {},
  });

  // Update idea with organized data
  await prisma.$transaction(async (tx) => {
    await tx.idea.update({
      where: { id },
      data: {
        title: result.title,
        summary: result.summary,
        ideaType: result.ideaType,
        importance: result.importance,
        platformFit: JSON.stringify(result.platformFit),
        status: idea.status === "inbox" ? "organized" : idea.status,
      },
    });

    // Replace tags
    await tx.ideaTag.deleteMany({ where: { ideaId: id } });
    await tx.ideaTag.createMany({
      data: tagRecords.map((tag) => ({ ideaId: id, tagId: tag.id })),
    });

    // Replace categories
    await tx.ideaCategory.deleteMany({ where: { ideaId: id } });
    await tx.ideaCategory.create({
      data: { ideaId: id, categoryId: category.id },
    });
  });

  const updated = await prisma.idea.findUnique({
    where: { id },
    include: {
      tags: { include: { tag: true } },
      categories: { include: { category: true } },
    },
  });

  return NextResponse.json(updated);
}
