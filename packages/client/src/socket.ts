import socketIOClient from "socket.io-client";
const ENDPOINT = "http://127.0.0.1:5000";

export const socket = socketIOClient(ENDPOINT);

// const callbacks: ((data: any) => void)[] = [];

// socket.on("sendRooms", (data: Rooms) => {
//     callbacks.forEach(callback => {
//         callback(data);
//     })
// });


// export const subscribe = (callback: () => void) => {
//     callbacks.push(callback);
// }

// export const unsubscribe = () => {
// }