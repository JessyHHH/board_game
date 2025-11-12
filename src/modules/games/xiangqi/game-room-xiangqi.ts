import { GameRoom } from '../gameRoom/game-room';
import { Player } from './player';
import { Board } from '../xiangqi/lib/board.entity';
import { shuffle } from 'lodash';
import { PLAYER_ID } from './lib/xiangqi-id';
import { GAME_IDS, MESSAGE_TYPE } from '../../common/common-type';
import { CheckWin } from './lib/checkWin';

const TOTAL_COUNTDOWN_TIME = 600; // 总倒计时时间(秒)
const COUNTDOWN_INTERVAL = 15; // 倒计时间隔时间(秒)

enum GAME_TYPE {
    MOVE = 'move',
}

interface IOptions {
    disableTimer?: boolean;
    countDownInterval?: number;
    totalCountDownTime?: number;
}

export class GameRoomXiangqi extends GameRoom {
    private board: Board;
    private players: Player[] = [];
    private options: IOptions;
    private timer: NodeJS.Timeout;
    private checkWin: CheckWin;

    private isGameEnded: boolean = false;
    public constructor(roomId: string, userIds: number[], options: IOptions = {}) {
        super(roomId, userIds);

        if (userIds.length !== 2) {
            throw new Error('userIds must be 2');
        }

        this.options = options;
        this.board = new Board();
        this.checkWin = new CheckWin();
    }

    public startGame(): void {
        const randomUserIds = shuffle(this.joinedUserIds);
        const player0 = new Player(
            PLAYER_ID.RED,
            randomUserIds[0],
            true,
            this.options.totalCountDownTime || TOTAL_COUNTDOWN_TIME,
            this.options.countDownInterval || COUNTDOWN_INTERVAL,
        );
        const player1 = new Player(
            PLAYER_ID.BLACK,
            randomUserIds[1],
            false,
            this.options.totalCountDownTime || TOTAL_COUNTDOWN_TIME,
            this.options.countDownInterval || COUNTDOWN_INTERVAL,
        );

        this.players.push(player0, player1);

        player0.setReady();
        player1.setReady();

        //它本身就是布尔值
        if (!this.options.disableTimer) {
            this.timer = setInterval(this.onInterval.bind(this), 1000);
        }

        this.broadcastMessage({
            type: MESSAGE_TYPE.GAME_START,
            data: {
                players: this.players.map((player) => player.toJson()),
            },
        });
    }

    public handleInput(userId: number, input: any): void {
        console.log('handleInput', input);
        const currentPlayer = this.getPlayerByUserId(userId);
        if (this.isGameEnded) {
            console.log('游戏已结束');
            return;
        }

        if (!currentPlayer) {
            console.error('currentPlayer not found');
            return;
        }

        if (input.gameType === GAME_TYPE.MOVE) {
            const isMoveSuccess = this.board.movePiece(
                input.data.fromX,
                input.data.fromY,
                input.data.toX,
                input.data.toY,
                currentPlayer!.getPlayerId(),
            );
            if (!isMoveSuccess) {
                console.log('移动失败');
                return;
            }

            this.setPlayerCurrentRound(this.getOpponentPlayerByUserId(currentPlayer!.getUserId())!);

            this.broadcastMessage({
                type: GAME_TYPE.MOVE,
                data: {
                    input: {
                        players: this.players.map((player) => player.toJson()),
                        fromX: input.data.fromX,
                        fromY: input.data.fromY,
                        toX: input.data.toX,
                        toY: input.data.toY,
                        player: currentPlayer.toJson(),
                    },
                },
            });

            // 检查对手是否被将死
            const opponentPlayer = this.getOpponentPlayerByUserId(currentPlayer!.getUserId());
            if (opponentPlayer && this.checkWin.checkGameOver(this.board, currentPlayer!.getPlayerId())) {
                this.gameOver(currentPlayer!);
                return;
            }
        }
    }

    // public onInterval(): void {
    //     for (const player of this.players) {
    //         if (!player.getCurrentRound()) {
    //             continue;
    //         }
    //     }
    // }

    // 每秒调一次
    public onInterval() {
        for (const player of this.players) {
            if (!player.getCurrentRound()) {
                continue;
            }

            player.decrCountDownRound();
            if (!player.isCountDownOver()) {
                continue;
            }

            const opponentPlayer = this.getOpponentPlayerByUserId(player.getUserId());
            if (opponentPlayer) {
                this.gameOver(opponentPlayer);
            }

            break;
        }
    }

    private gameOver(winner: Player | null) {
        this.stopTimer();

        this.broadcastMessage({
            type: MESSAGE_TYPE.GAME_OVER,
            data: {
                gameOver: {
                    winner: winner?.getPlayerId() ?? null,
                },
                board: this.board.getBoard(),
            },
        });

        const loser = winner ? this.getOpponentPlayerByUserId(winner.getUserId()) : null;

        this.messageQueueService.publish('game:results', {
            status: '0',
            data: {
                gameId: GAME_IDS.XIANGQI,
                roomId: this.roomId,
                winner: winner?.getUserId() ?? null,
                loser: loser?.getUserId() ?? null,
            },
        });

        this.isActive = false;
        this.destroy();
    }

    private stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
        }
    }

    private getPlayerByUserId(userId: number) {
        return this.players.find((player) => player.getUserId() === userId);
    }

    private getOpponentPlayerByUserId(userId: number) {
        return this.players.find((player) => player.getUserId() !== userId);
    }

    private handleGameOver(gameResult: any): void {
        this.isGameEnded = true;

        if (this.timer) {
            clearInterval(this.timer);
        }

        this.broadcastMessage({
            type: MESSAGE_TYPE.GAME_OVER,
            data: {
                gameOver: {
                    winner: gameResult.winner,
                },
            },
        });
    }

    private setPlayerCurrentRound(player: Player) {
        for (const p of this.players) {
            if (p.getPlayerId() !== player.getPlayerId()) {
                p.setCurrentRound(false);
            } else {
                p.setCurrentRound(true);
            }
        }
    }
}
