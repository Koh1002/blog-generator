import { cn } from "@/lib/utils";
import { STATUS_COLORS, STATUS_LABELS } from "@/lib/constants";

interface IdeaStatusBadgeProps {
  status: string;
}

export function IdeaStatusBadge({ status }: IdeaStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        STATUS_COLORS[status] ?? "bg-gray-100 text-gray-800"
      )}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}
