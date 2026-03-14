import { createContext, useContext, useEffect, useState, useRef, ReactNode, createElement } from "react";
import { io, Socket } from "socket.io-client";

export interface LobbyUser {
  id: string;
  username: string;
  avatar: string;
  status: "Playing" | "Idle" | "In Match" | "Generating Game";
  game: string | null;
}

interface LobbyContextValue {
  users: LobbyUser[];
  socketId: string | null;
  updateStatus: (status: LobbyUser["status"], game?: string) => void;
}

const LobbyContext = createContext<LobbyContextValue | null>(null);

export function LobbyProvider({ username, children }: { username: string; children: ReactNode }) {
  const [users, setUsers] = useState<LobbyUser[]>([]);
  const [socketId, setSocketId] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!username) return;

    const socket = io("http://localhost:3000");
    socketRef.current = socket;

    socket.on("connect", () => {
      setSocketId(socket.id ?? null);
      socket.emit("lobby:join", { username });
    });

    socket.on("lobby:users", (userList: LobbyUser[]) => {
      setUsers(userList);
    });

    socket.on("lobby:user_joined", (user: LobbyUser) => {
      setUsers((prev) => {
        if (prev.find((u) => u.id === user.id)) return prev;
        return [...prev, user];
      });
    });

    socket.on("lobby:user_updated", (user: LobbyUser) => {
      setUsers((prev) => prev.map((u) => (u.id === user.id ? user : u)));
    });

    socket.on("lobby:user_left", ({ id }: { id: string }) => {
      setUsers((prev) => prev.filter((u) => u.id !== id));
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setSocketId(null);
    };
  }, [username]);

  const updateStatus = (status: LobbyUser["status"], game?: string) => {
    socketRef.current?.emit("lobby:update_status", { status, game });
  };

  return createElement(LobbyContext.Provider, { value: { users, socketId, updateStatus } }, children);
}

export function useLobby() {
  const ctx = useContext(LobbyContext);
  if (!ctx) throw new Error("useLobby must be used within LobbyProvider");
  return ctx;
}
