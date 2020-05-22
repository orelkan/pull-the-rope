import { Socket } from 'socket.io';

export interface GameSocket extends Socket {
    roomId: string;
    inLobby: boolean;
};

export type GameSockets = Record<string, GameSocket>;

export interface Room {
    name: string,
    id: string,
    playersId: string[]
};

export type Rooms =  Record<string, Room>;
