import { Server as HttpServer } from "node:http";
import { Server, Socket } from "socket.io";
import { logInfo } from "./core/logger.js";

export interface LobbyUser {
  id: string;
  username: string;
  avatar: string;
  status: "Playing" | "Idle" | "In Match" | "Generating Game";
  game: string | null;
}

const AVATARS = ["🤖", "🧝", "👾", "🧙", "🦁", "💀", "👑", "🧘", "🎮", "🦊", "🐱", "🌀", "⚡", "🎸", "🦉", "🌙"];

const lobbyUsers = new Map<string, LobbyUser>();

export function initSocket(httpServer: HttpServer) {
  const io = new Server(httpServer, {
    cors: { origin: "*" },
  });

  io.on("connection", (socket: Socket) => {
    logInfo("socket_connected", { socketId: socket.id });

    socket.on("lobby:join", (data: { username: string }) => {
      const user: LobbyUser = {
        id: socket.id,
        username: data.username || "Anonymous",
        avatar: AVATARS[Math.floor(Math.random() * AVATARS.length)],
        status: "Idle",
        game: null,
      };
      lobbyUsers.set(socket.id, user);

      // Send full user list to the new user
      socket.emit("lobby:users", Array.from(lobbyUsers.values()));
      // Broadcast the new user to everyone else
      socket.broadcast.emit("lobby:user_joined", user);

      logInfo("lobby_join", { username: user.username, online: lobbyUsers.size });
    });

    socket.on("lobby:update_status", (data: { status: LobbyUser["status"]; game?: string }) => {
      const user = lobbyUsers.get(socket.id);
      if (!user) return;
      user.status = data.status;
      user.game = data.game ?? null;
      io.emit("lobby:user_updated", user);
    });

    socket.on("disconnect", () => {
      const user = lobbyUsers.get(socket.id);
      lobbyUsers.delete(socket.id);
      if (user) {
        io.emit("lobby:user_left", { id: socket.id });
        logInfo("lobby_leave", { username: user.username, online: lobbyUsers.size });
      }
    });
  });

  return io;
}
