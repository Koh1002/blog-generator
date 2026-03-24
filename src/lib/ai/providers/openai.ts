import OpenAI from "openai";
import { ZodSchema } from "zod";
import type { LLMProvider, LLMOptions } from "../provider";

export class OpenAIProvider implements LLMProvider {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  async complete(prompt: string, options?: LLMOptions): Promise<string> {
    const res = await this.client.chat.completions.create({
      model: options?.model ?? "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 2048,
    });
    return res.choices[0]?.message?.content ?? "";
  }

  async completeJSON<T>(
    prompt: string,
    schema: ZodSchema<T>,
    options?: LLMOptions
  ): Promise<T> {
    const systemMsg =
      "You MUST respond with valid JSON only. No markdown, no explanation.";
    const res = await this.client.chat.completions.create({
      model: options?.model ?? "gpt-4o-mini",
      messages: [
        { role: "system", content: systemMsg },
        { role: "user", content: prompt },
      ],
      temperature: options?.temperature ?? 0.3,
      max_tokens: options?.maxTokens ?? 2048,
      response_format: { type: "json_object" },
    });
    const raw = JSON.parse(res.choices[0]?.message?.content ?? "{}");
    return schema.parse(raw);
  }
}
