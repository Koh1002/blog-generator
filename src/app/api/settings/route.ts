import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const settings = await prisma.appSetting.findMany();
  const templates = await prisma.promptTemplate.findMany();

  const settingsMap: Record<string, string> = {};
  settings.forEach((s) => {
    settingsMap[s.key] = s.value;
  });

  return NextResponse.json({ settings: settingsMap, templates });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();

  if (body.settings) {
    for (const [key, value] of Object.entries(body.settings)) {
      await prisma.appSetting.upsert({
        where: { key },
        create: { key, value: String(value) },
        update: { value: String(value) },
      });
    }
  }

  if (body.templates) {
    for (const tmpl of body.templates) {
      if (tmpl.id) {
        await prisma.promptTemplate.update({
          where: { id: tmpl.id },
          data: { template: tmpl.template, name: tmpl.name },
        });
      }
    }
  }

  return NextResponse.json({ success: true });
}
