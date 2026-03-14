import { randomUUID } from "node:crypto";
import mongoose, { Model, Schema, Types } from "mongoose";
import { createGeminiModel } from "../core/model.js";
import { responseContentToText } from "../gen_engine/content.js";
import { logError, logInfo } from "../../core/logger.js";
import { buildRetroArcadeStoryPrompt } from "./prompts.js";

type UserRecord = Record<string, unknown>;

type LlmLike = {
  invoke(prompt: string): Promise<{ content: unknown }>;
};

type StorytellingEngineServiceOptions = {
  apiKey: string;
  model?: LlmLike;
  userModel?: Model<UserRecord>;
};

export class StorytellingUserNotFoundError extends Error {
  constructor(userId: string) {
    super(`User not found for id "${userId}"`);
    this.name = "StorytellingUserNotFoundError";
  }
}

const EXCLUDED_TOP_LEVEL_KEYS = new Set([
  "_id",
  "__v",
  "updatedat",
  "password",
  "passwordhash",
  "hash",
  "salt",
  "token",
  "refreshtoken",
  "accesstoken",
  "jwt",
  "secret",
]);

const EXCLUDED_NESTED_KEY_PATTERN =
  /(password|pass|token|secret|salt|hash|api[-_]?key|jwt|session)/i;

const MAX_ARRAY_ITEMS = 6;
const MAX_OBJECT_KEYS = 12;
const MAX_STRING_LENGTH = 180;
const MAX_DEPTH = 2;
const DEFAULT_MAX_GENERATION_ATTEMPTS = 1;

const defaultUserModel = createDefaultUserModel();

export class StorytellingEngineService {
  private readonly model: LlmLike;
  private readonly userModel: Model<UserRecord>;

  constructor(options: StorytellingEngineServiceOptions) {
    this.model = options.model ?? createGeminiModel(options.apiKey);
    this.userModel = options.userModel ?? defaultUserModel;
  }

  async generatePersonalizedRetroGameDescription(
    userId: string,
    options: { traceId?: string } = {},
  ): Promise<string> {
    const traceId = options.traceId;
    const generationStartedAt = Date.now();
    let currentPhase = "load_user";
    let currentAttempt = 0;
    const maxAttempts = readPositiveIntFromEnv(
      "STORYTELLING_MAX_GENERATION_ATTEMPTS",
      DEFAULT_MAX_GENERATION_ATTEMPTS,
    );

    logInfo("storytelling_generation_started", {
      traceId,
      userId,
      maxAttempts,
    });

    const heartbeat = setInterval(() => {
      logInfo("storytelling_generation_heartbeat", {
        traceId,
        userId,
        currentPhase,
        currentAttempt,
        elapsedMs: Date.now() - generationStartedAt,
      });
    }, 10_000);

    try {
      const user = await this.findUserById(userId);
      if (!user) {
        throw new StorytellingUserNotFoundError(userId);
      }

      const preferenceSnapshot = buildPreferenceSnapshot(user);
      logInfo("storytelling_user_loaded", {
        traceId,
        userId,
        profileFieldCount: Object.keys(user).length,
        preferenceFieldCount: Object.keys(preferenceSnapshot).length,
      });

      const variationSeed = randomUUID();
      const prompt = buildRetroArcadeStoryPrompt({
        userId,
        variationSeed,
        preferenceSnapshot,
      });
      logInfo("storytelling_prompt_built", {
        traceId,
        userId,
        variationSeed,
        promptLength: prompt.length,
      });

      let lastError: Error | null = null;

      for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
        currentAttempt = attempt;
        currentPhase = "attempt_started";
        const attemptStartedAt = Date.now();
        let rawOutputLength = 0;
        let rawOutputPreview = "";

        logInfo("storytelling_attempt_started", {
          traceId,
          userId,
          attempt,
          maxAttempts,
        });
        try {
          currentPhase = "model_invoke";
          const response = await this.model.invoke(prompt);

          currentPhase = "parse_response";
          const rawOutput = responseContentToText(response.content);
          rawOutputLength = rawOutput.length;
          rawOutputPreview = rawOutput.slice(0, 300).replace(/\s+/g, " ").trim();

          currentPhase = "normalize_output";
          const description = normalizeDescriptionFromModelOutput(rawOutput);

          logInfo("storytelling_attempt_succeeded", {
            traceId,
            userId,
            attempt,
            durationMs: Date.now() - attemptStartedAt,
            rawOutputLength,
            normalizedLength: description.length,
          });

          logInfo("storytelling_generation_completed", {
            traceId,
            userId,
            totalDurationMs: Date.now() - generationStartedAt,
            attempt,
          });

          return description;
        } catch (error) {
          lastError = error instanceof Error ? error : new Error(String(error));
          logError("storytelling_attempt_failed", lastError, {
            traceId,
            userId,
            attempt,
            maxAttempts,
            currentPhase,
            durationMs: Date.now() - attemptStartedAt,
            rawOutputLength,
            rawOutputPreview,
          });
        }
      }

      logError(
        "storytelling_generation_failed",
        lastError ?? new Error("Storytelling engine generation failed"),
        {
          traceId,
          userId,
          maxAttempts,
          totalDurationMs: Date.now() - generationStartedAt,
        },
      );

      throw lastError ?? new Error("Storytelling engine generation failed");
    } finally {
      clearInterval(heartbeat);
    }
  }

  private async findUserById(userId: string): Promise<UserRecord | null> {
    const filters: Array<Record<string, unknown>> = [
      { _id: userId },
      { userId },
      { id: userId },
    ];

    if (Types.ObjectId.isValid(userId)) {
      filters.unshift({ _id: new Types.ObjectId(userId) });
    }

    return this.userModel
      .findOne({ $or: filters } as Record<string, unknown>)
      .lean<UserRecord>()
      .exec();
  }
}

