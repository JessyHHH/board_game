import { PLAYER_ID } from './lib/gomoku-Id';

export class Player {
    constructor(
        private readonly playerId: PLAYER_ID,
        private readonly userId: number,
        private isCurrentRound: boolean, // 是否当前回合
        private countdown: number, // 倒计时(秒)
        private countdownRound: number, // 单回合倒计时(秒)
        private ready: boolean = false,
    ) {}

    public getUserId(): number {
        return this.userId;
    }

    public setReady(): void {
        this.ready = true;
    }

    public isReady(): boolean {
        return this.ready;
    }

    public getPlayerId(): PLAYER_ID {
        return this.playerId;
    }

    public setCurrentRound(isCurrentRound: boolean): void {
        this.isCurrentRound = isCurrentRound;

        if (isCurrentRound) {
            this.countdownRound = 15;
        }
    }

    public decrCountDownRound(): void {
        this.countdown--;
        this.countdownRound--;
    }

    public getCurrentRound(): boolean {
        return this.isCurrentRound;
    }

    public setCountDown(countdown: number) {
        this.countdown = countdown;
    }

    public isCountDownOver(): boolean {
        return this.countdown <= 0 || this.countdownRound <= 0;
    }

    public getCountDown(): number {
        return this.countdown;
    }

    public toJson() {
        return {
            playerId: this.playerId,
            countdown: this.countdown,
            countdownRound: this.countdownRound,
            isCurrentRound: this.isCurrentRound,
            userId: this.userId,
        };
    }
}
