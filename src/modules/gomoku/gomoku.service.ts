import { Injectable } from '@nestjs/common';
import { GameStartData } from './dto/gomoku.dto';
import { Game } from './lib/game';
import { MatchMaker, MatchResult } from './entities/match-maker.entity';
import { Player, playerColor } from './lib/player';
import { MoveResult } from '../common/moveResult';
import { Game as GameTimer, Player as PlayerTimer } from '../common/gameTimer';
import { UsersService } from '../users/users.service';
import { Balance } from './lib/balance';

@Injectable()
export class GomokuService {
    private readonly games = new Map<string, Game>();
    private readonly matchMaker = new MatchMaker();
    private readonly gameTimers = new Map<string, GameTimer>();

    constructor(private readonly usersService: UsersService) {}
    //匹配玩家
    public matchPlayer(socketId: string, userId: number, opponentUserId: number): { matched: boolean; game?: Game } {
        const result = this.matchMaker.addPlayer(socketId);
        if (!result.matched) {
            return { matched: false };
        }

        const player1 = new Player(result.opponent!, playerColor.BLACK, 0, userId);
        const player2 = new Player(socketId, playerColor.WHITE, 1, opponentUserId);
        const game = new Game(player1, player2);

        this.games.set(game.getId(), game);

        this.createGameTimer(game.getId(), player1.getSocketId(), player2.getSocketId());

        return { matched: true, game };
    }

    private createGameTimer(gameId: string, player1SocketId: string, player2SocketId: string): void {
        const gameTimer = new GameTimer();
        this.gameTimers.set(gameId, gameTimer);

        //创建计时器玩家
        const timerPlayer1 = new PlayerTimer();
        timerPlayer1.socketId = player1SocketId;
        timerPlayer1.userId = 0;

        const timerPlayer2 = new PlayerTimer();
        timerPlayer2.socketId = player2SocketId;
        timerPlayer2.userId = 1;

        gameTimer.startGame([timerPlayer1, timerPlayer2]);

        //设置初始回合
        timerPlayer1.setCurrentRound(true);
        timerPlayer2.setCurrentRound(false);
    }

    //取消匹配
    public cancelMatch(socketId: string): void {
        this.matchMaker.removePlayer(socketId);
    }

    //下棋
    public makeMove(socketId: string, x: number, y: number) {
        const game = this.games.get(socketId);
        if (!game) {
            return { success: false, error: 'Game not found' };
        }

        return game.makeMove(socketId, x, y);
    }

    //处理断开连接
    public handleDisconnect(socketId: string): string | null {
        this.matchMaker.removePlayer(socketId);

        const game = this.findGameByPlayer(socketId);
        if (game) {
            const opponent = game.getOpponent(socketId);
            this.games.delete(game.getId());
            return opponent?.getSocketId() || null;
        }

        return null;
    }

    //查找游戏
    public findGameByPlayer(socketId: string): Game | undefined {
        return Array.from(this.games.values()).find((game) => game.hasPlayer(socketId));
    }

    //处理游戏结束时的余额转账（与balance有关）
    public async handleGameEnd(winnerId: string, loserId: string): Promise<void> {
        const game = this.findGameByPlayer(winnerId);
        if (!game) {
            return;
        }

        //获取赢家和输家
        const [player1, player2] = game.getPlayers();
        const winner = player1.getSocketId() === winnerId ? player1 : player2;
        const loser = player1.getSocketId() === loserId ? player1 : player2;

        try {
            await Balance.win(winner, loser, this.usersService.getUserRepository());
        } catch (error) {
            console.error('Error handling game end:', error);
        }
    }
}
