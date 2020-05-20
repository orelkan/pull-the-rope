import React, { useState, useEffect } from "react";
import socketIOClient from "socket.io-client";
const ENDPOINT = "http://127.0.0.1:5000";

function App() {
  const [response, setResponse] = useState(false);

  useEffect(() => {
    const socket = socketIOClient(ENDPOINT);
    socket.on("InQueue", (data: boolean) => {
      setResponse(data);
    });
  }, []);

  return (
    <p>
      In Queue: {response.toString()}
    </p>
  );
}

export default App;