"use client";

import { PublicationList } from "@/components/publications/publication-list";

export default function PublicationsPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">公開履歴</h1>
      <PublicationList />
    </div>
  );
}
