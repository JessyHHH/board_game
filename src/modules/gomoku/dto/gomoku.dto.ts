export class MoveDto {
    x: number;
    y: number;
}

export interface GameStartData {
    gameId: string;
    yourColor: string;
    yourTurn: boolean;
    opponent: string;
}

export interface MoveResultData {
    x: number;
    y: number;
    board: (number | null)[][];
    currentPlayer: number;
}

export interface GameOverData {
    winner: string;
    board: (number | null)[][];
}
