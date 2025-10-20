import { playerColor } from '../gomoku/lib/player';

export interface MoveResult {
    success: boolean;
    error?: string;
    gameOver?: boolean;
    winner?: playerColor | 'draw';
    currentPlayer?: number;
}
