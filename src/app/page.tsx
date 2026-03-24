"use client";

import { QuickInput } from "@/components/ideas/quick-input";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { RecentIdeas } from "@/components/dashboard/recent-ideas";

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>

      <StatsCards />

      <div>
        <h2 className="mb-3 text-lg font-semibold text-gray-800">
          クイック入力
        </h2>
        <QuickInput />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h2 className="mb-3 text-lg font-semibold text-gray-800">
            最近のネタ
          </h2>
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <RecentIdeas />
          </div>
        </div>
      </div>
    </div>
  );
}
