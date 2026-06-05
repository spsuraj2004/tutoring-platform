import { io } from "socket.io-client";

const socket = io(
  "https://tutoring-platform-2ach.onrender.com/",
  {
    transports: ["websocket"],
  }
);

export default socket;