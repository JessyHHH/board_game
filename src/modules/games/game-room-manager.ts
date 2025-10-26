import { GAME_IDS } from '../common/common-type';
import { ClientConnection } from '../ws/client-connection';
import { v4 as uuidv4 } from 'uuid';
import { GameRoom } from './game-room';
import { GameRoomGomoku } from './gomoku/game-room-gomoku';

export class G_GameRoomManager {
    private rooms: Map<string, GameRoom> = new Map();

    public createRoom(gameId: GAME_IDS, clients: ClientConnection[]) {
        const roomId = uuidv4();
        if (gameId === GAME_IDS.GOMOKU) {
            const gameRoom = new GameRoomGomoku(roomId, clients);
            this.rooms.set(roomId, gameRoom);

            console.log('gameRoom created', gameRoom.players);

            return gameRoom;
        }

        throw new Error(`unknown game id: ${gameId}`);
    }

    public joinRoom(roomId: string, clientConnection: ClientConnection) {
        const gameRoom = this.rooms.get(roomId);
        console.log('gameRoom', gameRoom);

        if (!gameRoom) {
            throw new Error(`room not found: ${roomId}`);
        }

        gameRoom.join(clientConnection);
    }

    public handleInput(clientConnection: ClientConnection, roomId: string, input: any) {
        const gameRoom = this.rooms.get(roomId);
        if (!gameRoom) {
            throw new Error(`room not found: ${roomId}`);
        }

        gameRoom.handleInput(clientConnection, input);
    }
}

export const GameRoomManager = new G_GameRoomManager();
