import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

export const GEMINI_FIXED_MODEL = "gemini-3.1-pro-preview";
export const GEMINI_FLASH_MODEL = "gemini-2.5-flash";

export function createGeminiModel(apiKey: string, model?: string): ChatGoogleGenerativeAI {
  return new ChatGoogleGenerativeAI({
    apiKey,
    model: model ?? GEMINI_FIXED_MODEL,
  });
}

