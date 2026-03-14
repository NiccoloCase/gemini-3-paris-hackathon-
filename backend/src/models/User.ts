import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  username: string;
  preferences: Record<string, unknown>;
  onboardingCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true },
    preferences: { type: Schema.Types.Mixed, default: {} },
    onboardingCompleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>("User", UserSchema);
