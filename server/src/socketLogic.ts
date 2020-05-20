import { Socket, Server } from "socket.io";
import { v4 as uuid } from 'uuid';

interface GameSocket extends Socket {
  roomId: string
}

interface Room {
  name: string,
  id: string,
  players: Socket[]
}

const users: Record<string, GameSocket> = {};
const waitingList: Socket[] = [];
const rooms: Record<string, Room> = {};

function joinSocketsToRoom(socket1: GameSocket, socket2: GameSocket, roomId: string) {
  socket1.join(roomId);
  socket2.join(roomId);
  socket1.roomId = roomId;
  socket2.roomId = roomId;
}

export default function initSocket(io: Server) {
  function onConnection(socket: GameSocket) {
    console.log('New client connected:', socket.id);
    users[socket.id] = socket;

    if (waitingList.length > 0) {
      const waitingSocket = waitingList.shift() as GameSocket;
      const roomId = `${socket.id}-${waitingSocket.id}`;
      joinSocketsToRoom(socket, waitingSocket, roomId);
      io.to(roomId).emit("InQueue", false);
      console.log('Clients connected to room:', roomId);
    } else {
      socket.emit("InQueue", true);
      waitingList.push(socket);
    }

    socket.on("createRoom", (roomName: string) => {
      const room: Room = {
        name: roomName,
        id: uuid(),
        players: [socket]
      };
      rooms[room.id] = room;
      socket.emit("roomCreated", room);
    });

    socket.on("joinRoom", (roomId: string) => {
      const room = rooms[roomId];
      if (room && (room.players.length === 1) && (room.players[0].id !== socket.id)) {
        room.players.push(socket);
        socket.emit("joinedRoom", room);
      }
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
      const room = rooms[socket.roomId];
      if (room) {
        io.to(socket.roomId).emit("roomUserDisconnected");
        delete rooms[socket.roomId];
      }
      delete users[socket.id];
    });
  }

  io.on("connection", onConnection);
}