export const IDEA_STATUSES = [
  "inbox",
  "organized",
  "candidate",
  "drafted",
  "published",
  "hold",
] as const;

export const PLATFORMS = ["note", "x", "linkedin"] as const;

export const TONES = [
  "casual",
  "professional",
  "provocative",
  "educational",
] as const;

export const IDEA_TYPES = [
  "opinion",
  "howto",
  "story",
  "review",
  "question",
  "news_commentary",
] as const;

export const STATUS_COLORS: Record<string, string> = {
  inbox: "bg-gray-100 text-gray-800",
  organized: "bg-blue-100 text-blue-800",
  candidate: "bg-yellow-100 text-yellow-800",
  drafted: "bg-purple-100 text-purple-800",
  published: "bg-green-100 text-green-800",
  hold: "bg-red-100 text-red-800",
};

export const STATUS_LABELS: Record<string, string> = {
  inbox: "インボックス",
  organized: "整理済み",
  candidate: "候補",
  drafted: "下書きあり",
  published: "公開済み",
  hold: "保留",
};

export const PLATFORM_LABELS: Record<string, string> = {
  note: "note",
  x: "X (Twitter)",
  linkedin: "LinkedIn",
};

export const TONE_LABELS: Record<string, string> = {
  casual: "カジュアル",
  professional: "プロフェッショナル",
  provocative: "挑発的",
  educational: "教育的",
};

export const IDEA_TYPE_LABELS: Record<string, string> = {
  opinion: "意見",
  howto: "ハウツー",
  story: "ストーリー",
  review: "レビュー",
  question: "問い",
  news_commentary: "時事コメント",
};
