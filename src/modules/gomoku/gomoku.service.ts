import { Injectable } from '@nestjs/common';
import { GameStartData } from './dto/gomoku.dto';
import { Game } from './entities/game.entity';
import { MatchMaker, MatchResult } from './entities/match-maker.entity';
import { Player, playerColor } from './entities/player.entity';
import { MoveResult } from '../common/moveResult';

@Injectable()
export class GomokuService {
    private readonly games = new Map<string, Game>();
    private readonly matchMaker = new MatchMaker();

    //匹配玩家
    public matchPlayer(socketId: string): { matched: boolean; game?: Game } {
        const result = this.matchMaker.addPlayer(socketId);
        if (!result.matched) {
            return { matched: false };
        }

        const player1 = new Player(result.opponent!, playerColor.BLACK, 0);
        const player2 = new Player(socketId, playerColor.WHITE, 1);
        const game = new Game(player1, player2);

        this.games.set(game.getId(), game);

        return { matched: true, game };
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
}
