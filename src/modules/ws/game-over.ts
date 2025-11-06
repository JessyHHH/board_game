import { MESSAGE_TYPE } from '../common/common-type';
import { GameRoom } from '../games/gameRoom/game-room';
import { ClientConnection } from './client-connection';
import { ClientManager } from './client-connection-manager';

//处理胜利检测并发送事件到前端websocket
/**
 * 接收前端棋子位置消息，并根据棋子位置判断胜利，当胜利后下发胜利消息到前端websocket  
 * 参数：{
    type: MESSAGE_TYPE.GAME_OVER,
    params: {
        roomId: string,
        gameOver: {
            winner: number,
            loser: number,
        },
    },
}
 */

/*
前端会下发
type: 'game-input',
                params: {
                    roomId: Global.roomId,
                    gameType: 'move',
                    data: {
                        x,
                        y,
                    },
*/
export class G_GameOver {
    public async handle(clientConnection: ClientConnection, data: any) {
        //如果没赢也没输，则返回
        if (data.winner === null && data.loser === null) {
            return;
        }

        ClientManager.sendMessage(clientConnection.getUserId()!, {
            type: MESSAGE_TYPE.GAME_OVER,
            data: {
                roomId: data.roomId,
                gameOver: {
                    winner: data.winner,
                    loser: data.loser,
                },
            },
        });
    }
}
