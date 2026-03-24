import { cn } from "@/lib/utils";
import { PLATFORM_LABELS } from "@/lib/constants";

interface PlatformFitIndicatorProps {
  platformFit: string | null;
  compact?: boolean;
}

export function PlatformFitIndicator({
  platformFit,
  compact = false,
}: PlatformFitIndicatorProps) {
  if (!platformFit) return null;

  let fit: { note: number; x: number; linkedin: number };
  try {
    fit = JSON.parse(platformFit);
  } catch {
    return null;
  }

  const platforms = [
    { key: "note", score: fit.note },
    { key: "x", score: fit.x },
    { key: "linkedin", score: fit.linkedin },
  ];

  if (compact) {
    return (
      <div className="flex gap-2 text-xs text-gray-500">
        {platforms.map((p) => (
          <span key={p.key}>
            {PLATFORM_LABELS[p.key]?.split(" ")[0]}:{p.score}
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      {platforms.map((p) => (
        <div key={p.key} className="flex items-center gap-2">
          <span className="w-16 text-xs text-gray-500">
            {PLATFORM_LABELS[p.key]?.split(" ")[0]}
          </span>
          <div className="h-2 flex-1 rounded-full bg-gray-100">
            <div
              className={cn(
                "h-2 rounded-full",
                p.score >= 70
                  ? "bg-green-500"
                  : p.score >= 40
                    ? "bg-yellow-500"
                    : "bg-gray-300"
              )}
              style={{ width: `${p.score}%` }}
            />
          </div>
          <span className="w-8 text-right text-xs text-gray-500">
            {p.score}
          </span>
        </div>
      ))}
    </div>
  );
}
