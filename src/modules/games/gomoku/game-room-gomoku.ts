import { MESSAGE_TYPE } from '../../common/common-type';
import { ClientConnection } from '../../ws/client-connection';
import { ClientManager } from '../../ws/client-connection-manager';
import { GameRoom } from '../game-room';
import { Player, PLAYER_ID } from './player';
import { shuffle } from 'lodash';

const TOTAL_COUNTDOWN_TIME = 600; // 总倒计时时间(秒)

export class GameRoomGomoku extends GameRoom {
    private board: (number | null)[][];

    public players: Player[] = [];

    public constructor(roomId: string, clients: ClientConnection[]) {
        super(roomId, clients);
        this.initialize();
        this.board = Array.from({ length: 15 }, () => Array(15).fill(null));
    }

    public initialize(): void {
        console.log('initialize');

        if (this.clients.length !== 2) {
            throw new Error('gomoku room must have 2 clients');
        }

        const randomClients = shuffle(this.clients);
        const player0 = new Player(PLAYER_ID.BLACK, randomClients[0], true, TOTAL_COUNTDOWN_TIME);
        const player1 = new Player(PLAYER_ID.WHITE, randomClients[1], false, TOTAL_COUNTDOWN_TIME);

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
        for (const player of this.players) {
            ClientManager.sendMessage(player.getUserId(), {
                type: MESSAGE_TYPE.GAME_START,
                data: {
                    players: this.players.map((player) => player.toJson()),
                },
            });
        }
    }

    public handleInput(clientConnection: ClientConnection, input: any) {
        console.log('handleInput', input);

        const currentPlayer = this.getPlayerByUserId(clientConnection.getUserId());
        if (input.gameType === 'move') {
            this.board[input.data.x][input.data.y] = currentPlayer!.getPlayerId();

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
        }
    }

    private getPlayerByUserId(userId: number) {
        return this.players.find((player) => player.getUserId() === userId);
    }
}
