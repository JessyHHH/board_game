import { Board } from '../entities/board.entity';
import { Player, playerColor } from './player';
import { GenerateGameID } from '../../common/generateGameID';
import { MoveResult } from '../../common/moveResult';

export class Game {
    private readonly id: string;
    private readonly player: [Player, Player];
    private readonly board: Board;
    private currentPlayer: number = 0;
    private isFinished: boolean = false;

    constructor(player1: Player, player2: Player) {
        this.id = GenerateGameID.generateGameId(player1.getSocketId(), player2.getSocketId());
        this.board = new Board();
        this.player = [player1, player2];
    }

    //下棋
    public makeMove(socketId: string, x: number, y: number): MoveResult {
        //游戏是否结束
        if (this.isFinished) {
            return {
                success: false,
                error: 'Game is finished',
            };
        }

        //验证是否当前玩家
        const currentPlayer = this.player[this.currentPlayer];
        if (currentPlayer.getSocketId() !== socketId) {
            return {
                success: false,
                error: 'Not current player turn',
            };
        }

        //在棋盘上放置棋子
        const placed = this.board.placeStone(x, y, currentPlayer.getPieceType());
        if (!placed) {
            return {
                success: false,
                error: 'Invalid move',
            };
        }

        //检查是否胜利
        if (this.board.checkWin(x, y, currentPlayer.getPieceType())) {
            this.isFinished = true;
            return {
                success: true,
                gameOver: true,
                winner: currentPlayer.getColor(),
            };
        }

        //检查是否平局(棋盘满了)
        if (this.board.isFull()) {
            return {
                success: true,
                gameOver: true,
                winner: 'draw',
            };
        }

        //切换玩家
        this.switchPlayer();
        return {
            success: true,
            currentPlayer: this.currentPlayer,
        };
    }
    //切换当前玩家
    private switchPlayer(): void {
        this.currentPlayer = 1 - this.currentPlayer;
    }

    //获取当前玩家
    public getCurrentPlayer(): Player {
        return this.player[this.currentPlayer];
    }

    //获取玩家
    public getPlayers(): [Player, Player] {
        return this.player;
    }

    //判断玩家是否存在
    public hasPlayer(socketId: string): boolean {
        return this.player.some((player) => player.getSocketId() === socketId);
    }

    //获取对手
    public getOpponent(socketId: string): Player | null {
        // 先检查这个玩家是否在游戏中
        if (!this.hasPlayer(socketId)) {
            return null;
        }

        return this.player.find((player) => player.getSocketId() !== socketId) || null;
    }

    //获取棋盘状态
    public getBoardState(): (number | null)[][] {
        return this.board.getState();
    }
    //获取游戏ID
    public getId(): string {
        return this.id;
    }

    //结束游戏
    public finish(): void {
        this.isFinished = true;
    }
}
