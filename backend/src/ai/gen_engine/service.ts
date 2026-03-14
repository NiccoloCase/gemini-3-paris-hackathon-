import {
  buildWebGamePrompt,
  createGeminiModel,
  enforceSquareCanvasHtml,
  extractHtml,
  responseContentToText,
  GEMINI_FIXED_MODEL,
} from "../helpers.js";

type GenEngineServiceOptions = {
  apiKey: string;
};

export class GenEngineService {
  private readonly model;

  constructor(options: GenEngineServiceOptions) {
    this.model = createGeminiModel(options.apiKey);
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
    const response = await this.model.invoke(prompt);
    const rawOutput = responseContentToText(response.content);
    const generatedHtml = extractHtml(rawOutput);
    const html = enforceSquareCanvasHtml(generatedHtml, squareSize);
    return {
      model: GEMINI_FIXED_MODEL,
      html,
      size: squareSize,
    };
  }
}
