import { GAME_IDS, MESSAGE_TYPE } from '../../common/common-type';
import { GameRoom } from '../gameRoom/game-room';
import { Player } from './player';
import { PLAYER_ID } from './lib/gomoku-Id';
import { shuffle } from 'lodash';
import { Board } from './lib/board.entity';

enum GAME_TYPE {
    MOVE = 'move',
}

const TOTAL_COUNTDOWN_TIME = 600; // 总倒计时时间(秒)
const COUNTDOWN_INTERVAL = 15; // 倒计时间隔时间(秒)

interface IOptions {
    disableTimer?: boolean;
    countDownInterval?: number;
    totalCountDownTime?: number;
}

export class GameRoomGomoku extends GameRoom {
    private board: Board;
    private players: Player[] = [];
    private options: IOptions;
    private timer: NodeJS.Timeout;

    public constructor(roomId: string, userIds: number[], options: IOptions = {}) {
        super(roomId, userIds);

        if (userIds.length !== 2) {
            throw new Error('userIds must be 2');
        }

        this.options = options;
        this.board = new Board();
    }

    public startGame(): void {
        const randomUserIds = shuffle(this.joinedUserIds);
        const player0 = new Player(
            PLAYER_ID.BLACK,
            randomUserIds[0],
            true,
            this.options.totalCountDownTime || TOTAL_COUNTDOWN_TIME,
            this.options.countDownInterval || COUNTDOWN_INTERVAL,
        );
        const player1 = new Player(
            PLAYER_ID.WHITE,
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

    public handleInput(userId: number, input: any) {
        console.log('handleInput', input);
        const currentPlayer = this.getPlayerByUserId(userId);

        if (!currentPlayer) {
            console.error('currentPlayer not found');
            return;
        }

        if (input.gameType === GAME_TYPE.MOVE) {
            //检查如果input.data.x和input.data.y重复输入，防御性编程
            if (!this.board.isEmptyState(input.data.x, input.data.y)) {
                console.log('重复输入');
                return;
            }

            this.board.placeStone(input.data.x, input.data.y, currentPlayer!.getPlayerId());

            this.setPlayerCurrentRound(this.getOpponentPlayerByUserId(currentPlayer!.getUserId())!);

            this.broadcastMessage({
                type: GAME_TYPE.MOVE,
                data: {
                    input: {
                        players: this.players.map((player) => player.toJson()),
                        x: input.data.x,
                        y: input.data.y,
                        player: currentPlayer.toJson(),
                    },
                },
            });

            // 胜利条件
            if (this.board.checkWin(input.data.x, input.data.y, currentPlayer!.getPlayerId())) {
                this.gameOver(currentPlayer!);
                return;
            }

            //检查平局
            if (this.board.isFull()) {
                this.gameOver(null);
                return;
            }
        }
    }

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
                board: this.board.getState(),
            },
        });

        const loser = winner ? this.getOpponentPlayerByUserId(winner.getUserId()) : null;

        this.messageQueueService.publish('game:results', {
            status: '0',
            data: {
                gameId: GAME_IDS.GOMOKU,
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
