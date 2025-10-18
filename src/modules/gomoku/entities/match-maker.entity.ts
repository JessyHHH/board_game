export interface MatchResult {
    matched: boolean;
    opponent?: string;
}

export class MatchMaker {
    private waitingPlayer: string | null = null;

    //匹配玩家
    public addPlayer(socketId: string): MatchResult {
        if (!this.waitingPlayer) {
            this.waitingPlayer = socketId;
            return {
                matched: false,
            };
        }

        const opponent = this.waitingPlayer;
        this.waitingPlayer = null;
        return {
            matched: true,
            opponent,
        };
    }

    //移除玩家
    public removePlayer(socketId: string): void {
        if (this.waitingPlayer === socketId) {
            this.waitingPlayer = null;
        }
    }

    //判断玩家是否在等待
    public isWaiting(socketId: string): boolean {
        return this.waitingPlayer === socketId;
    }
}
