import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const draft = await prisma.draft.findUnique({
    where: { id },
    include: { idea: true, publication: true },
  });

  if (!draft) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(draft);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.draft.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
