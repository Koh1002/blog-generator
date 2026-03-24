import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/utils";
import { z } from "zod";

export async function GET() {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { ideas: true } } },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(categories);
}

const createCategorySchema = z.object({
  name: z.string().min(1).max(100),
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  const data = createCategorySchema.parse(body);

  const category = await prisma.category.create({
    data: {
      name: data.name,
      slug: slugify(data.name),
    },
  });

  return NextResponse.json(category, { status: 201 });
}
