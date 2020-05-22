import { Server } from "socket.io";
import { v4 as uuid } from 'uuid';
import { GameSockets, Rooms, GameSocket, Room } from '@pull-the-rope/common';

const users: GameSockets = {};
let rooms: Rooms = {};

function joinSocketToRoom(socket: GameSocket, roomId: string) {
  socket.join(roomId);
  socket.inLobby = false;
  socket.roomId = roomId;
  rooms[roomId].playersId.push(socket.id)
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
        playersId: []
      };
      rooms[room.id] = room;
      joinSocketToRoom(socket, room.id);
      socket.emit("roomCreated", room);
      socket.emit("sendRooms", rooms);
    });

    socket.on("joinRoom", (roomId: string) => {
      const room = rooms[roomId];
      if (room && (room.playersId.length === 1) && (room.playersId[0] !== socket.id)) {
        joinSocketToRoom(socket, roomId);
        socket.emit("joinedRoom", room);
        socket.emit("sendRooms", rooms);
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