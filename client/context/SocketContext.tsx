"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { connectSocket, disconnectSocket } from "@/lib/socket";
import { TOKEN_KEY } from "@/lib/constants";

const SocketContext = createContext<Socket | null>(null);

  export const SocketProvider = ({
    children,
  }: {
    children: React.ReactNode;
  }) => {
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
      const token = localStorage.getItem(TOKEN_KEY);
      if(!token) return;

      const newSocket = connectSocket(token);
      setSocket(newSocket);

      return () => {
        disconnectSocket();
      };
    }, []);
    return (
      <SocketContext.Provider value={socket}>
        {children}
      </SocketContext.Provider>
    );
  };

  export const useSocket = () => {
    return useContext(SocketContext);
  };