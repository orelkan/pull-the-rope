import React, { useState, useEffect } from "react";
import socketIOClient from "socket.io-client";
import { Rooms } from '@pull-the-rope/common';

const ENDPOINT = "http://127.0.0.1:5000";
const socket = socketIOClient(ENDPOINT);

function App() {
  const [rooms, setRooms] = useState<Rooms>({});
  const [roomName, setRoomName] = useState<string>('');

  useEffect(() => {
    socket.on("sendRooms", (data: Rooms) => {
      setRooms(data);
    });
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

  return (
    <div>
      <div>
        <input type="text" value={roomName} onChange={(e) => updateRoomName(e)} placeholder="Room Name" />
        <button onClick={createRoom}>Create Room</button>
      </div>
      {Object.entries(rooms).length > 0 ? Object.entries(rooms).map(([key, value]) => (
        <div>
          <div>{value.id}</div>
          <div>{value.name}</div>
          <div>{value.playersId}</div>
        </div>
      )) :
        <div>
          There is no rooms.
      </div>}
    </div>
  );
}

export default App;