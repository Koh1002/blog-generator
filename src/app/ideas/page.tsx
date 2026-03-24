"use client";

import { IdeaList } from "@/components/ideas/idea-list";

export default function IdeasPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">ネタ一覧</h1>
      <IdeaList />
    </div>
  );
}
