import { randomUUID } from "node:crypto";
import mongoose, { Model, Schema, Types } from "mongoose";
import { createGeminiModel } from "../core/model.js";
import { responseContentToText } from "../gen_engine/content.js";
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

const MAX_ARRAY_ITEMS = 12;
const MAX_OBJECT_KEYS = 20;
const MAX_STRING_LENGTH = 280;
const MAX_DEPTH = 4;
const MIN_DESCRIPTION_LENGTH = 320;
const MAX_GENERATION_ATTEMPTS = 3;
const REQUIRED_MECHANICS_SIGNAL_GROUPS: Array<{
  label: string;
  synonyms: string[];
}> = [
  {
    label: "win condition",
    synonyms: [
      "win condition",
      "winning condition",
      "victory condition",
      "victory goal",
      "how to win",
      "success condition",
    ],
  },
  {
    label: "lose condition",
    synonyms: [
      "lose condition",
      "loss condition",
      "failure condition",
      "defeat condition",
      "how to lose",
      "fail state",
      "game over when",
    ],
  },
  {
    label: "score system",
    synonyms: [
      "score",
      "scores",
      "scoring",
      "score system",
      "points",
      "point value",
      "point values",
    ],
  },
  {
    label: "cooldown/frequency",
    synonyms: [
      "cooldown",
      "cool down",
      "recharge",
      "frequency",
      "interval",
      "timer",
      "rate limit",
    ],
  },
  {
    label: "controls",
    synonyms: [
      "control",
      "controls",
      "input",
      "movement",
      "arrow keys",
      "wasd",
      "tap",
      "touch",
    ],
  },
];

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
  ): Promise<string> {
    const user = await this.findUserById(userId);
    if (!user) {
      throw new StorytellingUserNotFoundError(userId);
    }

    const preferenceSnapshot = buildPreferenceSnapshot(user);
    const variationSeed = randomUUID();
    const prompt = buildRetroArcadeStoryPrompt({
      userId,
      variationSeed,
      preferenceSnapshot,
    });

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= MAX_GENERATION_ATTEMPTS; attempt += 1) {
      try {
        const response = await this.model.invoke(prompt);
        const rawOutput = responseContentToText(response.content);
        return normalizeDescriptionFromModelOutput(rawOutput);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
      }
    }

    throw lastError ?? new Error("Storytelling engine generation failed");
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

  if (normalized.length < MIN_DESCRIPTION_LENGTH) {
    throw new Error("Storytelling engine output is too short");
  }
  if (!normalized.includes("Reference games:")) {
    throw new Error("Storytelling engine output missing reference games line");
  }
  if (!normalized.includes("MECHANICS SPEC:")) {
    throw new Error("Storytelling engine output missing MECHANICS SPEC block");
  }
  if (!normalized.includes("STYLE SPEC:")) {
    throw new Error("Storytelling engine output missing STYLE SPEC block");
  }

  const mechanicsPos = normalized.indexOf("MECHANICS SPEC:");
  const stylePos = normalized.indexOf("STYLE SPEC:");
  if (stylePos <= mechanicsPos) {
    throw new Error("Storytelling engine output has invalid section order");
  }

  const mechanicsContent = normalized
    .slice(mechanicsPos, stylePos)
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
  for (const signalGroup of REQUIRED_MECHANICS_SIGNAL_GROUPS) {
    const hasAnySignal = signalGroup.synonyms.some((synonym) =>
      mechanicsContent.includes(synonym),
    );
    if (!hasAnySignal) {
      throw new Error(
        `Storytelling engine output missing mechanics signal: ${signalGroup.label}`,
      );
    }
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
