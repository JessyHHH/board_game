import { Injectable } from '@nestjs/common';
import { GomokuHelper } from '../common/gomoku.helper';

//不使用mysql和redis，存在进程
interface Game {
    id: string;
    player: string[]; //player1和player2的socketId
    board: (number | null)[][]; // 0=黑棋, 1=白棋, null=空
    currentPlayer: number; // 0=黑棋, 1=白棋,表示到谁下棋了
}

@Injectable()
export class GomokuService {
    private games = new Map<string, Game>();
    private waiting: string | null = null;

    //匹配
    public async matchPlayer(socketId: string) {
        if (!this.waiting) {
            this.waiting = socketId;
            return { matched: false };
        }

        const game = this.createGame(this.waiting, socketId);
        this.games.set(game.id, game);
        this.waiting = null;
        return { matched: true, gameId: game.id };
    }

    private createGame(player1: string, player2: string): Game {
        const game: Game = {
            id: GomokuHelper.generateGameId(player1, player2),
            player: [player1, player2],
            board: GomokuHelper.createEmptyBoard(),
            currentPlayer: 0,
        };
        this.games.set(game.id, game);
        return game;
    }
    //下棋
    public async makeMove(socketId: string, x: number, y: number) {
        const game = this.findGame(socketId);
        if (!game) {
            return { success: false, error: 'Game not found' };
        }

        const playerIndex = game.player.indexOf(socketId);
        if (playerIndex === -1) {
            return { success: false, error: 'Invalid player' };
        }

        if (!GomokuHelper.isValidMove(game.board, x, y)) {
            return { success: false, error: 'Invalid move' };
        }

        if (GomokuHelper.checkWin(game.board, x, y, playerIndex)) {
            return { success: true, winner: playerIndex, gameOver: true };
        }

        if (GomokuHelper.isBoardFull(game.board)) {
            return { success: true, winner: null, gameOver: true };
        }

        //换人
        game.currentPlayer = 1 - game.currentPlayer;
        return { success: true, currentPlayer: game.currentPlayer };
    }

    private findGame(socketId: string): Game | undefined {
        return Array.from(this.games.values()).find((game) => game.player.includes(socketId));
    }
    //断开连接
    public async handleDisconnect(socketId: string) {
        if (this.waiting === socketId) {
            this.waiting = null;
        }

        //删除游戏
        for (const [id, game] of this.games.entries()) {
            if (game.player.includes(socketId)) {
                this.games.delete(id);
                return game.player.find((p) => p !== socketId) || null;
            }
        }
        return null;
    }

    public async cancelMatch(socketId: string) {
        if (this.waiting === socketId) {
            this.waiting = null;
        }
    }
}
