import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { updateIdeaSchema } from "@/lib/validations/idea";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const idea = await prisma.idea.findUnique({
    where: { id },
    include: {
      tags: { include: { tag: true } },
      categories: { include: { category: true } },
      drafts: { orderBy: { createdAt: "desc" } },
      publications: { orderBy: { publishedAt: "desc" } },
      relationsFrom: {
        include: { relatedIdea: { select: { id: true, title: true, content: true } } },
      },
    },
  });

  if (!idea) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(idea);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const data = updateIdeaSchema.parse(body);

  const { tagIds, categoryIds, platformFit, ...updateData } = data;

  await prisma.$transaction(async (tx) => {
    await tx.idea.update({
      where: { id },
      data: {
        ...updateData,
        platformFit: platformFit ? JSON.stringify(platformFit) : undefined,
      },
    });

    if (tagIds !== undefined) {
      await tx.ideaTag.deleteMany({ where: { ideaId: id } });
      if (tagIds.length > 0) {
        await tx.ideaTag.createMany({
          data: tagIds.map((tagId) => ({ ideaId: id, tagId })),
        });
      }
    }

    if (categoryIds !== undefined) {
      await tx.ideaCategory.deleteMany({ where: { ideaId: id } });
      if (categoryIds.length > 0) {
        await tx.ideaCategory.createMany({
          data: categoryIds.map((categoryId) => ({ ideaId: id, categoryId })),
        });
      }
    }
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

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.idea.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
