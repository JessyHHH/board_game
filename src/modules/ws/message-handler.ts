import { GAME_IDS, MESSAGE_TYPE } from '../common/common-type';
import { ClientConnection } from './client-connection';
import { $enum } from 'ts-enum-util';
import { GameMatch } from './game-match';
import { GameRoomManager } from '../games/gameRoom/game-room-manager';

export class G_MessageHandler {
    public async handle(clientConnection: ClientConnection, data: any) {
        try {
            const { type, params } = this.validate(data);

            switch (type) {
                case MESSAGE_TYPE.GAME_MATCH:
                    GameMatch.addMatch(clientConnection, params.gameId);
                    break;
                case MESSAGE_TYPE.GAME_JOIN_ROOM:
                    GameRoomManager.joinRoom(params.roomId, clientConnection);
                    break;
                case MESSAGE_TYPE.GAME_INPUT:
                    GameRoomManager.handleInput(clientConnection, params.roomId, params);
                    break;
                // case MESSAGE_TYPE.GOMOKU_GAME_OVER:
                //     GameRoomManager.handleGameOver(params.roomId, params.gameOver);
                //     break;
                default:
                    throw new Error(`unknown message type: ${type}`);
            }
        } catch (error) {
            console.error('[MessageHandler] handle message error', error);

            // ignore
        }
    }

    /**
     * @param data
     * {
     *      type,
     *      data,
     * }
     */
    private validate(data: any) {
        if (!data.type || !$enum(MESSAGE_TYPE).isValue(data.type)) {
            throw new Error('type is required');
        }

        if (data.type === MESSAGE_TYPE.GAME_MATCH) {
            if (!data.params.gameId || !$enum(GAME_IDS).isValue(data.params.gameId)) {
                throw new Error('gameId is required');
            }
        }

        if (data.type === MESSAGE_TYPE.GAME_JOIN_ROOM) {
            if (!data.params.roomId) {
                throw new Error('roomId is required');
            }
        }

        return { type: data.type, params: data.params };
    }
}

export const MessageHandler = new G_MessageHandler();
