import { GAME_IDS, MESSAGE_TYPE } from '../common/common-type';
import { ClientConnection } from './client-connection';
import { $enum } from 'ts-enum-util';
import { GameMatch } from './game-match';

export class G_MessageHandler {
    public async handle(clientConnection: ClientConnection, data: any) {
        try {
            const { type, params } = this.validate(data);

            switch (type) {
                case MESSAGE_TYPE.GAME_MATCH:
                    GameMatch.addMatch(clientConnection, params.gameId);
                    break;
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

        return { type: data.type, params: data.params };
    }
}

export const MessageHandler = new G_MessageHandler();
