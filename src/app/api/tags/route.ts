import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { z } from "zod";

export async function GET() {
  const tags = await prisma.tag.findMany({
    include: { _count: { select: { ideas: true } } },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(tags);
}

const createTagSchema = z.object({
  name: z.string().min(1).max(50),
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  const data = createTagSchema.parse(body);

  const tag = await prisma.tag.create({
    data: { name: data.name },
  });

  return NextResponse.json(tag, { status: 201 });
}
