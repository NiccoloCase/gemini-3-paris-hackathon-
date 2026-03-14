import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

export const GEMINI_FIXED_MODEL = "gemini-3.1-pro-preview";

export function createGeminiModel(apiKey: string): ChatGoogleGenerativeAI {
  return new ChatGoogleGenerativeAI({
    apiKey,
    model: GEMINI_FIXED_MODEL,
  });
}

