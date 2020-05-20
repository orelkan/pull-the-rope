import express from "express";
import http from "http";
import socketIo from "socket.io";
import initSocket from './socketLogic';

const port = process.env.PORT || 5000;
import index from "./routes/index";

const app = express();
app.use(index);

const server = http.createServer(app);

const io = socketIo(server);
initSocket(io);

server.listen(port, () => console.log(`Listening on port ${port}`));