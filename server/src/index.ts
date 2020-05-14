import express from "express";
import http from "http";
import socketIo from "socket.io";

const port = process.env.PORT || 5000;
import index from "./routes/index";
import { Socket } from "dgram";

const app = express();
app.use(index);

const server = http.createServer(app);

const io = socketIo(server);

let interval: NodeJS.Timeout;

io.on("connection", (socket: Socket) => {
  console.log("New client connected");
  if (interval) {
    clearInterval(interval);
  }
  interval = setInterval(() => getApiAndEmit(socket), 1000);
  socket.on("disconnect", () => {
    console.log("Client disconnected");
    clearInterval(interval);
  });
});

const getApiAndEmit = (socket: Socket) => {
  const response = new Date();
  // Emitting a new message. Will be consumed by the client
  socket.emit("FromAPI", response);
};

server.listen(port, () => console.log(`Listening on port ${port}`));