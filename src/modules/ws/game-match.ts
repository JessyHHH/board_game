import { GAME_IDS, MESSAGE_TYPE } from '../common/common-type';
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

        if (matchingSet.length > 0) {
            const opponentUserId = matchingSet.pop();
            ClientManager.getClient(opponentUserId!);

            ClientManager.sendMessage(clientConnection.getUserId()!, {
                type: MESSAGE_TYPE.GAME_MATCHED,
                data: {
                    gameId,
                },
            });

            ClientManager.sendMessage(opponentUserId!, {
                type: MESSAGE_TYPE.GAME_MATCHED,
                data: {
                    gameId,
                },
            });
        } else {
            matchingSet.push(clientConnection.getUserId());
        }
    }
}

export const GameMatch = new G_GameMatch();
