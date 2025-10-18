export enum playerColor {
    BLACK = 'black',
    WHITE = 'white',
}

export class Player {
    constructor(
        private readonly socketId: string,
        private readonly color: playerColor,
        private readonly pieceType: number,
    ) {}

    public getSocketId(): string {
        return this.socketId;
    }

    public getColor(): playerColor {
        return this.color;
    }

    public getPieceType(): number {
        return this.pieceType;
    }

    public isBlack(): boolean {
        return this.pieceType === 0;
    }
}
