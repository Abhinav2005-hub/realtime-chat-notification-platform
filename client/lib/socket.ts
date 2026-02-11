import { io, Socket } from "socket.io-client";

let socket: any;

export const connectSocket = (token: string) => {
  socket = io("http://localhost:5000", {
    auth: {
      token: token,
    },
  });

  socket.on("connect", () => {
    console.log("Socket connected:", socket.id);
  });

  socket.on("connect_error",  (err: any) => {
    console.log("Socket connection error:", err.message);
  });

  return socket;
};

export const getSocket = () => socket;
