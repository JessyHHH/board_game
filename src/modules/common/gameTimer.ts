export class Player {
    public socketId: string;
    public userId: number;

    private isCurrentRound: boolean = false;
    private countdown = 600;

    public onInterval() {
        if (this.isCurrentRound) {
            this.countdown--;
        }
    }

    public isTimeOut() {
        return this.countdown <= 0;
    }

    public setCurrentRound(isCurrentRound: boolean) {
        this.isCurrentRound = isCurrentRound;
        if (isCurrentRound) {
            this.countdown = 600;
        }
    }

    public getCountdown() {
        return this.countdown;
    }
}

export class Game {
    private timerId: NodeJS.Timeout;
    private players: Player[] = [];
    private isFinished: boolean = false;
    private winnerPlayer: Player | null = null;

    public startGame(players: Player[]) {
        this.players = players;
        this.isFinished = false;

        this.timerId = setInterval(() => {
            this.onInterval();
        }, 1000);
    }

    // 每秒触发一次
    private onInterval() {
        if (this.isFinished) {
            return;
        }

        for (const player of this.players) {
            player.onInterval();

            if (player.isTimeOut()) {
                this.gameOver(this.getAnotherPlayer(player)!);
            }
        }
    }

    public gameOver(winnerPlayer: Player) {
        this.isFinished = true;
        this.winnerPlayer = winnerPlayer;

        if (this.timerId) {
            clearInterval(this.timerId);
        }
    }

    private getAnotherPlayer(player: Player) {
        return this.players.find((p) => p.userId !== player.userId);
    }

    public getWinnerPlayer(): Player | null {
        return this.winnerPlayer;
    }

    public isGameFinished(): boolean {
        return this.isFinished;
    }
}
