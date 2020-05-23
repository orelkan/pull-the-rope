import { Socket } from 'socket.io';

export interface GameSocket extends Socket {
    roomId: string | undefined;
    inLobby: boolean;
};

export type GameSockets = Record<string, GameSocket>;

export interface Room {
    name: string,
    id: string,
    playersId: string[]
    roomOwner: string;
};

export type Rooms =  Record<string, Room>;