function createDefaultUserModel(): Model<UserRecord> {
  const collection =
    process.env.STORYTELLING_USERS_COLLECTION ||
    process.env.USERS_COLLECTION ||
    "users";

  const schema = new Schema<UserRecord>(
    {},
    {
      strict: false,
      collection,
    },
  );

  const existing = mongoose.models.StorytellingUser as Model<UserRecord> | undefined;
  if (existing) return existing;

  return mongoose.model<UserRecord>("StorytellingUser", schema);
}

function buildPreferenceSnapshot(user: UserRecord): Record<string, unknown> {
  const snapshot: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(user)) {
    if (!isEligibleTopLevelKey(key)) continue;
    const cleaned = sanitizePreferenceValue(value, key, 0);
    if (cleaned !== undefined) {
      snapshot[key] = cleaned;
    }
  }

  return snapshot;
}

function isEligibleTopLevelKey(key: string): boolean {
  const lowered = key.toLowerCase();
  if (EXCLUDED_TOP_LEVEL_KEYS.has(lowered)) return false;
  if (lowered.startsWith("_")) return false;
  return true;
}

function sanitizePreferenceValue(
  value: unknown,
  currentKey: string,
  depth: number,
): unknown {
  if (depth > MAX_DEPTH || value === null || value === undefined) {
    return undefined;
  }

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return sanitizeScalar(value);
  }

  if (Array.isArray(value)) {
    const items = value
      .slice(0, MAX_ARRAY_ITEMS)
      .map((item) => sanitizePreferenceValue(item, currentKey, depth + 1))
      .filter((item) => item !== undefined);

    return items.length > 0 ? items : undefined;
  }

  if (typeof value === "object") {
    const output: Record<string, unknown> = {};
    let count = 0;

    for (const [key, nestedValue] of Object.entries(value)) {
      if (count >= MAX_OBJECT_KEYS) break;
      if (!shouldKeepNestedKey(currentKey, key, depth)) continue;
      const cleaned = sanitizePreferenceValue(nestedValue, key, depth + 1);
      if (cleaned === undefined) continue;
      output[key] = cleaned;
      count += 1;
    }

    return Object.keys(output).length > 0 ? output : undefined;
  }

  return undefined;
}

function shouldKeepNestedKey(
  parentKey: string,
  key: string,
  depth: number,
): boolean {
  const loweredKey = key.toLowerCase();
  if (loweredKey.startsWith("_")) return false;
  if (EXCLUDED_NESTED_KEY_PATTERN.test(parentKey)) return false;
  if (EXCLUDED_NESTED_KEY_PATTERN.test(key)) return false;
  if (depth > MAX_DEPTH) return false;
  return true;
}

function sanitizeScalar(value: string | number | boolean): string | number | boolean {
  if (typeof value !== "string") return value;
  const trimmed = value.trim().replace(/\s+/g, " ");
  if (!trimmed) return "";
  return trimmed.slice(0, MAX_STRING_LENGTH);
}

function normalizeDescriptionFromModelOutput(rawOutput: string): string {
  const trimmed = rawOutput.trim();
  if (!trimmed) {
    throw new Error("Storytelling engine model output is empty");
  }

  const candidate = extractDescriptionCandidate(trimmed);
  const normalized = candidate.replace(/\s+/g, " ").trim();
  if (!normalized) {
    throw new Error("Storytelling engine output is empty after normalization");
  }
  return normalized;
}

function extractDescriptionCandidate(text: string): string {
  const fenced = text.match(/```(?:text|markdown|md|json)?\s*([\s\S]*?)```/i);
  const candidates = [fenced?.[1]?.trim(), text].filter(
    (value): value is string => Boolean(value && value.trim()),
  );

  for (const candidate of candidates) {
    const jsonDerived = extractDescriptionFromJson(candidate);
    if (jsonDerived) return jsonDerived;

    const unquoted = unwrapQuotedText(candidate);
    if (unquoted) return unquoted;
  }

  return text;
}

function extractDescriptionFromJson(input: string): string | null {
  const parsedDirect = tryParseJson(input);
  const parsedObjectOnly = tryParseJson(extractLikelyJsonObject(input) ?? "");
  const parsed = parsedDirect ?? parsedObjectOnly;

  if (typeof parsed === "string") {
    return parsed.trim();
  }

  if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
    const record = parsed as Record<string, unknown>;
    const directDescription = record.description;
    if (typeof directDescription === "string" && directDescription.trim()) {
      return directDescription.trim();
    }

    const altDescription = record.gameDescription;
    if (typeof altDescription === "string" && altDescription.trim()) {
      return altDescription.trim();
    }
  }

  return null;
}

function tryParseJson(input: string): unknown {
  if (!input.trim()) return null;
  try {
    return JSON.parse(input);
  } catch {
    return null;
  }
}

function extractLikelyJsonObject(text: string): string | null {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  return text.slice(start, end + 1);
}

function unwrapQuotedText(text: string): string {
  const trimmed = text.trim();
  if (trimmed.length >= 2 && trimmed.startsWith('"') && trimmed.endsWith('"')) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
}

function readPositiveIntFromEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const value = Number(raw);
  if (!Number.isInteger(value) || value <= 0) return fallback;
  return value;
}
