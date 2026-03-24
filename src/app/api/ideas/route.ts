import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createIdeaSchema } from "@/lib/validations/idea";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const search = searchParams.get("search");
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "20");
  const sort = searchParams.get("sort") ?? "createdAt";
  const order = searchParams.get("order") ?? "desc";

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { content: { contains: search } },
      { title: { contains: search } },
      { summary: { contains: search } },
    ];
  }

  const [ideas, total] = await Promise.all([
    prisma.idea.findMany({
      where,
      include: {
        tags: { include: { tag: true } },
        categories: { include: { category: true } },
        _count: { select: { drafts: true, publications: true } },
      },
      orderBy: { [sort]: order },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.idea.count({ where }),
  ]);

  return NextResponse.json({
    ideas,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const data = createIdeaSchema.parse(body);

  const idea = await prisma.idea.create({
    data: {
      content: data.content,
      title: data.title,
      sourceType: data.sourceType,
    },
  });

  return NextResponse.json(idea, { status: 201 });
}
