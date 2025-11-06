import { GAME_IDS } from '../../common/common-type';
import { ClientConnection } from '../../ws/client-connection';
import { v4 as uuidv4 } from 'uuid';
import { GameRoom } from './game-room';
import { GameRoomGomoku } from '../gomoku/game-room-gomoku';

export class G_GameRoomManager {
    private rooms: Map<string, GameRoom> = new Map();
    //创建房间，创建一个roomId，根据游戏类型创建不同的游戏房间
    public createRoom(gameId: GAME_IDS, userIds: number[]) {
        const roomId = uuidv4();
        if (gameId === GAME_IDS.GOMOKU) {
            const gameRoom = new GameRoomGomoku(roomId, userIds, {});
            this.rooms.set(roomId, gameRoom);

            return gameRoom;
        }

        throw new Error(`unknown game id: ${gameId}`);
    }

    public joinRoom(roomId: string, clientConnection: ClientConnection) {
        const gameRoom = this.rooms.get(roomId);
        if (!gameRoom || !gameRoom.isActive) {
            throw new Error(`room not found or not active: ${roomId}`);
        }

        gameRoom.join(clientConnection.getUserId()!);
    }

    public handleInput(clientConnection: ClientConnection, roomId: string, input: any) {
        const gameRoom = this.rooms.get(roomId);
        if (!gameRoom || !gameRoom.isActive) {
            throw new Error(`room not found or not active: ${roomId}`);
        }

        gameRoom.handleInput(clientConnection.getUserId(), input);
    }

    public deleteRoom(roomId: string) {
        this.rooms.delete(roomId);
    }
}

export const GameRoomManager = new G_GameRoomManager();
