"use client";

import { use } from "react";
import { IdeaDetail } from "@/components/ideas/idea-detail";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function IdeaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <Link
        href="/ideas"
        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
      >
        <ChevronLeft className="mr-1 h-4 w-4" />
        ネタ一覧に戻る
      </Link>
      <IdeaDetail ideaId={id} />
    </div>
  );
}
