import { Router, Request, Response } from "express";
import { logError } from "../../core/logger.js";
import { ChatService } from "./service.js";
import { User } from "../../models/User.js";

type ChatRoutesOptions = {
  apiKey: string;
  chatService?: ChatService;
};

export function createChatRoutes(options: ChatRoutesOptions): Router {
  const router = Router();
  const chatService =
    options.chatService ?? new ChatService({ apiKey: options.apiKey });

  // Start a new onboarding conversation (get first AI message)
  router.post("/start", async (_req: Request, res: Response) => {
    try {
      const firstMessage = await chatService.getNextMessage([]);
      return res.json({ message: firstMessage });
    } catch (error) {
      console.error("chat_start_error", error);
      logError("chat_start_error", error);
      return res.status(500).json({ error: "Failed to start chat" });
    }
  });

  // Send a message and get AI response
  router.post("/message", async (req: Request, res: Response) => {
    try {
      const { history } = req.body;
      if (!Array.isArray(history) || history.length === 0) {
        return res.status(400).json({ error: "Missing history array" });
      }

      const aiResponse = await chatService.getNextMessage(history);
      const isComplete = aiResponse.includes("[ONBOARDING_COMPLETE]");
      const cleanResponse = aiResponse.replace("[ONBOARDING_COMPLETE]", "").trim();

      return res.json({
        message: cleanResponse,
        isComplete,
      });
    } catch (error) {
      logError("chat_message_error", error);
      return res.status(500).json({ error: "Failed to get AI response" });
    }
  });

  // Extract preferences from conversation and save to user
  router.post("/complete", async (req: Request, res: Response) => {
    try {
      const { history, username } = req.body;
      if (!Array.isArray(history) || !username) {
        return res
          .status(400)
          .json({ error: "Missing history array or username" });
      }

      const preferences = await chatService.extractPreferences(history);

      const user = await User.findOneAndUpdate(
        { username },
        { preferences, onboardingCompleted: true },
        { upsert: true, new: true }
      );

      return res.json({ preferences: user.preferences, userId: String(user._id) });
    } catch (error) {
      logError("chat_complete_error", error);
      return res.status(500).json({ error: "Failed to extract preferences" });
    }
  });

  return router;
}
