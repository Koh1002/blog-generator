import { ZodSchema } from "zod";

export interface LLMOptions {
  temperature?: number;
  maxTokens?: number;
  model?: string;
}

export interface LLMProvider {
  complete(prompt: string, options?: LLMOptions): Promise<string>;
  completeJSON<T>(
    prompt: string,
    schema: ZodSchema<T>,
    options?: LLMOptions
  ): Promise<T>;
}

export function createLLMProvider(): LLMProvider {
  const provider = process.env.LLM_PROVIDER ?? "openai";
  switch (provider) {
    case "anthropic": {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { AnthropicProvider } = require("./providers/anthropic");
      return new AnthropicProvider();
    }
    case "openai":
    default: {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { OpenAIProvider } = require("./providers/openai");
      return new OpenAIProvider();
    }
  }
}

let _provider: LLMProvider | null = null;
export function getLLMProvider(): LLMProvider {
  if (!_provider) _provider = createLLMProvider();
  return _provider;
}
