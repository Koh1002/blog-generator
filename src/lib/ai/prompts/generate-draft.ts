export interface GenerateDraftInput {
  ideaContent: string;
  ideaSummary?: string | null;
  platform: "note" | "x" | "linkedin";
  tone: string;
  additionalContext?: string;
}

const platformGuides: Record<string, string> = {
  note: `Platform: note (Japanese blogging platform)
- Long-form article, 800-2000 characters
- Use markdown headings and structure
- Conversational yet insightful tone
- Include a hook in the opening paragraph`,

  x: `Platform: X (Twitter)
- Maximum 280 characters (strict limit)
- Punchy and attention-grabbing
- May use line breaks for emphasis
- Optional: suggest thread format if idea is complex`,

  linkedin: `Platform: LinkedIn
- Professional tone, 500-1500 characters
- Start with a strong hook line
- Use short paragraphs with line breaks
- End with a question or call to reflection
- May include relevant hashtags`,
};

export function buildGenerateDraftPrompt(input: GenerateDraftInput): string {
  return `
You are a skilled content writer helping craft platform-specific posts.

## Original Idea:
${input.ideaContent}

${input.ideaSummary ? `## Summary: ${input.ideaSummary}` : ""}

${input.additionalContext ? `## Additional Context: ${input.additionalContext}` : ""}

## Target Platform:
${platformGuides[input.platform]}

## Tone: ${input.tone}

## Instructions:
Write a ready-to-publish draft for the specified platform.
The content should be in the same language as the original idea.
Respect platform character limits and conventions.

Respond as JSON:
{
  "content": "the draft text",
  "platformNotes": "optional notes about the draft (e.g. character count, suggestions)"
}
`.trim();
}
