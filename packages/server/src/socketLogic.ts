import { Server } from "socket.io";
import { v4 as uuid } from 'uuid';
import { GameSockets, Rooms, GameSocket, Room } from '@pull-the-rope/common';

const users: GameSockets = {};
let rooms: Rooms = {};

function joinSocketToRoom(socket: GameSocket, roomId: string) {
  socket.join(roomId);
  socket.inLobby = false;
  socket.roomId = roomId;
  users[socket.id] = socket;
  rooms[roomId].playersId.push(socket.id);
}

function leaveSocketFromRoom(socket: GameSocket, roomId: string) {
  const room = rooms[roomId];
  socket.leave(roomId);
  socket.inLobby = true;
  socket.roomId = undefined;
  users[socket.id] = socket;
  room.playersId = room.playersId.filter(playerId => playerId !== socket.id)
  if (room.playersId.length === 1 && room.playersId[0] !== room.roomOwner) {
    room.roomOwner = room.playersId[0];
  }
  if (room.playersId.length === 0) {
    delete rooms[roomId];
  }
}

const sendUsers = () => {
  return Object.keys(users).map(userId => ({ inLobby: users[userId] ? users[userId].inLobby : undefined, id: userId }))
}

export default function initSocket(io: Server) {
  function onConnection(socket: GameSocket) {
    console.log('New client connected:', socket.id);
    socket.inLobby = true;
    users[socket.id] = socket;

    socket.emit("sendRooms", rooms);
    io.emit("sendUsers", sendUsers());

    socket.on("createRoom", (roomName: string) => {
      if (rooms[socket.roomId!] && rooms[socket.roomId!].roomOwner === socket.id || !socket.inLobby) return;
      const room: Room = {
        name: roomName,
        id: uuid(),
        playersId: [],
        roomOwner: socket.id
      };
      rooms[room.id] = room;
      joinSocketToRoom(socket, room.id);
      // socket.emit("roomCreated", room);
      io.emit("sendRooms", rooms);
      io.emit("sendUsers", sendUsers());
    });

    socket.on("joinRoom", (roomId: string) => {
      const room = rooms[roomId];
      if (room && (room.playersId.length === 1) && (room.playersId[0] !== socket.id)) {
        joinSocketToRoom(socket, roomId);
        // socket.emit("joinedRoom", room);
        io.emit("sendRooms", rooms);
        io.emit("sendUsers", sendUsers());
      }
    });

    socket.on("leaveRoom", (roomId: string) => {
      const room = rooms[roomId];
      if (room && room.playersId.includes(socket.id)) {
        leaveSocketFromRoom(socket, room.id);
        io.emit("sendRooms", rooms);
        io.emit("sendUsers", sendUsers());
      }
    })

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
      if (socket.roomId) {
        leaveSocketFromRoom(socket, socket.id)
      }
      delete users[socket.id];
      io.emit("sendRooms", rooms);
      io.emit("sendUsers", sendUsers());
    });
  }

  io.on("connection", onConnection);
}