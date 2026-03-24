export function buildOrganizePrompt(
  ideaContent: string,
  existingTags: string[],
  existingCategories: string[]
): string {
  return `
You are an editorial assistant helping organize raw ideas/memos for a personal content creator.

Analyze the following idea and provide structured metadata.

## Idea Content:
${ideaContent}

## Existing Tags (prefer reusing these):
${existingTags.join(", ") || "None yet"}

## Existing Categories (prefer reusing these):
${existingCategories.join(", ") || "None yet"}

## Instructions:
1. Generate a concise title (max 50 chars, Japanese OK)
2. Write a 1-2 sentence summary
3. Classify the idea type: opinion | howto | story | review | question | news_commentary
4. Rate importance 1-5 (5 = highly publishable, strong angle; 1 = vague fragment)
5. Score platform fit 0-100 for each: note (long-form blog), x (short tweet), linkedin (professional)
6. Suggest 1-3 tags (prefer existing ones, but create new if needed)
7. Suggest one category (prefer existing, create new if none fit)

Respond as JSON with this exact structure:
{
  "title": "string",
  "summary": "string",
  "ideaType": "opinion|howto|story|review|question|news_commentary",
  "importance": 1-5,
  "platformFit": { "note": 0-100, "x": 0-100, "linkedin": 0-100 },
  "suggestedTags": ["string"],
  "suggestedCategory": "string"
}
`.trim();
}
