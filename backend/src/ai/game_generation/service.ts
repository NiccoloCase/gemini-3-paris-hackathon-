import { GeneratedGameModel, createGeneratedGameModel } from "./model.js";
import { VerifiedWebGameService } from "../gen_engine/verified-webgame.service.js";
import { StorytellingEngineService } from "../storytelling_engine/service.js";

type GameGenerationWorkflowServiceOptions = {
  storytellingEngineService: StorytellingEngineService;
  verifiedWebGameService: VerifiedWebGameService;
  generatedGameModel?: GeneratedGameModel;
};

type GenerateAndStoreGameForUserParams = {
  userId: string;
  size: number;
  traceId: string;
};

export type GenerateAndStoreGameForUserResult = {
  gameId: string;
  traceId: string;
  userId: string;
  gameDescription: string;
  html: string;
  size: number;
  model: string;
  attempts: number;
  createdAt: string;
};

export class GameGenerationWorkflowService {
  private readonly storytellingEngineService: StorytellingEngineService;
  private readonly verifiedWebGameService: VerifiedWebGameService;
  private readonly generatedGameModel: GeneratedGameModel;

  constructor(options: GameGenerationWorkflowServiceOptions) {
    this.storytellingEngineService = options.storytellingEngineService;
    this.verifiedWebGameService = options.verifiedWebGameService;
    this.generatedGameModel = options.generatedGameModel ?? createGeneratedGameModel();
  }

  async generateAndStoreGameForUser(
    params: GenerateAndStoreGameForUserParams,
  ): Promise<GenerateAndStoreGameForUserResult> {
    const gameDescription =
      await this.storytellingEngineService.generatePersonalizedRetroGameDescription(
        params.userId,
      );

    const generatedWebGame = await this.verifiedWebGameService.generateVerifiedWebGame({
      gameDescription,
      size: params.size,
      traceId: params.traceId,
    });

    const savedGame = await this.generatedGameModel.create({
      traceId: params.traceId,
      userId: params.userId,
      gameDescription,
      html: generatedWebGame.html,
      size: generatedWebGame.size,
      model: generatedWebGame.model,
      attempts: generatedWebGame.attempts,
    });

    const savedGameCreatedAt = toIsoDate(savedGame.get("createdAt"));

    return {
      gameId: String(savedGame._id),
      traceId: params.traceId,
      userId: params.userId,
      gameDescription,
      html: generatedWebGame.html,
      size: generatedWebGame.size,
      model: generatedWebGame.model,
      attempts: generatedWebGame.attempts,
      createdAt: savedGameCreatedAt,
    };
  }
}

function toIsoDate(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    if (!Number.isNaN(date.valueOf())) return date.toISOString();
  }
  return new Date().toISOString();
}
