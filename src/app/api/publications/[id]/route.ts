import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const publication = await prisma.publication.update({
    where: { id },
    data: {
      url: body.url,
      reactionNote: body.reactionNote,
    },
  });

  return NextResponse.json(publication);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.publication.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
