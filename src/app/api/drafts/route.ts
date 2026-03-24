import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const ideaId = searchParams.get("ideaId");
  const platform = searchParams.get("platform");

  const where: Record<string, unknown> = {};
  if (ideaId) where.ideaId = ideaId;
  if (platform) where.platform = platform;

  const drafts = await prisma.draft.findMany({
    where,
    include: {
      idea: { select: { id: true, title: true } },
      publication: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(drafts);
}
