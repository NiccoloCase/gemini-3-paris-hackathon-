import {
  buildWebGamePrompt,
  buildWebGameRepairPrompt,
} from "./prompts.js";
import { createGeminiModel, GEMINI_FIXED_MODEL } from "../core/model.js";
import { enforceSquareCanvasHtml, extractHtml } from "./html.js";
import { responseContentToText } from "./content.js";

type LlmLike = {
  invoke(prompt: string): Promise<{ content: unknown }>;
};

type GenEngineServiceOptions = {
  apiKey: string;
  model?: LlmLike;
};

export class GenEngineService {
  private readonly model: LlmLike;

  constructor(options: GenEngineServiceOptions) {
    this.model = options.model ?? createGeminiModel(options.apiKey);
  }

  async generateFromPrompt(prompt: string): Promise<{ output: unknown }> {
    const response = await this.model.invoke(prompt);
    return { output: response.content };
  }

  async generateWebGameHtml(
    gameDescription: string,
    squareSize: number,
  ): Promise<{ model: string; html: string; size: number }> {
    const prompt = buildWebGamePrompt(gameDescription, squareSize);
    const html = await this.generateHtmlFromPrompt(prompt, squareSize);
    return {
      model: GEMINI_FIXED_MODEL,
      html,
      size: squareSize,
    };
  }

  async repairWebGameHtml(params: {
    gameDescription: string;
    squareSize: number;
    previousHtml: string;
    errorSummary: string[];
    iteration: number;
  }): Promise<{ model: string; html: string; size: number }> {
    const prompt = buildWebGameRepairPrompt(params);
    const html = await this.generateHtmlFromPrompt(prompt, params.squareSize);
    return {
      model: GEMINI_FIXED_MODEL,
      html,
      size: params.squareSize,
    };
  }

  private async generateHtmlFromPrompt(
    prompt: string,
    squareSize: number,
  ): Promise<string> {
    const response = await this.model.invoke(prompt);
    const rawOutput = responseContentToText(response.content);
    const generatedHtml = extractHtml(rawOutput);
    return enforceSquareCanvasHtml(generatedHtml, squareSize);
  }
}
