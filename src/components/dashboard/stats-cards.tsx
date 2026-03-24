"use client";

import { useIdeas } from "@/lib/hooks/use-ideas";
import { STATUS_LABELS, STATUS_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const statuses = ["inbox", "organized", "candidate", "drafted", "published"];

export function StatsCards() {
  const statusQueries = statuses.map((status) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { data } = useIdeas({ status, limit: 1 });
    return { status, total: data?.total ?? 0 };
  });

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
      {statusQueries.map(({ status, total }) => (
        <div
          key={status}
          className="rounded-lg border border-gray-200 bg-white p-4 text-center"
        >
          <div
            className={cn(
              "mx-auto mb-2 inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
              STATUS_COLORS[status]
            )}
          >
            {STATUS_LABELS[status]}
          </div>
          <p className="text-2xl font-bold text-gray-900">{total}</p>
        </div>
      ))}
    </div>
  );
}
