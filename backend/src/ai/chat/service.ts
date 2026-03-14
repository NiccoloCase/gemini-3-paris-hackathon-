import { createGeminiModel, GEMINI_FLASH_MODEL } from "../core/model.js";
import {
  ONBOARDING_SYSTEM_PROMPT,
  EXTRACT_PREFERENCES_PROMPT,
} from "./prompts.js";
import { HumanMessage, AIMessage } from "@langchain/core/messages";

interface ChatMessage {
  role: "ai" | "user";
  text: string;
}

export class ChatService {
  private model;

  constructor(options: { apiKey: string }) {
    this.model = createGeminiModel(options.apiKey, GEMINI_FLASH_MODEL);
  }

  async getNextMessage(history: ChatMessage[]): Promise<string> {
    const messages = [];

    if (history.length === 0) {
      // No history: send system prompt as a human message to kick off the conversation
      messages.push(
        new HumanMessage(
          ONBOARDING_SYSTEM_PROMPT +
            "\n\nPlease start the onboarding conversation now with your greeting and first question."
        )
      );
    } else {
      // With history: system prompt as first human msg, then alternate
      messages.push(new HumanMessage(ONBOARDING_SYSTEM_PROMPT + "\n\nBegin."));
      for (const m of history) {
        if (m.role === "ai") {
          messages.push(new AIMessage(m.text));
        } else {
          messages.push(new HumanMessage(m.text));
        }
      }
    }

    const response = await this.model.invoke(messages);
    return typeof response.content === "string"
      ? response.content
      : JSON.stringify(response.content);
  }

  async extractPreferences(
    history: ChatMessage[]
  ): Promise<Record<string, unknown>> {
    const conversationText = history
      .map((m) => `${m.role === "user" ? "User" : "AI"}: ${m.text}`)
      .join("\n");

    const response = await this.model.invoke([
      new HumanMessage(EXTRACT_PREFERENCES_PROMPT + conversationText),
    ]);

    const text =
      typeof response.content === "string"
        ? response.content
        : JSON.stringify(response.content);

    try {
      return JSON.parse(text.replace(/```json\n?/g, "").replace(/```\n?/g, ""));
    } catch {
      return { raw: text };
    }
  }
}
