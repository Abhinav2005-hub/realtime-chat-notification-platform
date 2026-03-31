"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { connectSocket, disconnectSocket } from "@/lib/socket";
import { useAuth } from "@/context/AuthContext";

const SocketContext = createContext<Socket | null>(null);

  export const SocketProvider = ({
    children,
  }: {
    children: React.ReactNode;
  }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const { token, isAuthReady } = useAuth();

    useEffect(() => {
      if (!isAuthReady) return;

      if (!token) {
        disconnectSocket();
        setSocket(null);
        return;
      }

      const newSocket = connectSocket(token);
      setSocket(newSocket);

      return () => {
        disconnectSocket();
        setSocket(null);
      };
    }, [token, isAuthReady]);
    return (
      <SocketContext.Provider value={socket}>
        {children}
      </SocketContext.Provider>
    );
  };

  export const useSocket = () => {
    return useContext(SocketContext);
  };