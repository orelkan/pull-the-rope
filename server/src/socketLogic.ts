import { Socket, Server } from "socket.io";
import { v4 as uuid } from 'uuid';

interface GameSocket extends Socket {
  roomId: string;
  inLobby: boolean;
}

interface Room {
  name: string,
  id: string,
  players: Socket[]
}

const users: Record<string, GameSocket> = {};
const rooms: Record<string, Room> = {};

function joinSocketToRoom(socket: GameSocket, roomId: string) {
  socket.join(roomId);
  socket.inLobby = false;
  socket.roomId = roomId;
  rooms[roomId].players.push(socket);
}

export default function initSocket(io: Server) {
  function onConnection(socket: GameSocket) {
    console.log('New client connected:', socket.id);
    socket.inLobby = true;
    users[socket.id] = socket;

    socket.emit("sendRooms", rooms);

    socket.on("createRoom", (roomName: string) => {
      const room: Room = {
        name: roomName,
        id: uuid(),
        players: []
      };
      rooms[room.id] = room;
      joinSocketToRoom(socket, room.id);
      socket.emit("roomCreated", room);
    });

    socket.on("joinRoom", (roomId: string) => {
      const room = rooms[roomId];
      if (room && (room.players.length === 1) && (room.players[0].id !== socket.id)) {
        joinSocketToRoom(socket, roomId);
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