import mongoose, { Model, Schema } from "mongoose";

export type GeneratedGameRecord = Record<string, unknown>;

const generatedGameSchema = new Schema<GeneratedGameRecord>(
  {
    traceId: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    gameDescription: { type: String, required: true },
    html: { type: String, required: true },
    backgroundImageUrl: { type: String, required: false, default: null },
    size: { type: Number, required: true },
    model: { type: String, required: true },
    attempts: { type: Number, required: true },
  },
  {
    collection:
      process.env.GENERATED_GAMES_COLLECTION ||
      process.env.AI_GENERATED_GAMES_COLLECTION ||
      "generated_games",
    timestamps: true,
  },
);

export type GeneratedGameModel = Model<GeneratedGameRecord>;

export function createGeneratedGameModel(): GeneratedGameModel {
  const existing = mongoose.models.GeneratedGame as GeneratedGameModel | undefined;
  if (existing) return existing;
  return mongoose.model<GeneratedGameRecord>("GeneratedGame", generatedGameSchema);
}
