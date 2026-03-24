import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createPublicationSchema } from "@/lib/validations/publication";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const platform = searchParams.get("platform");
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "20");

  const where: Record<string, unknown> = {};
  if (platform) where.platform = platform;

  const [publications, total] = await Promise.all([
    prisma.publication.findMany({
      where,
      include: {
        idea: { select: { id: true, title: true, content: true } },
        draft: { select: { id: true, content: true, platform: true } },
      },
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.publication.count({ where }),
  ]);

  return NextResponse.json({
    publications,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const data = createPublicationSchema.parse(body);

  const publication = await prisma.publication.create({
    data: {
      ideaId: data.ideaId,
      draftId: data.draftId,
      platform: data.platform,
      url: data.url || undefined,
      reactionNote: data.reactionNote,
      publishedAt: data.publishedAt ? new Date(data.publishedAt) : new Date(),
    },
  });

  // Update idea status
  await prisma.idea.update({
    where: { id: data.ideaId },
    data: { status: "published" },
  });

  return NextResponse.json(publication, { status: 201 });
}
