import { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";

export interface LobbyUser {
  id: string;
  username: string;
  avatar: string;
  status: "Playing" | "Idle" | "In Match" | "Generating Game";
  game: string | null;
}

export function useLobby(username: string) {
  const [users, setUsers] = useState<LobbyUser[]>([]);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io("http://localhost:3000");
    socketRef.current = socket;

    socket.on("connect", () => {
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
    };
  }, [username]);

  const updateStatus = (status: LobbyUser["status"], game?: string) => {
    socketRef.current?.emit("lobby:update_status", { status, game });
  };

  return { users, updateStatus };
}
