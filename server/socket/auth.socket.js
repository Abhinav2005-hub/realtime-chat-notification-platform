import jwt from "jsonwebtoken";

export const socketAuth = (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;

    console.log("Socket auth token:", token);

    if (!token) {
      return next(new Error("Authentication error: token missing"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    socket.userId = decoded.userId;

    console.log("SOCKET DECODED JWT:", decoded);

    next();
  } catch (error) {
    console.error("Socket auth error:", error.message);
    next(new Error("Authentication error"));
  }
};
