"use client";

import { use } from "react";
import { DraftGenerator } from "@/components/drafts/draft-generator";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function GeneratePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <Link
        href={`/ideas/${id}`}
        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
      >
        <ChevronLeft className="mr-1 h-4 w-4" />
        ネタ詳細に戻る
      </Link>
      <h1 className="text-2xl font-bold text-gray-900">投稿案を生成</h1>
      <DraftGenerator ideaId={id} />
    </div>
  );
}
