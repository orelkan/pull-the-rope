import { Socket } from 'socket.io';

export interface GameSocket extends Socket {
    roomId: string;
    inLobby: boolean;
}

export interface Room {
    name: string,
    id: string,
    players: Socket[]
}
