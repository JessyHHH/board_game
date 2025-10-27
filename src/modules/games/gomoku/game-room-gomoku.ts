import { MESSAGE_TYPE } from '../../common/common-type';
import { ClientConnection } from '../../ws/client-connection';
import { ClientManager } from '../../ws/client-connection-manager';
import { GameRoom } from '../game-room';
import { Player, PLAYER_ID } from './player';
import { shuffle } from 'lodash';
import { Board } from '../../gomoku/entities/board.entity';

const TOTAL_COUNTDOWN_TIME = 600; // 总倒计时时间(秒)
const COUNTDOWN_INTERVAL = 15; // 倒计时间隔时间(秒)

export class GameRoomGomoku extends GameRoom {
    private board: Board;
    public players: Player[] = [];

    private timer: NodeJS.Timeout;

    public constructor(roomId: string, clients: ClientConnection[]) {
        super(roomId, clients);
        this.initialize();
        this.board = new Board();
    }

    public initialize(): void {
        console.log('initialize');

        if (this.clients.length !== 2) {
            throw new Error('gomoku room must have 2 clients');
        }

        const randomClients = shuffle(this.clients);
        const player0 = new Player(PLAYER_ID.BLACK, randomClients[0], true, TOTAL_COUNTDOWN_TIME, COUNTDOWN_INTERVAL);
        const player1 = new Player(PLAYER_ID.WHITE, randomClients[1], false, TOTAL_COUNTDOWN_TIME, COUNTDOWN_INTERVAL);

        this.players.push(player0, player1);

        console.log('this.players', this.players);
    }
    //房间里准备就绪
    public join(clientConnection: ClientConnection): void {
        console.log('this.players', this.players);

        for (const player of this.players) {
            if (player.getUserId() === clientConnection.getUserId()) {
                player.setReady();
            }
        }

        if (this.players.every((player) => player.isReady())) {
            this.startGame();
        }
    }

    public startGame(): void {
        this.timer = setInterval(this.onInterval.bind(this), 1000);

        for (const player of this.players) {
            ClientManager.sendMessage(player.getUserId(), {
                type: MESSAGE_TYPE.GAME_START,
                data: {
                    players: this.players.map((player) => player.toJson()),
                },
            });
        }
    }

    // 每秒调一次
    private onInterval() {
        for (const player of this.players) {
            if (player.getCurrentRound()) {
                player.decrCountDownRound();
                if (player.isCountDownOver()) {
                    const opponentPlayer = this.players.find((p) => p.getPlayerId() !== player.getPlayerId());
                    if (opponentPlayer) {
                        this.gameOver(opponentPlayer);
                    }
                }

                break;
            }
        }
    }

    public handleInput(clientConnection: ClientConnection, input: any) {
        console.log('handleInput', input);
        const currentPlayer = this.getPlayerByUserId(clientConnection.getUserId());

        if (!currentPlayer) {
            console.log('currentPlayer not found');
            return;
        }

        if (input.gameType === 'move') {
            this.board.placeStone(input.data.x, input.data.y, currentPlayer!.getPlayerId());

            this.players[0].setCurrentRound(!this.players[0].getCurrentRound());
            this.players[1].setCurrentRound(!this.players[1].getCurrentRound());

            for (const player of this.players) {
                ClientManager.sendMessage(player.getUserId(), {
                    type: 'move',
                    data: {
                        input: {
                            player: currentPlayer,
                            x: input.data.x,
                            y: input.data.y,
                        },
                        players: this.players.map((player) => player.toJson()),
                    },
                });
            }
            this.handleGameOver(clientConnection, input);
        }
    }

    private handleGameOver(clientConnection: ClientConnection, input: any) {
        const currentPlayer = this.getPlayerByUserId(clientConnection.getUserId());
        //胜利条件
        if (this.board.checkWin(input.data.x, input.data.y, currentPlayer!.getPlayerId())) {
            this.gameOver(currentPlayer!);
        }

        //检查平局
        if (this.board.isFull()) {
            if (this.timer) {
                clearInterval(this.timer);
            }
            for (const player of this.players) {
                ClientManager.sendMessage(player.getUserId(), {
                    type: MESSAGE_TYPE.GAME_OVER,
                    data: {
                        roomId: this.getRoomId(),
                        gameOver: {
                            winner: null,
                            loser: null,
                            draw: true,
                        },
                        board: this.board.getState(),
                    },
                });
            }
            console.log('游戏结束！平局！');
        }
    }

    private gameOver(winner: Player) {
        if (this.timer) {
            clearInterval(this.timer);
        }
        const loser = this.players.find((player) => player.getPlayerId() !== winner.getPlayerId());
        for (const player of this.players) {
            ClientManager.sendMessage(player.getUserId(), {
                type: MESSAGE_TYPE.GAME_OVER,
                data: {
                    roomId: this.getRoomId(),
                    gameOver: {
                        winner: winner!.getPlayerId(),
                        loser: loser!.getPlayerId(),
                    },
                    board: this.board.getState(),
                },
            });
        }
        console.log(`游戏结束！玩家${winner!.getPlayerId()}获胜！`);
    }

    private getPlayerByUserId(userId: number) {
        return this.players.find((player) => player.getUserId() === userId);
    }
}
