import { ClientConnection } from '../../ws/client-connection';

export enum PLAYER_ID {
    BLACK,
    WHITE,
}

export class Player {
    constructor(
        private readonly playerId: PLAYER_ID,
        private readonly clientConnection: ClientConnection,
        private isCurrentRound: boolean, // 是否当前回合
        private countdown: number, // 倒计时(秒)
        private ready: boolean = false,
    ) {}

    public getUserId(): number {
        return this.clientConnection.getUserId();
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
    }

    public getCurrentRound(): boolean {
        return this.isCurrentRound;
    }

    public toJson() {
        return {
            playerId: this.playerId,
            countdown: this.countdown,
            isCurrentRound: this.isCurrentRound,
            user: this.clientConnection.getUserEntity(),
        };
    }
}
