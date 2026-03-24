import Anthropic from "@anthropic-ai/sdk";
import { ZodSchema } from "zod";
import type { LLMProvider, LLMOptions } from "../provider";

export class AnthropicProvider implements LLMProvider {
  private client: Anthropic;

  constructor() {
    this.client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }

  async complete(prompt: string, options?: LLMOptions): Promise<string> {
    const res = await this.client.messages.create({
      model: options?.model ?? "claude-sonnet-4-20250514",
      max_tokens: options?.maxTokens ?? 2048,
      messages: [{ role: "user", content: prompt }],
    });
    const block = res.content[0];
    return block.type === "text" ? block.text : "";
  }

  async completeJSON<T>(
    prompt: string,
    schema: ZodSchema<T>,
    options?: LLMOptions
  ): Promise<T> {
    const wrappedPrompt = `${prompt}\n\nRespond with valid JSON only. No markdown fences, no explanation.`;
    const text = await this.complete(wrappedPrompt, {
      ...options,
      temperature: options?.temperature ?? 0.3,
    });
    const cleaned = text
      .replace(/```json?\n?/g, "")
      .replace(/```/g, "")
      .trim();
    const raw = JSON.parse(cleaned);
    return schema.parse(raw);
  }
}
