import { GeneratedGameModel, createGeneratedGameModel } from "./model.js";
import { VerifiedWebGameService } from "../gen_engine/verified-webgame.service.js";
import { StorytellingEngineService } from "../storytelling_engine/service.js";
import { logInfo } from "../../core/logger.js";

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
    const workflowStartedAt = Date.now();
    let phase = "storytelling";
    const heartbeat = setInterval(() => {
      logInfo("ai_game_generation_workflow_heartbeat", {
        traceId: params.traceId,
        userId: params.userId,
        phase,
        elapsedMs: Date.now() - workflowStartedAt,
      });
    }, 10_000);

    logInfo("ai_game_generation_workflow_started", {
      traceId: params.traceId,
      userId: params.userId,
      size: params.size,
    });

    try {
      const storytellingStartedAt = Date.now();
      logInfo("ai_game_generation_storytelling_started", {
        traceId: params.traceId,
        userId: params.userId,
      });

      const gameDescription =
        await this.storytellingEngineService.generatePersonalizedRetroGameDescription(
          params.userId,
          { traceId: params.traceId },
        );

      logInfo("ai_game_generation_storytelling_completed", {
        traceId: params.traceId,
        userId: params.userId,
        durationMs: Date.now() - storytellingStartedAt,
        gameDescriptionLength: gameDescription.length,
      });

      phase = "webgame_generation";
      const webGameStartedAt = Date.now();
      logInfo("ai_game_generation_webgame_started", {
        traceId: params.traceId,
        userId: params.userId,
        size: params.size,
      });

      const generatedWebGame =
        await this.verifiedWebGameService.generateVerifiedWebGame({
          gameDescription,
          size: params.size,
          traceId: params.traceId,
        });

      logInfo("ai_game_generation_webgame_completed", {
        traceId: params.traceId,
        userId: params.userId,
        durationMs: Date.now() - webGameStartedAt,
        attempts: generatedWebGame.attempts,
        htmlLength: generatedWebGame.html.length,
      });

      phase = "db_persist";
      const dbPersistStartedAt = Date.now();
      logInfo("ai_game_generation_db_persist_started", {
        traceId: params.traceId,
        userId: params.userId,
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

      logInfo("ai_game_generation_db_persist_completed", {
        traceId: params.traceId,
        userId: params.userId,
        durationMs: Date.now() - dbPersistStartedAt,
        gameId: String(savedGame._id),
      });

      const savedGameCreatedAt = toIsoDate(savedGame.get("createdAt"));

      phase = "completed";
      logInfo("ai_game_generation_workflow_completed", {
        traceId: params.traceId,
        userId: params.userId,
        totalDurationMs: Date.now() - workflowStartedAt,
      });

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
    } finally {
      clearInterval(heartbeat);
    }
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
