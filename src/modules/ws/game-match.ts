import { GAME_IDS, MESSAGE_TYPE } from '../common/common-type';
import { GameRoomManager } from '../games/game-room-manager';
import { ClientConnection } from './client-connection';
import { ClientManager } from './client-connection-manager';

export class G_GameMatch {
    private matchingMap: Map<string, number[]> = new Map([[GAME_IDS.GOMOKU, []]]);

    public async addMatch(clientConnection: ClientConnection, gameId: GAME_IDS) {
        const matchingSet = this.matchingMap.get(gameId);
        //如果匹配集合不存在，则返回
        if (!matchingSet) {
            return;
        }

        if (matchingSet.includes(clientConnection.getUserId())) {
            return;
        }

        let matched = false;
        while (matchingSet.length > 0) {
            const opponentUserId = matchingSet.pop();
            const opponentClientConnection = ClientManager.getClient(opponentUserId!);
            if (!opponentClientConnection) {
                continue;
            }

            matched = true;
            const gameRoom = GameRoomManager.createRoom(gameId, [clientConnection, opponentClientConnection]);

            ClientManager.sendMessage(clientConnection.getUserId()!, {
                type: MESSAGE_TYPE.GAME_MATCHED,
                data: {
                    gameId,
                    roomId: gameRoom.getRoomId(),
                },
            });

            ClientManager.sendMessage(opponentUserId!, {
                type: MESSAGE_TYPE.GAME_MATCHED,
                data: {
                    gameId,
                    roomId: gameRoom.getRoomId(),
                },
            });
        }

        if (!matched) {
            matchingSet.push(clientConnection.getUserId());
        }
    }
}

export const GameMatch = new G_GameMatch();
