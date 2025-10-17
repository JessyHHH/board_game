export class MoveDto {
    x: number;
    y: number;
}

export enum GameStatus {
    WAITING = 'waiting',
    PLAYING = 'playing',
    FINISHED = 'finished',
}

export enum PieceType {
    BLACK = 'black',
    WHITE = 'white',
}

export interface GameResult {
    winner: PieceType | 'draw';
    winningLine?: { row: number; col: number }[];
}