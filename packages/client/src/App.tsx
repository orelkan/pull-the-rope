/** @jsx jsx */
import React, { useState, useEffect } from "react";
import socketIOClient from "socket.io-client";
import { Rooms } from '@pull-the-rope/common';
import { css, jsx } from '@emotion/core'


const ENDPOINT = "http://127.0.0.1:5000";
const socket = socketIOClient(ENDPOINT);

function App() {
  const [users, setUsers] = useState<{ inLobby: boolean, id: string }[]>([]);
  const [rooms, setRooms] = useState<Rooms>({});
  const [roomName, setRoomName] = useState<string>('');

  useEffect(() => {
    socket.on("sendRooms", (data: Rooms) => {
      setRooms(data);
    });
    socket.on("sendUsers", (data: { inLobby: boolean, id: string }[]) => {
      setUsers(data);
    })
  }, []);

  const createRoom = () => {
    if (roomName) {
      socket.emit("createRoom", roomName);
      setRoomName('');
    }
  }
  const updateRoomName = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRoomName(e.target.value);
  }

  const joinRoom = (roomId: string) => {
    socket.emit("joinRoom", roomId);
  }

  const leaveRoom = (roomId: string) => {
    socket.emit("leaveRoom", roomId);
  }

  const isPlayerInRoom = () => {
    return Object.keys(rooms).map(key => rooms[key].playersId.includes(socket.id)).some(x => x === true);
  }

  const roomStyle = css`
      display: flex;
      flex-direction: column;
      align-items: center;
      border-bottom: 2px solid black;
      width: fit-content;
      background-color: aquamarine;
      margin-bottom: 1em;
  `;

  return (
    <div>
      <div>Welcome <b>{socket.id}</b></div>
      <div>
        <input type="text" value={roomName} onChange={(e) => updateRoomName(e)} placeholder="Room Name" />
        <button onClick={createRoom}>Create Room</button>
      </div>
      {Object.entries(rooms).length > 0 ? Object.entries(rooms).map(([key, room]) => (
        <div key={room.id} css={roomStyle}>
          <div>
            <span>ID: </span>
            <span>{room.id}</span>
          </div>
          <div>
            <span>Owner: </span>
            <span>{room.roomOwner}</span>
          </div>
          <div>
            <span>Players: </span>
            <span>{room.playersId}</span>
          </div>
          <div>
            <span>Name: </span>
            <span>{room.name}</span>
          </div>
          {!room.playersId.includes(socket.id) && !isPlayerInRoom() && <div>
            <button onClick={() => joinRoom(room.id)}>Join Room</button>
          </div>}
          {room.playersId.includes(socket.id) && isPlayerInRoom() && <div>
            <button onClick={() => leaveRoom(room.id)}>Leave Room</button>
          </div>}
        </div>
      )) :
        <div>
          There is no rooms.
      </div>}
      <div>Users Connected:
        {users.map(user => (
        <div key={user.id}>
          <span>inLobby: {user.inLobby.toString()}</span>
          <span>id: {user.id}</span>
        </div>
      ))}
      </div>
    </div>
  );
}

export default App;