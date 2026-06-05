import { io } from "socket.io-client";

const socket = io(
  "https://tutoring-platform-kcl0kw805-spsuraj2004s-projects.vercel.app/",
  {
    transports: ["websocket"],
  }
);

export default socket;