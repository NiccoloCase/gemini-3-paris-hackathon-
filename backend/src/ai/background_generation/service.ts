import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { logInfo } from "../../core/logger.js";

type BackgroundGenerationServiceOptions = {
  apiKey: string;
  model?: string;
  outputDir?: string;
  publicBasePath?: string;
};

type GenerateAndStoreBackgroundParams = {
  userId: string;
  traceId: string;
  gameDescription: string;
};

export type GeneratedBackgroundAsset = {
  publicUrl: string;
  absolutePath: string;
  mimeType: string;
  sizeBytes: number;
};

const DEFAULT_MODEL = process.env.NANOBANANA_MODEL || "gemini-2.5-flash-image-preview";
const DEFAULT_OUTPUT_DIR = path.resolve(process.cwd(), "public/generated-backgrounds");
const DEFAULT_PUBLIC_BASE_PATH = "/assets/generated-backgrounds";
const MAX_PROMPT_DESCRIPTION_CHARS = 1800;

export class BackgroundGenerationService {
  private readonly apiKey: string;
  private readonly model: string;
  private readonly outputDir: string;
  private readonly publicBasePath: string;

  constructor(options: BackgroundGenerationServiceOptions) {
    this.apiKey = options.apiKey;
    this.model = options.model ?? DEFAULT_MODEL;
    this.outputDir = options.outputDir ?? DEFAULT_OUTPUT_DIR;
    this.publicBasePath = options.publicBasePath ?? DEFAULT_PUBLIC_BASE_PATH;
  }

  async generateAndStoreBackground(
    params: GenerateAndStoreBackgroundParams,
  ): Promise<GeneratedBackgroundAsset> {
    const startedAt = Date.now();
    const prompt = buildBackgroundPrompt(params.gameDescription);

    logInfo("ai_background_generation_started", {
      traceId: params.traceId,
      userId: params.userId,
      model: this.model,
      promptLength: prompt.length,
    });

    const image = await this.generateImage(prompt);
    await mkdir(this.outputDir, { recursive: true });

    const extension = mimeTypeToFileExtension(image.mimeType);
    const safeUserId = sanitizeForFilename(params.userId);
    const shortTraceId = sanitizeForFilename(params.traceId).slice(0, 12) || "trace";
    const filename = `${safeUserId}-${Date.now()}-${shortTraceId}.${extension}`;
    const absolutePath = path.join(this.outputDir, filename);

    await writeFile(absolutePath, image.bytes);

    const publicUrl = `${this.publicBasePath}/${filename}`;
    logInfo("ai_background_generation_completed", {
      traceId: params.traceId,
      userId: params.userId,
      model: this.model,
      mimeType: image.mimeType,
      sizeBytes: image.bytes.byteLength,
      durationMs: Date.now() - startedAt,
      publicUrl,
    });

    return {
      publicUrl,
      absolutePath,
      mimeType: image.mimeType,
      sizeBytes: image.bytes.byteLength,
    };
  }

  private async generateImage(
    prompt: string,
  ): Promise<{ mimeType: string; bytes: Buffer }> {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
      this.model,
    )}:generateContent?key=${encodeURIComponent(this.apiKey)}`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          responseModalities: ["IMAGE", "TEXT"],
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Background image generation failed with status ${response.status}: ${errorText.slice(0, 400)}`,
      );
    }

    const payload = (await response.json()) as GeminiContentResponse;
    const inlineData = extractInlineImagePart(payload);
    if (!inlineData) {
      throw new Error("Background image generation response does not include inline image data");
    }

    return {
      mimeType: inlineData.mimeType || "image/png",
      bytes: Buffer.from(inlineData.data, "base64"),
    };
  }
}

function buildBackgroundPrompt(gameDescription: string): string {
  const condensedDescription = gameDescription
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_PROMPT_DESCRIPTION_CHARS);

  return [
    "Create a single 2D retro arcade background image for a browser game.",
    "No text, no logos, no UI overlays, no characters in foreground.",
    "High contrast, readable, gameplay-friendly composition.",
    "Deliver only the generated image.",
    "",
    "Game concept:",
    condensedDescription,
  ].join("\n");
}

function sanitizeForFilename(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "") || "user";
}

function mimeTypeToFileExtension(mimeType: string): string {
  if (mimeType.includes("png")) return "png";
  if (mimeType.includes("jpeg") || mimeType.includes("jpg")) return "jpg";
  if (mimeType.includes("webp")) return "webp";
  return "png";
}

type GeminiContentResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        inlineData?: {
          data: string;
          mimeType?: string;
        };
      }>;
    };
  }>;
};

function extractInlineImagePart(
  payload: GeminiContentResponse,
): { data: string; mimeType?: string } | null {
  const candidates = payload.candidates ?? [];
  for (const candidate of candidates) {
    const parts = candidate.content?.parts ?? [];
    for (const part of parts) {
      if (part.inlineData?.data) {
        return part.inlineData;
      }
    }
  }
  return null;
}
